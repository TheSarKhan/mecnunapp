package com.mecnun.ai;

import com.mecnun.ai.gemini.GeminiClient;
import com.mecnun.ai.gemini.GeminiException;
import com.mecnun.common.config.MecnunProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

/** Real replies, via Gemini Flash. Built only when an API key is configured. */
@Slf4j
@RequiredArgsConstructor
public class GeminiBotReplyGenerator implements BotReplyGenerator {

    /**
     * Shown when the model call fails or gets filtered. Stays in persona and does not blame the
     * user or expose an error — a chat companion that says "500 Internal Server Error" breaks the
     * illusion the whole product rests on.
     */
    private static final List<String> FALLBACK = List.of("bir saniyə, əlaqə kəsildi deyəsən 😅 nə deyirdin?");

    private final GeminiClient client;
    private final PromptComposer composer;
    private final MecnunProperties props;

    @Override
    public List<String> reply(ChatContext context, String userMessage) {
        return generate(composer.composeSystemPrompt(context), history(context), userMessage);
    }

    @Override
    public List<String> opener(ChatContext context) {
        return generate(composer.composeOpenerPrompt(context), List.of(), null);
    }

    private List<String> generate(String systemPrompt, List<GeminiClient.Turn> history, String userMessage) {
        try {
            String raw = client.generate(systemPrompt, history, userMessage);
            List<String> bubbles = BubbleSplitter.split(raw, props.getGemini().getMaxBubbles());
            return bubbles.isEmpty() ? FALLBACK : bubbles;
        } catch (GeminiException ex) {
            log.error("Gemini reply failed, serving the in-persona fallback", ex);
            return FALLBACK;
        }
    }

    private List<GeminiClient.Turn> history(ChatContext context) {
        List<ChatContext.Turn> turns = context.history();
        int limit = props.getGemini().getHistoryLimit();
        List<ChatContext.Turn> window = turns.size() <= limit
                ? turns
                : turns.subList(turns.size() - limit, turns.size());
        return window.stream()
                .map(t -> new GeminiClient.Turn(t.fromUser(), t.content()))
                .toList();
    }
}
