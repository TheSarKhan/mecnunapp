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

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public boolean isPremium() {
        return plan == Plan.PREMIUM
                && (status == SubscriptionStatus.ACTIVE
                    || status == SubscriptionStatus.IN_TRIAL
                    || status == SubscriptionStatus.IN_GRACE_PERIOD);
    }

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = Instant.now();
    }
}
