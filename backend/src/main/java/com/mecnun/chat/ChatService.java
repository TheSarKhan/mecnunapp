package com.mecnun.chat;

import com.mecnun.chat.domain.Conversation;
import com.mecnun.chat.domain.Message;
import com.mecnun.chat.domain.Sender;
import com.mecnun.chat.dto.ChatDtos.*;
import com.mecnun.chat.repository.ConversationRepository;
import com.mecnun.chat.repository.MessageRepository;
import com.mecnun.common.error.ApiException;
import com.mecnun.limits.LimitService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final LimitService limitService;
    private final BotReplyGenerator botReplyGenerator;

    @Transactional
    public SendMessageResponse send(UUID userId, SendMessageRequest request) {
        if (!limitService.tryConsume(userId)) {
            throw ApiException.limitReached("Bugünkü mesaj limitin bitib. Reklama bax və ya premium al.");
        }

        Conversation conversation = resolveConversation(userId, request);

        Message userMessage = messageRepository.save(Message.builder()
                .conversationId(conversation.getId())
                .sender(Sender.USER)
                .content(request.content())
                .build());

        String reply = botReplyGenerator.reply(userId, conversation, request.content());

        Message botMessage = messageRepository.save(Message.builder()
                .conversationId(conversation.getId())
                .sender(Sender.BOT)
                .content(reply)
                .build());

        conversation.setLastMessageAt(Instant.now());
        conversationRepository.save(conversation);

        return new SendMessageResponse(
                conversation.getId(),
                toDto(userMessage),
                toDto(botMessage),
                limitService.status(userId).remaining());
    }

    @Transactional(readOnly = true)
    public List<ConversationDto> conversations(UUID userId) {
        return conversationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(c -> new ConversationDto(c.getId(), c.getMode(), c.getCreatedAt(), c.getLastMessageAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MessageDto> messages(UUID userId, UUID conversationId) {
        Conversation conversation = conversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> ApiException.notFound("Söhbət tapılmadı."));
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId()).stream()
                .map(ChatService::toDto)
                .toList();
    }

    private Conversation resolveConversation(UUID userId, SendMessageRequest request) {
        if (request.conversationId() != null) {
            Conversation existing = conversationRepository.findByIdAndUserId(request.conversationId(), userId)
                    .orElseThrow(() -> ApiException.notFound("Söhbət tapılmadı."));
            if (existing.getMode() != request.mode()) {
                throw ApiException.badRequest("Bu söhbət başqa moda aiddir.");
            }
            return existing;
        }
        return conversationRepository.findFirstByUserIdAndModeOrderByCreatedAtDesc(userId, request.mode())
                .orElseGet(() -> conversationRepository.save(Conversation.builder()
                        .userId(userId)
                        .mode(request.mode())
                        .build()));
    }

    private static MessageDto toDto(Message message) {
        return new MessageDto(message.getId(), message.getSender(), message.getContent(), message.getCreatedAt());
    }
}
