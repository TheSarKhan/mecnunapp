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
    private final Gemini gemini = new Gemini();

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
    public static class Gemini {
        /** Boş buraxılsa app mock cavablarla işləyir — start olmaqdan imtina etmir. */
        private String apiKey = "";
        /**
         * Pinned on purpose rather than using the gemini-flash-latest alias: persona prompts are
         * calibrated against a specific model, and an alias that silently moves would drift the
         * voice with no code change to point at.
         */
        private String model = "gemini-3.5-flash";
        private String baseUrl = "https://generativelanguage.googleapis.com/v1beta";
        /** Yüksək temperatur canlı danışıq üçündür; çox aşağı olsa cavablar quruyur. */
        private double temperature = 1.0;
        /** Brief §6.2 qısa cavab tələb edir — tavan da onu möhkəmləndirir. */
        private int maxOutputTokens = 400;
        /**
         * Gemini 3.x modelləri default olaraq cavabdan əvvəl "düşünür" və bu, maxOutputTokens
         * büdcəsindən yeyir. Ölçdük: 400 token büdcənin 380-i düşünməyə gedirdi, cavaba 16 token
         * qalırdı və mesaj söz ortasında kəsilirdi (finishReason=MAX_TOKENS).
         *
         * Dost yazışması ritmində qısa cavab üçün düşünmə nə lazımdır, nə də faydalıdır — yalnız
         * gecikmə və xərc əlavə edir. 0 = tam söndürülüb.
         */
        private int thinkingBudget = 0;
        private int timeoutSeconds = 30;
        /** Prompta göndərilən son mesaj sayı (brief §7.2 "son N mesaj"). */
        private int historyLimit = 20;
        /** Bir cavabda maksimum bubble sayı (brief §6.2: 2–3). */
        private int maxBubbles = 3;

        public boolean isEnabled() {
            return apiKey != null && !apiKey.isBlank();
        }
    }

    @Getter
    @Setter
    public static class Ads {
        /** Bir rewarded ad neçə əlavə mesaj verir. */
        private int messagesPerReward = 5;
        /** Gündə maksimum neçə dəfə reklama baxıb limit artırmaq olar (brief v2 §8: 3). */
        private int maxRewardsPerDay = 3;
    }
}
