package com.mecnun.subscription;

import com.mecnun.common.config.MecnunProperties;
import com.mecnun.subscription.dto.RevenueCatWebhook;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Tag(name = "billing", description = "RevenueCat abunəlik webhook-u")
@Slf4j
@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {

    private final SubscriptionService subscriptionService;
    private final MecnunProperties props;

    /**
     * RevenueCat authenticates by sending back a fixed Authorization header value that you set in
     * their dashboard — there is no request signature to verify.
     *
     * Always answers 2xx once authorised, even for events we ignore: a non-2xx makes RevenueCat
     * retry and eventually disable the endpoint, and "I understood this and chose not to act" is
     * not an error.
     */
    @SecurityRequirements
    @Operation(summary = "RevenueCat webhook")
    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestHeader(value = "Authorization", required = false) String authorization,
                                        @RequestBody RevenueCatWebhook payload) {
        if (!isAuthorised(authorization)) {
            log.warn("RevenueCat webhook-u yanlış Authorization ilə gəldi, rədd edildi");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (payload == null || payload.event() == null) {
            log.warn("RevenueCat webhook-u boş event ilə gəldi");
            return ResponseEntity.ok().build();
        }

        subscriptionService.applyWebhookEvent(payload.event());
        return ResponseEntity.ok().build();
    }

    private boolean isAuthorised(String authorization) {
        String expected = props.getRevenuecat().getWebhookSecret();
        if (expected == null || expected.isBlank()) {
            // Refusing everything would be worse than useless in local development, where no
            // secret is configured and there is nothing to protect.
            log.warn("REVENUECAT_WEBHOOK_SECRET qurulmayıb — webhook YOXLANMADAN qəbul edilir. "
                    + "Prod-da bunu mütləq qur.");
            return true;
        }
        if (authorization == null) {
            return false;
        }
        // Constant-time: a fast-exit compare leaks the secret one byte at a time to anyone who can
        // measure the response.
        return MessageDigest.isEqual(
                authorization.getBytes(StandardCharsets.UTF_8),
                expected.getBytes(StandardCharsets.UTF_8));
    }
}
