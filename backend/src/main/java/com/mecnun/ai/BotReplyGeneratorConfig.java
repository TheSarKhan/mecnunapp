package com.mecnun.ai;

import com.mecnun.ai.gemini.GeminiClient;
import com.mecnun.common.config.MecnunProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Picks the reply generator at startup.
 *
 * A missing API key is a normal local state, not a failure — refusing to boot would block work on
 * every other part of the product. The warning is loud so nobody mistakes mock output for a bug.
 */
@Slf4j
@Configuration
public class BotReplyGeneratorConfig {

    @Bean
    public BotReplyGenerator botReplyGenerator(MecnunProperties props,
                                              PromptComposer composer) {
        MecnunProperties.Gemini gemini = props.getGemini();
        if (!gemini.isEnabled()) {
            log.warn("GEMINI_API_KEY qurulmayıb — bot MOCK cavablar qaytaracaq. "
                    + "Real cavablar üçün açarı .env-ə əlavə et.");
            return new MockBotReplyGenerator();
        }
        log.info("Gemini aktivdir, model: {}", gemini.getModel());
        return new GeminiBotReplyGenerator(new GeminiClient(gemini), composer, props);
    }
}
