package com.mecnun.subscription;

import com.mecnun.subscription.domain.Plan;
import com.mecnun.subscription.domain.Subscription;
import com.mecnun.subscription.domain.SubscriptionStatus;
import com.mecnun.subscription.dto.RevenueCatWebhook;
import com.mecnun.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
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

    /**
     * Applies one RevenueCat event.
     *
     * @return true when the event changed state; false when it was ignored (unknown user, stale
     *         retry, or an event type that carries no entitlement change)
     */
    @Transactional
    public boolean applyWebhookEvent(RevenueCatWebhook.Event event) {
        UUID userId = parseUserId(event.appUserId());
        if (userId == null) {
            // Anonymous RevenueCat ids ($RCAnonymousID:...) appear before the SDK logs in with our
            // id. There is no user to grant anything to, so this is expected, not an error.
            log.info("RevenueCat hadisəsi {} tanınmayan app_user_id ilə gəldi, keçilir", event.type());
            return false;
        }

        Subscription subscription = subscriptionRepository.findByUserId(userId)
                .orElseGet(() -> Subscription.builder()
                        .userId(userId)
                        .plan(Plan.FREE)
                        .status(SubscriptionStatus.NONE)
                        .build());

        Instant eventTime = event.eventTime();
        if (subscription.getLastEventAt() != null && eventTime.isBefore(subscription.getLastEventAt())) {
            // Retries are not ordered. Applying a stale CANCELLATION after the RENEWAL that
            // superseded it would downgrade someone who is currently paying.
            log.info("RevenueCat hadisəsi {} köhnədir ({} < {}), keçilir",
                    event.type(), eventTime, subscription.getLastEventAt());
            return false;
        }

        String type = event.type() == null ? "" : event.type().toUpperCase();
        boolean handled = switch (type) {
            case "INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION", "PRODUCT_CHANGE", "NON_RENEWING_PURCHASE" -> {
                subscription.setPlan(Plan.PREMIUM);
                subscription.setStatus(event.isTrial() ? SubscriptionStatus.IN_TRIAL : SubscriptionStatus.ACTIVE);
                yield true;
            }
            // Auto-renew off. Entitlement continues to the period end — Subscription.isPremium()
            // decides that from currentPeriodEnd, so the status is only a label here.
            case "CANCELLATION" -> {
                subscription.setStatus(SubscriptionStatus.CANCELLED);
                yield true;
            }
            case "EXPIRATION" -> {
                subscription.setPlan(Plan.FREE);
                subscription.setStatus(SubscriptionStatus.EXPIRED);
                yield true;
            }
            // Payment failed but the store is still retrying; access is kept during the grace period.
            case "BILLING_ISSUE" -> {
                subscription.setStatus(SubscriptionStatus.IN_GRACE_PERIOD);
                yield true;
            }
            case "TRANSFER" -> {
                log.info("RevenueCat TRANSFER: {} -> {}", event.transferredFrom(), event.transferredTo());
                yield true;
            }
            case "SUBSCRIBER_ALIAS", "TEST" -> {
                log.info("RevenueCat hadisəsi {} məlumat xarakterlidir, statusa toxunmur", type);
                yield false;
            }
            default -> {
                log.warn("Tanınmayan RevenueCat hadisəsi: {}", type);
                yield false;
            }
        };

        if (!handled) {
            return false;
        }

        if (event.expiresAt() != null) {
            subscription.setCurrentPeriodEnd(event.expiresAt());
        }
        if (event.originalAppUserId() != null) {
            subscription.setRevenuecatCustomerId(event.originalAppUserId());
        }
        if (event.store() != null) {
            subscription.setStore(event.store());
        }
        if (event.productId() != null) {
            subscription.setProductId(event.productId());
        }
        subscription.setLastEventAt(eventTime);

        subscriptionRepository.save(subscription);
        log.info("Abunəlik yeniləndi: user={} type={} plan={} status={} bitir={}",
                userId, type, subscription.getPlan(), subscription.getStatus(), subscription.getCurrentPeriodEnd());
        return true;
    }

    private UUID parseUserId(String appUserId) {
        if (appUserId == null || appUserId.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(appUserId);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
