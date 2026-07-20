package com.mecnun.subscription;

import com.mecnun.subscription.domain.Plan;
import com.mecnun.subscription.domain.Subscription;
import com.mecnun.subscription.domain.SubscriptionStatus;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Entitlement rules. These decide whether someone who paid gets what they paid for, so they are
 * spelled out rather than left to the status enum.
 */
class SubscriptionEntitlementTest {

    private Subscription sub(Plan plan, SubscriptionStatus status, Instant end) {
        return Subscription.builder().plan(plan).status(status).currentPeriodEnd(end).build();
    }

    private Instant inDays(int days) {
        return Instant.now().plus(days, ChronoUnit.DAYS);
    }

    private Instant daysAgo(int days) {
        return Instant.now().minus(days, ChronoUnit.DAYS);
    }

    @Test
    void activePremiumWithinItsPeriodIsEntitled() {
        assertTrue(sub(Plan.PREMIUM, SubscriptionStatus.ACTIVE, inDays(10)).isPremium());
    }

    @Test
    void trialCountsAsPremium() {
        assertTrue(sub(Plan.PREMIUM, SubscriptionStatus.IN_TRIAL, inDays(3)).isPremium());
    }

    /** Auto-renew off is not the same as access off — they paid through the period end. */
    @Test
    void cancelledButStillInsideThePeriodKeepsAccess() {
        assertTrue(sub(Plan.PREMIUM, SubscriptionStatus.CANCELLED, inDays(12)).isPremium());
    }

    @Test
    void gracePeriodKeepsAccessWhileTheStoreRetriesPayment() {
        assertTrue(sub(Plan.PREMIUM, SubscriptionStatus.IN_GRACE_PERIOD, inDays(2)).isPremium());
    }

    /** Webhooks get lost; a past period end must revoke on its own. */
    @Test
    void aPastPeriodEndRevokesEvenIfNoExpirationEventArrived() {
        assertFalse(sub(Plan.PREMIUM, SubscriptionStatus.ACTIVE, daysAgo(1)).isPremium());
        assertFalse(sub(Plan.PREMIUM, SubscriptionStatus.CANCELLED, daysAgo(5)).isPremium());
    }

    @Test
    void expiredStatusRevokesRegardlessOfDates() {
        assertFalse(sub(Plan.PREMIUM, SubscriptionStatus.EXPIRED, inDays(30)).isPremium());
    }

    @Test
    void freePlanIsNeverEntitled() {
        assertFalse(sub(Plan.FREE, SubscriptionStatus.ACTIVE, inDays(30)).isPremium());
        assertFalse(sub(Plan.FREE, SubscriptionStatus.NONE, null).isPremium());
    }

    /** No end date means a non-expiring grant (lifetime / promotional). */
    @Test
    void premiumWithoutAnEndDateIsEntitled() {
        assertTrue(sub(Plan.PREMIUM, SubscriptionStatus.ACTIVE, null).isPremium());
    }
}
