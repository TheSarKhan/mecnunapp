package com.mecnun.ads;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.mecnun.common.config.MecnunProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

/**
 * Verifies AdMob rewarded-ad server-side verification callbacks.
 *
 * How SSV actually works — worth stating because it is easy to get wrong:
 *
 * - Google publishes the public keys; you do not configure one. Each callback names the key it
 *   used via {@code key_id}, and keys rotate, so the set is fetched and cached.
 * - The signed content is the raw query string from the first parameter up to, but excluding,
 *   {@code &signature=}. It must be taken verbatim from the request line — re-encoding decoded
 *   parameters changes the bytes and every signature fails.
 * - The signature is base64url, usually without padding, wrapping a DER ECDSA signature.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdMobSsvVerifier {

    private static final String SIGNATURE_PARAM = "&signature=";
    /** Keys rotate rarely; this bounds how long a removed key stays trusted. */
    private static final Duration KEY_CACHE_TTL = Duration.ofHours(24);

    private final MecnunProperties props;
    private final AtomicReference<CachedKeys> cache = new AtomicReference<>();

    private RestClient http;

    private RestClient http() {
        if (http == null) {
            var factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(Duration.ofSeconds(5));
            factory.setReadTimeout(Duration.ofSeconds(10));
            http = RestClient.builder().requestFactory(factory).build();
        }
        return http;
    }

    /**
     * @param queryString the raw query string exactly as received
     * @return true when the callback is genuinely from Google
     */
    public boolean verify(String queryString) {
        if (!props.getAdmob().isSsvVerificationEnabled()) {
            log.warn("AdMob SSV imza yoxlaması SÖNDÜRÜLÜB — yalnız lokal test üçün");
            return true;
        }
        if (queryString == null || queryString.isBlank()) {
            return false;
        }

        int signatureIndex = queryString.indexOf(SIGNATURE_PARAM);
        if (signatureIndex < 0) {
            log.warn("AdMob SSV çağırışında signature parametri yoxdur");
            return false;
        }

        String signedContent = queryString.substring(0, signatureIndex);
        Map<String, String> tail = parseParams(queryString.substring(signatureIndex + 1));
        String signature = tail.get("signature");
        String keyId = tail.get("key_id");

        if (signature == null || keyId == null) {
            log.warn("AdMob SSV çağırışında signature və ya key_id yoxdur");
            return false;
        }

        PublicKey key = findKey(keyId, false);
        if (key == null) {
            // A new key can appear before the cache expires, so refresh once before giving up.
            key = findKey(keyId, true);
        }
        if (key == null) {
            log.warn("AdMob SSV: key_id {} Google-un açar siyahısında tapılmadı", keyId);
            return false;
        }

        try {
            Signature verifier = Signature.getInstance("SHA256withECDSA");
            verifier.initVerify(key);
            verifier.update(signedContent.getBytes(StandardCharsets.UTF_8));
            boolean valid = verifier.verify(decodeBase64Url(signature));
            if (!valid) {
                log.warn("AdMob SSV imzası uyğun gəlmədi (key_id {})", keyId);
            }
            return valid;
        } catch (Exception ex) {
            log.warn("AdMob SSV imzasını yoxlamaq alınmadı", ex);
            return false;
        }
    }

    private PublicKey findKey(String keyId, boolean forceRefresh) {
        CachedKeys cached = cache.get();
        if (forceRefresh || cached == null || cached.isExpired()) {
            cached = fetchKeys();
            if (cached == null) {
                return null;
            }
            cache.set(cached);
        }
        return cached.keys().get(keyId);
    }

    private CachedKeys fetchKeys() {
        try {
            VerifierKeys response = http().get()
                    .uri(props.getAdmob().getVerifierKeysUrl())
                    .retrieve()
                    .body(VerifierKeys.class);

            if (response == null || response.keys() == null || response.keys().isEmpty()) {
                log.warn("AdMob verifier açarları boş qayıtdı");
                return null;
            }

            Map<String, PublicKey> parsed = response.keys().stream()
                    .filter(k -> k.keyId() != null && k.pem() != null)
                    .collect(Collectors.toMap(
                            k -> String.valueOf(k.keyId()),
                            k -> parsePem(k.pem()),
                            (a, b) -> a));

            log.info("AdMob verifier açarları yükləndi: {} ədəd", parsed.size());
            return new CachedKeys(parsed, Instant.now().plus(KEY_CACHE_TTL));
        } catch (Exception ex) {
            log.warn("AdMob verifier açarlarını yükləmək alınmadı", ex);
            return null;
        }
    }

    private PublicKey parsePem(String pem) {
        try {
            String base64 = pem
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s", "");
            byte[] der = Base64.getDecoder().decode(base64);
            return KeyFactory.getInstance("EC").generatePublic(new X509EncodedKeySpec(der));
        } catch (Exception ex) {
            throw new IllegalStateException("AdMob verifier açarı oxunmadı", ex);
        }
    }

    /** AdMob omits base64url padding; Java's decoder requires it. */
    private byte[] decodeBase64Url(String value) {
        String padded = switch (value.length() % 4) {
            case 2 -> value + "==";
            case 3 -> value + "=";
            default -> value;
        };
        return Base64.getUrlDecoder().decode(padded);
    }

    private Map<String, String> parseParams(String query) {
        return java.util.Arrays.stream(query.split("&"))
                .map(pair -> pair.split("=", 2))
                .filter(parts -> parts.length == 2)
                .collect(Collectors.toMap(p -> p[0], p -> p[1], (a, b) -> a));
    }

    private record CachedKeys(Map<String, PublicKey> keys, Instant expiresAt) {
        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record VerifierKeys(List<Key> keys) {

        @JsonIgnoreProperties(ignoreUnknown = true)
        record Key(Object keyId, String pem, String base64) {
        }
    }
}
