package com.mecnun.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.mecnun.common.config.MecnunProperties;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;

/**
 * Verifies a Google ID token that the mobile app obtained from Google Sign-In.
 *
 * The app never sends us a password or an authorization code — it hands over the signed ID token
 * and we check it. That means no client secret is involved anywhere in this flow.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GoogleTokenVerifier {

    private final MecnunProperties props;

    private GoogleIdTokenVerifier verifier;

    @PostConstruct
    void init() {
        if (!props.getGoogle().isEnabled()) {
            log.warn("GOOGLE_CLIENT_ID qurulmayıb — Google ilə giriş söndürülüb");
            return;
        }
        verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                // Audience check is the part that matters: a token minted for someone else's app
                // is perfectly valid and signed by Google, and would otherwise be accepted here.
                .setAudience(Collections.singletonList(props.getGoogle().getClientId()))
                .build();
        log.info("Google ilə giriş aktivdir");
    }

    public boolean isEnabled() {
        return verifier != null;
    }

    /**
     * @return the verified identity, or null when the token is invalid, expired, or issued for
     *         another audience
     */
    public GoogleIdentity verify(String idToken) {
        if (verifier == null || idToken == null || idToken.isBlank()) {
            return null;
        }
        try {
            GoogleIdToken token = verifier.verify(idToken);
            if (token == null) {
                return null;
            }
            GoogleIdToken.Payload payload = token.getPayload();

            // An unverified e-mail must not be trusted for account linking: it would let someone
            // claim an address they do not control and take over an existing account.
            boolean emailVerified = Boolean.TRUE.equals(payload.getEmailVerified());

            return new GoogleIdentity(
                    payload.getSubject(),
                    payload.getEmail(),
                    emailVerified,
                    (String) payload.get("name"));
        } catch (Exception ex) {
            log.warn("Google ID token yoxlanmadı", ex);
            return null;
        }
    }

    public record GoogleIdentity(String subject, String email, boolean emailVerified, String name) {
    }
}
