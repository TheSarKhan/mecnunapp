package com.mecnun.chat.dto;

import com.mecnun.chat.domain.ChatMode;
import com.mecnun.chat.domain.Sender;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
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
            @Schema(description = "Persona 2–3 ardıcıl qısa bubble ilə cavab verə bilər; ən azı bir element olur")
            List<MessageDto> botMessages,
            int remainingMessages) {
    }

    @Schema(description = "Söhbətin açılışı — personanın öz ilk mesajı")
    public record StartConversationRequest(@NotNull ChatMode mode) {
    }

    @Schema(description = "Yeni söhbət və personanın opener mesajı")
    public record StartConversationResponse(
            UUID conversationId,
            List<MessageDto> botMessages) {
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
