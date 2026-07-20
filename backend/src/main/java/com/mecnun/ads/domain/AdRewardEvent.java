package com.mecnun.ads.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/** One verified rewarded-ad view. `transactionId` is AdMob's SSV key — used for replay protection. */
@Entity
@Table(name = "ad_reward_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdRewardEvent {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "provider", nullable = false, length = 40)
    @Builder.Default
    private String provider = "ADMOB";

    @Column(name = "transaction_id", unique = true, length = 190)
    private String transactionId;

    @Column(name = "reward_amount", nullable = false)
    private int rewardAmount;

    @Column(name = "verified_at", nullable = false)
    private Instant verifiedAt;

    @PrePersist
    void onCreate() {
        if (verifiedAt == null) {
            verifiedAt = Instant.now();
        }
    }
}
