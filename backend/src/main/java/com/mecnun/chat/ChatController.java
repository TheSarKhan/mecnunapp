package com.mecnun.chat;

import com.mecnun.chat.dto.ChatDtos.*;
import com.mecnun.common.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "chat", description = "Söhbət və qeybət modu")
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @Operation(summary = "Mesaj göndər — bot cavabı qaytarır (hazırda mock)")
    @PostMapping("/messages")
    public SendMessageResponse send(@Valid @RequestBody SendMessageRequest request) {
        return chatService.send(CurrentUser.id(), request);
    }

    @Operation(summary = "Söhbətlərin siyahısı")
    @GetMapping("/conversations")
    public List<ConversationDto> conversations() {
        return chatService.conversations(CurrentUser.id());
    }

    @Operation(summary = "Bir söhbətin mesajları")
    @GetMapping("/conversations/{id}/messages")
    public List<MessageDto> messages(@PathVariable("id") UUID conversationId) {
        return chatService.messages(CurrentUser.id(), conversationId);
    }
}
