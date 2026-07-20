package com.mecnun.limits;

import com.mecnun.common.config.MecnunProperties;
import com.mecnun.limits.dto.LimitStatusResponse;
import com.mecnun.subscription.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;

/**
 * Gündəlik mesaj sayğacı — Redis-də saxlanılır (entity yoxdur).
 *
 * Key pattern:
 *   mecnun:limit:{userId}:{yyyy-MM-dd}       -> istifadə olunmuş mesaj sayı  (INCR, TTL 48s saat)
 *   mecnun:bonus:{userId}:{yyyy-MM-dd}       -> reklama baxıb qazanılan əlavə mesaj sayı
 *   mecnun:rewards:{userId}:{yyyy-MM-dd}     -> həmin gün baxılan rewarded ad sayı
 *
 * Tarix `mecnun.limits.timezone` (default Asia/Baku) üzrə hesablanır ki, limit yerli gecə yarısı sıfırlansın.
 */
@Service
@RequiredArgsConstructor
public class LimitService {

    private static final String USED_KEY = "mecnun:limit:%s:%s";
    private static final String BONUS_KEY = "mecnun:bonus:%s:%s";
    private static final String REWARDS_KEY = "mecnun:rewards:%s:%s";
    private static final Duration KEY_TTL = Duration.ofHours(48);

    private final StringRedisTemplate redis;
    private final MecnunProperties props;
    private final SubscriptionService subscriptionService;

    public LimitStatusResponse status(UUID userId) {
        String day = today();
        int used = readInt(USED_KEY.formatted(userId, day));
        int bonus = readInt(BONUS_KEY.formatted(userId, day));
        int rewardsUsed = readInt(REWARDS_KEY.formatted(userId, day));
        boolean premium = subscriptionService.isPremium(userId);

        int base = premium ? props.getLimits().getPremiumDailyMessages() : props.getLimits().getFreeDailyMessages();
        int total = base + bonus;

        return new LimitStatusResponse(
                Math.max(0, total - used),
                total,
                used,
                bonus,
                premium,
                Math.max(0, props.getAds().getMaxRewardsPerDay() - rewardsUsed),
                nextReset());
    }

    /** @return true if the message fits inside today's allowance (and the counter was incremented). */
    public boolean tryConsume(UUID userId) {
        LimitStatusResponse status = status(userId);
        if (status.remaining() <= 0) {
            return false;
        }
        increment(USED_KEY.formatted(userId, today()), 1);
        return true;
    }

    /** @return true if the reward was granted; false when the daily rewarded-ad cap is already hit. */
    public boolean grantAdReward(UUID userId) {
        String day = today();
        int rewardsUsed = readInt(REWARDS_KEY.formatted(userId, day));
        if (rewardsUsed >= props.getAds().getMaxRewardsPerDay()) {
            return false;
        }
        increment(REWARDS_KEY.formatted(userId, day), 1);
        increment(BONUS_KEY.formatted(userId, day), props.getAds().getMessagesPerReward());
        return true;
    }

    private String today() {
        return LocalDate.now(zone()).toString();
    }

    private Instant nextReset() {
        ZoneId zone = zone();
        return LocalDate.now(zone).plusDays(1).atStartOfDay(zone).toInstant();
    }

    private ZoneId zone() {
        return ZoneId.of(props.getLimits().getTimezone());
    }

    private int readInt(String key) {
        String value = redis.opsForValue().get(key);
        return value == null ? 0 : Integer.parseInt(value);
    }

    private void increment(String key, int by) {
        redis.opsForValue().increment(key, by);
        redis.expire(key, KEY_TTL);
    }
}
