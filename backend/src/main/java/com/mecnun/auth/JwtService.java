package com.mecnun.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

/**
 * Minimal HS256 token issuing/parsing. Real OTP/SMS auth comes later —
 * for now the subject is the user id and the only claim that matters is "typ".
 */
@Service
public class JwtService {

    private static final String TYPE_ACCESS = "access";
    private static final String TYPE_REFRESH = "refresh";

    private final SecretKey key;
    private final long accessTtlSeconds;
    private final long refreshTtlSeconds;

    public JwtService(@Value("${mecnun.jwt.secret}") String secret,
                      @Value("${mecnun.jwt.access-ttl-seconds}") long accessTtlSeconds,
                      @Value("${mecnun.jwt.refresh-ttl-seconds}") long refreshTtlSeconds) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTtlSeconds = accessTtlSeconds;
        this.refreshTtlSeconds = refreshTtlSeconds;
    }

    public String issueAccessToken(UUID userId) {
        return issue(userId, TYPE_ACCESS, accessTtlSeconds);
    }

    public String issueRefreshToken(UUID userId) {
        return issue(userId, TYPE_REFRESH, refreshTtlSeconds);
    }

    public long accessTtlSeconds() {
        return accessTtlSeconds;
    }

    /** @return user id, or null if the token is invalid / not of the expected type. */
    public UUID parseUserId(String token, boolean refresh) {
        try {
            Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
            String expectedType = refresh ? TYPE_REFRESH : TYPE_ACCESS;
            if (!expectedType.equals(claims.get("typ", String.class))) {
                return null;
            }
            return UUID.fromString(claims.getSubject());
        } catch (Exception ex) {
            return null;
        }
    }

    private String issue(UUID userId, String type, long ttlSeconds) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId.toString())
                .claim("typ", type)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(ttlSeconds)))
                .signWith(key)
                .compact();
    }
}
