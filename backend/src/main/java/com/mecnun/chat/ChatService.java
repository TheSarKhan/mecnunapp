package com.mecnun.chat;

import com.mecnun.ai.BotReplyGenerator;
import com.mecnun.ai.ChatContext;
import com.mecnun.chat.domain.ChatMode;
import com.mecnun.chat.domain.Conversation;
import com.mecnun.chat.domain.Message;
import com.mecnun.chat.domain.Sender;
import com.mecnun.chat.dto.ChatDtos.*;
import com.mecnun.chat.repository.ConversationRepository;
import com.mecnun.chat.repository.MessageRepository;
import com.mecnun.common.error.ApiException;
import com.mecnun.limits.LimitService;
import com.mecnun.user.domain.User;
import com.mecnun.user.domain.UserProfile;
import com.mecnun.user.repository.UserProfileRepository;
import com.mecnun.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final LimitService limitService;
    private final BotReplyGenerator botReplyGenerator;

    @Transactional
    public SendMessageResponse send(UUID userId, SendMessageRequest request) {
        if (!limitService.tryConsume(userId)) {
            throw ApiException.limitReached("Bu günlük məcnunluq bəsdir 😌 Sabah davam.");
        }

        Conversation conversation = resolveConversation(userId, request);

        Message userMessage = messageRepository.save(Message.builder()
                .conversationId(conversation.getId())
                .sender(Sender.USER)
                .content(request.content())
                .build());

        // History is read BEFORE the new user message is included as a turn — the message being
        // answered is passed separately, so including it here would duplicate it in the prompt.
        ChatContext context = buildContext(userId, conversation, historyExcluding(conversation, userMessage.getId()));
        List<String> bubbles = botReplyGenerator.reply(context, request.content());

        List<MessageDto> botMessages = persistBotMessages(conversation, bubbles);

        conversation.setLastMessageAt(Instant.now());
        conversationRepository.save(conversation);

        return new SendMessageResponse(
                conversation.getId(),
                toDto(userMessage),
                botMessages,
                limitService.status(userId).remaining());
    }

    /**
     * Opens a fresh conversation in which the persona speaks first (brief §5.1.6).
     * Does not consume the daily limit — the user has not said anything yet.
     */
    @Transactional
    public StartConversationResponse start(UUID userId, StartConversationRequest request) {
        Conversation conversation = conversationRepository.save(Conversation.builder()
                .userId(userId)
                .mode(request.mode())
                .build());

        ChatContext context = buildContext(userId, conversation, List.of());
        List<MessageDto> botMessages = persistBotMessages(conversation, botReplyGenerator.opener(context));

        conversation.setLastMessageAt(Instant.now());
        conversationRepository.save(conversation);

        return new StartConversationResponse(conversation.getId(), botMessages);
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

    private List<MessageDto> persistBotMessages(Conversation conversation, List<String> bubbles) {
        List<MessageDto> saved = new ArrayList<>(bubbles.size());
        for (String bubble : bubbles) {
            Message message = messageRepository.save(Message.builder()
                    .conversationId(conversation.getId())
                    .sender(Sender.BOT)
                    .content(bubble)
                    .build());
            saved.add(toDto(message));
        }
        return saved;
    }

    private ChatContext buildContext(UUID userId, Conversation conversation, List<ChatContext.Turn> history) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("İstifadəçi tapılmadı."));
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Profil tapılmadı."));

        return ChatContext.builder()
                .persona(profile.getPersona())
                .gender(user.getGender())
                .relationshipStatus(profile.getRelationshipStatus())
                .displayName(profile.getDisplayName())
                .mode(conversation.getMode())
                .profanityEnabled(profile.isProfanityEnabled())
                .memoryFacts(List.of()) // M2: RAG ilə doldurulacaq
                .history(history)
                .build();
    }

    private List<ChatContext.Turn> historyExcluding(Conversation conversation, UUID excludedMessageId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId()).stream()
                .filter(m -> !m.getId().equals(excludedMessageId))
                .map(m -> new ChatContext.Turn(m.getSender() == Sender.USER, m.getContent()))
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
