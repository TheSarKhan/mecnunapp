package com.mecnun.ai.gemini;

import com.mecnun.common.config.MecnunProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Thin wrapper over the Gemini generateContent REST endpoint.
 *
 * Deliberately not a Spring @Component: {@link com.mecnun.ai.BotReplyGeneratorConfig} decides
 * whether to build one at all, based on whether an API key is configured.
 */
@Slf4j
public class GeminiClient {

    private final RestClient http;
    private final MecnunProperties.Gemini config;

    public GeminiClient(MecnunProperties.Gemini config) {
        this.config = config;

        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(10));
        factory.setReadTimeout(Duration.ofSeconds(config.getTimeoutSeconds()));

        this.http = RestClient.builder()
                .baseUrl(config.getBaseUrl())
                .requestFactory(factory)
                .build();
    }

    /**
     * @param history prior turns, oldest first
     * @return the model's raw text
     * @throws GeminiException on transport failure, or when the model returns no usable candidate
     */
    public String generate(String systemInstruction, List<Turn> history, String userMessage) {
        List<Map<String, Object>> contents = new ArrayList<>();
        for (Turn turn : history) {
            contents.add(content(turn.fromUser() ? "user" : "model", turn.text()));
        }
        if (userMessage != null && !userMessage.isBlank()) {
            contents.add(content("user", userMessage));
        }
        if (contents.isEmpty()) {
            // The opener has no user turn yet, but the API requires at least one content entry.
            contents.add(content("user", "(söhbət yeni açıldı)"));
        }

        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", systemInstruction))),
                "contents", contents,
                "generationConfig", Map.of(
                        "temperature", config.getTemperature(),
                        "maxOutputTokens", config.getMaxOutputTokens()),
                "safetySettings", safetySettings());

        GeminiResponse response;
        try {
            response = http.post()
                    .uri("/models/{model}:generateContent?key={key}", config.getModel(), config.getApiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(GeminiResponse.class);
        } catch (Exception ex) {
            throw new GeminiException("Gemini çağırışı alınmadı", ex);
        }

        String text = response == null ? null : response.firstText();
        if (text == null || text.isBlank()) {
            String reason = response == null ? "empty body" : response.blockDescription();
            throw new GeminiException("Gemini istifadə oluna bilən cavab qaytarmadı: " + reason);
        }
        return text;
    }

    /**
     * Harassment and dangerous-content filters are relaxed to BLOCK_ONLY_HIGH because qeybət mode
     * is venting about a real person and profanity mode is a paid feature — Google's default
     * thresholds reject both. Self-harm is NOT relaxed, and our own safety layer (M4) sits on top
     * regardless of what the provider does.
     */
    private List<Map<String, String>> safetySettings() {
        return List.of(
                threshold("HARM_CATEGORY_HARASSMENT", "BLOCK_ONLY_HIGH"),
                threshold("HARM_CATEGORY_HATE_SPEECH", "BLOCK_ONLY_HIGH"),
                threshold("HARM_CATEGORY_SEXUALLY_EXPLICIT", "BLOCK_MEDIUM_AND_ABOVE"),
                threshold("HARM_CATEGORY_DANGEROUS_CONTENT", "BLOCK_MEDIUM_AND_ABOVE"));
    }

    private Map<String, String> threshold(String category, String value) {
        return Map.of("category", category, "threshold", value);
    }

    private Map<String, Object> content(String role, String text) {
        return Map.of("role", role, "parts", List.of(Map.of("text", text)));
    }

    public record Turn(boolean fromUser, String text) {
    }
}
