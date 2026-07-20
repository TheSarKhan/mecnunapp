package com.mecnun.subscription.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan", nullable = false, length = 20)
    @Builder.Default
    private Plan plan = Plan.FREE;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private SubscriptionStatus status = SubscriptionStatus.NONE;

    @Column(name = "revenuecat_customer_id", length = 190)
    private String revenuecatCustomerId;

    @Column(name = "current_period_end")
    private Instant currentPeriodEnd;

    /** APP_STORE / PLAY_STORE — informational, useful when reconciling with the store console. */
    @Column(name = "store", length = 30)
    private String store;

    @Column(name = "product_id", length = 190)
    private String productId;

    /** Timestamp of the last webhook event applied, used to reject out-of-order retries. */
    @Column(name = "last_event_at")
    private Instant lastEventAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Entitlement check.
     *
     * The period end is the source of truth, not the status word. Two reasons:
     *
     * - A CANCELLATION only means auto-renew was switched off. The user paid through the end of
     *   the period and keeps premium until then; treating "cancelled" as "not premium" would cut
     *   them off early, which is both wrong and a refund request.
     * - Webhooks get lost. If EXPIRATION never arrives, an expired period must still stop granting
     *   premium rather than leaving a free subscription open forever.
     */
    public boolean isPremium() {
        if (plan != Plan.PREMIUM || status == SubscriptionStatus.EXPIRED) {
            return false;
        }
        // A null end means a non-expiring entitlement (lifetime / promotional grant).
        return currentPeriodEnd == null || currentPeriodEnd.isAfter(Instant.now());
    }

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = Instant.now();
    }
}
