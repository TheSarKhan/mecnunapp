package com.mecnun.subscription;

import com.mecnun.subscription.domain.Plan;
import com.mecnun.subscription.domain.Subscription;
import com.mecnun.subscription.domain.SubscriptionStatus;
import com.mecnun.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    @Transactional(readOnly = true)
    public boolean isPremium(UUID userId) {
        return subscriptionRepository.findByUserId(userId)
                .map(Subscription::isPremium)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public Subscription get(UUID userId) {
        return subscriptionRepository.findByUserId(userId)
                .orElseGet(() -> Subscription.builder()
                        .userId(userId)
                        .plan(Plan.FREE)
                        .status(SubscriptionStatus.NONE)
                        .build());
    }

    @Transactional
    public Subscription createFreeSubscription(UUID userId) {
        return subscriptionRepository.save(Subscription.builder()
                .userId(userId)
                .plan(Plan.FREE)
                .status(SubscriptionStatus.NONE)
                .build());
    }
}
