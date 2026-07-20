package com.mecnun.subscription.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

/**
 * The subset of RevenueCat's webhook payload we act on.
 *
 * Unknown fields are ignored on purpose: RevenueCat adds fields over time, and a webhook that
 * starts 400-ing because of a new field would look, from their side, like an outage — they retry,
 * then disable the endpoint.
 *
 * @see <a href="https://www.revenuecat.com/docs/webhooks">RevenueCat webhooks</a>
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record RevenueCatWebhook(Event event) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Event(
            String id,
            String type,
            /** Our user id — the mobile SDK is configured to log in with it. */
            @JsonProperty("app_user_id") String appUserId,
            @JsonProperty("original_app_user_id") String originalAppUserId,
            @JsonProperty("product_id") String productId,
            /** NORMAL / TRIAL / INTRO / PROMOTIONAL */
            @JsonProperty("period_type") String periodType,
            String store,
            @JsonProperty("event_timestamp_ms") Long eventTimestampMs,
            @JsonProperty("expiration_at_ms") Long expirationAtMs,
            /** Set on TRANSFER events: the ids the entitlement moved from. */
            @JsonProperty("transferred_from") java.util.List<String> transferredFrom,
            @JsonProperty("transferred_to") java.util.List<String> transferredTo) {

        public Instant eventTime() {
            return eventTimestampMs == null ? Instant.now() : Instant.ofEpochMilli(eventTimestampMs);
        }

        public Instant expiresAt() {
            return expirationAtMs == null ? null : Instant.ofEpochMilli(expirationAtMs);
        }

        public boolean isTrial() {
            return "TRIAL".equalsIgnoreCase(periodType) || "INTRO".equalsIgnoreCase(periodType);
        }
    }
}
