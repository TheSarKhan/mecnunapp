package com.mecnun.common.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@EnableConfigurationProperties
@ConfigurationProperties(prefix = "mecnun")
public class MecnunProperties {

    private final Limits limits = new Limits();
    private final Ads ads = new Ads();

    @Getter
    @Setter
    public static class Limits {
        /** Pulsuz istifadəçi üçün gündəlik mesaj limiti. */
        private int freeDailyMessages = 20;
        /** Premium — praktiki olaraq limitsiz, amma abuse üçün tavan qalır. */
        private int premiumDailyMessages = 500;
        /** Limitin sıfırlandığı saat (IANA zonası mecnun.limits.timezone ilə). */
        private String timezone = "Asia/Baku";
    }

    @Getter
    @Setter
    public static class Ads {
        /** Bir rewarded ad neçə əlavə mesaj verir. */
        private int messagesPerReward = 5;
        /** Gündə maksimum neçə dəfə reklama baxıb limit artırmaq olar. */
        private int maxRewardsPerDay = 5;
    }
}
