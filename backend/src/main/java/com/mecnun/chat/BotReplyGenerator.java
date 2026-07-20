package com.mecnun.chat;

import com.mecnun.chat.domain.Conversation;

import java.util.UUID;

/**
 * Bot cavabını istehsal edən nöqtə.
 *
 * v1-də {@link MockBotReplyGenerator} — echo. Gemini inteqrasiyası ayrıca prompt-da bu interfeysin
 * ikinci implementasiyası kimi gələcək (persona promptu + RAG ilə çəkilmiş MemoryFact-lar + söhbət tarixçəsi).
 */
public interface BotReplyGenerator {

    String reply(UUID userId, Conversation conversation, String userMessage);
}
