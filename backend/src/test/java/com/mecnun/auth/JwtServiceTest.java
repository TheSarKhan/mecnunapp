package com.mecnun.auth;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Pure unit test — no Spring context, no Postgres/Redis needed. */
class JwtServiceTest {

    private final JwtService jwtService =
            new JwtService("test-secret-that-is-at-least-32-bytes-long!!", 3600, 86400);

    @Test
    void accessTokenRoundTrips() {
        UUID userId = UUID.randomUUID();
        String token = jwtService.issueAccessToken(userId);
        assertEquals(userId, jwtService.parseUserId(token, false));
    }

    @Test
    void accessTokenIsRejectedWhereRefreshIsExpected() {
        String token = jwtService.issueAccessToken(UUID.randomUUID());
        assertNull(jwtService.parseUserId(token, true));
    }

    @Test
    void garbageTokenYieldsNull() {
        assertNull(jwtService.parseUserId("not.a.jwt", false));
    }
}
