package com.mecnun.ai;

import com.mecnun.chat.domain.ChatMode;

import java.util.List;

/**
 * Used only when no Gemini API key is configured, so the app still boots and the rest of the
 * product (limits, paywall, memory screen, navigation) stays testable without a key.
 *
 * It intentionally returns two bubbles: that way the multi-bubble path is exercised in local
 * development too, instead of only showing up once a real key is added.
 */
public class MockBotReplyGenerator implements BotReplyGenerator {

    @Override
    public List<String> reply(ChatContext context, String userMessage) {
        String prefix = context.mode() == ChatMode.QEYBET ? "mock qeybət cavabı" : "mock cavab";
        return List.of(prefix + ": " + userMessage, "(GEMINI_API_KEY qurulmayıb — real cavab üçün açar lazımdır)");
    }

    @Override
    public List<String> opener(ChatContext context) {
        return List.of("mock opener: nooldu, danış görüm.");
    }
}
