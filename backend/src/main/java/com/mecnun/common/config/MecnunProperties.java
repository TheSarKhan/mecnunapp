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
    private final Memory memory = new Memory();
    private final Admob admob = new Admob();
    private final Revenuecat revenuecat = new Revenuecat();
    private final Google google = new Google();
    private final Dev dev = new Dev();

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

        /**
         * Pinned and matched to the vector(768) column in V1__init.sql. Changing either the model
         * or the dimension invalidates every stored embedding — it is a migration plus a re-embed
         * of the whole table, not a config tweak.
         */
        private String embeddingModel = "gemini-embedding-001";
        private int embeddingDimensions = 768;

        public boolean isEnabled() {
            return apiKey != null && !apiKey.isBlank();
        }
    }

    @Getter
    @Setter
    public static class Memory {
        /** Neçə yeni mesajdan sonra arxa planda fakt çıxarma işə düşür. */
        private int extractEveryNMessages = 10;
        /** Söhbət bu qədər sakit qalandan sonra qalan mesajlar da yığılır. */
        private int quietSweepMinutes = 30;
        /** Prompta inject olunan fakt sayı (top-k). */
        private int recallLimit = 8;
        /** Extraction-ın bir dəfəyə oxuduğu maksimum mesaj sayı — xərc tavanı. */
        private int maxMessagesPerExtraction = 40;
        /** Bir istifadəçi üçün saxlanılan maksimum fakt sayı. */
        private int maxFactsPerUser = 200;
    }

    @Getter
    @Setter
    public static class Ads {
        /** Bir rewarded ad neçə əlavə mesaj verir. */
        private int messagesPerReward = 5;
        /** Gündə maksimum neçə dəfə reklama baxıb limit artırmaq olar (brief v2 §8: 3). */
        private int maxRewardsPerDay = 3;
    }

    @Getter
    @Setter
    public static class Admob {
        /**
         * AdMob SSV-də açarı SƏN konfiqurasiya etmirsən — Google onları dərc edir və hər çağırış
         * hansı açarla imzalandığını `key_id` ilə bildirir. Açarlar dövri olaraq dəyişir, ona görə
         * siyahı yüklənib cache-lənir.
         */
        private String verifierKeysUrl = "https://www.gstatic.com/admob/reward/verifier-keys.json";
        /**
         * Yalnız lokal test üçün false edilə bilər. Söndürülsə, URL-i bilən hər kəs özünə limitsiz
         * mesaj yaza bilər — prod-da qəti true.
         */
        private boolean ssvVerificationEnabled = true;
    }

    @Getter
    @Setter
    public static class Revenuecat {
        /**
         * RevenueCat imza göndərmir — onların panelində qurduğun sabit Authorization başlığını
         * geri qaytarır və sən onu tutuşdurursan. Boş olsa webhook yoxlanmadan qəbul edilir
         * (yalnız lokal iş üçün).
         */
        private String webhookSecret = "";
    }

    @Getter
    @Setter
    public static class Google {
        /**
         * Web client ID — ID token-in `aud` sahəsi buna bərabər olmalıdır.
         *
         * Client SECRET burada YOXDUR və lazım da deyil: mobil app public client-dir, biz isə
         * yalnız hazır ID token-in imzasını yoxlayırıq. Secret yalnız server tərəfli authorization
         * code mübadiləsi üçün lazım olardı — bizdə o axın yoxdur.
         */
        private String clientId = "";

        public boolean isEnabled() {
            return clientId != null && !clientId.isBlank();
        }
    }

    @Getter
    @Setter
    public static class Dev {
        /** Lokal iş üçün bilinən test hesabı yaradılsın. Prod-da qəti false. */
        private boolean seedTestUser = false;
        private String testUserIdentifier = "test@mecnun.com";
        private String testUserPassword = "test1234";
    }
}
