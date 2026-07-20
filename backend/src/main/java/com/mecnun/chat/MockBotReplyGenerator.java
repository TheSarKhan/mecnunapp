package com.mecnun.chat;

import com.mecnun.chat.domain.ChatMode;
import com.mecnun.chat.domain.Conversation;
import org.springframework.stereotype.Component;

import java.util.UUID;

/** Placeholder — heç bir LLM çağırışı yoxdur. Gemini inteqrasiyası növbəti prompt-dadır. */
@Component
public class MockBotReplyGenerator implements BotReplyGenerator {

    @Override
    public String reply(UUID userId, Conversation conversation, String userMessage) {
        String prefix = conversation.getMode() == ChatMode.QEYBET ? "mock qeybət cavabı" : "mock cavab";
        return prefix + ": " + userMessage;
    }
}
