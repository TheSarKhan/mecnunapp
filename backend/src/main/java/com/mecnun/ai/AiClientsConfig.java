package com.mecnun.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mecnun.ai.gemini.EmbeddingClient;
import com.mecnun.ai.gemini.GeminiClient;
import com.mecnun.common.config.MecnunProperties;
import com.mecnun.memory.MemoryExtractor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * All Gemini-backed beans in one place, and all of them conditional on an API key being present.
 *
 * When the key is missing these beans simply do not exist; collaborators inject them through
 * ObjectProvider and degrade instead of failing. That keeps "no key" a working local mode rather
 * than a startup crash.
 */
@Configuration
public class AiClientsConfig {

    private static final String HAS_API_KEY = "!'${mecnun.gemini.api-key:}'.isEmpty()";

    @Bean
    @ConditionalOnExpression(HAS_API_KEY)
    public GeminiClient geminiClient(MecnunProperties props) {
        return new GeminiClient(props.getGemini());
    }

    @Bean
    @ConditionalOnExpression(HAS_API_KEY)
    public EmbeddingClient embeddingClient(MecnunProperties props) {
        return new EmbeddingClient(props.getGemini());
    }

    @Bean
    @ConditionalOnExpression(HAS_API_KEY)
    public MemoryExtractor memoryExtractor(GeminiClient geminiClient,
                                           PromptRepository prompts,
                                           ObjectMapper objectMapper) {
        return new MemoryExtractor(geminiClient, prompts, objectMapper);
    }
}
