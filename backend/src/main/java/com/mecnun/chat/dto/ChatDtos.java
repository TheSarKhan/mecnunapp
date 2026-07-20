package com.mecnun.chat.dto;

import com.mecnun.chat.domain.ChatMode;
import com.mecnun.chat.domain.Sender;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public final class ChatDtos {

    private ChatDtos() {
    }

    @Schema(description = "Yeni mesaj göndərmə sorğusu")
    public record SendMessageRequest(
            @NotNull ChatMode mode,
            @NotBlank @Size(max = 4000) String content,
            @Schema(description = "Boş buraxılarsa həmin mod üzrə son söhbət davam etdirilir")
            UUID conversationId) {
    }

    @Schema(description = "Bot cavabı + limit vəziyyəti")
    public record SendMessageResponse(
            UUID conversationId,
            MessageDto userMessage,
            MessageDto botMessage,
            int remainingMessages) {
    }

    public record MessageDto(UUID id, Sender sender, String content, Instant createdAt) {
    }

    public record ConversationDto(
            UUID id,
            ChatMode mode,
            Instant createdAt,
            Instant lastMessageAt) {
    }
}
