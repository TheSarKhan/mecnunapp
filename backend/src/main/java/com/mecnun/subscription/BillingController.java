package com.mecnun.subscription;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "billing", description = "RevenueCat abunəlik webhook-u")
@Slf4j
@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {

    @Value("${mecnun.revenuecat.webhook-secret:}")
    private String webhookSecret;

    @SecurityRequirements
    @Operation(summary = "RevenueCat webhook (imza yoxlaması hələ placeholder-dir)")
    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestHeader(value = "Authorization", required = false) String authorization,
                                        @RequestBody Map<String, Object> payload) {
        // TODO(next prompt): verify `authorization` against mecnun.revenuecat.webhook-secret,
        // then map INITIAL_PURCHASE / RENEWAL / CANCELLATION / EXPIRATION onto Subscription rows.
        log.info("RevenueCat webhook received (secret configured: {}): {}",
                webhookSecret != null && !webhookSecret.isBlank(), payload.keySet());
        return ResponseEntity.accepted().build();
    }
}
