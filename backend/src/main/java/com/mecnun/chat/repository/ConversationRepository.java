package com.mecnun.chat.repository;

import com.mecnun.chat.domain.ChatMode;
import com.mecnun.chat.domain.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    List<Conversation> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Conversation> findFirstByUserIdAndModeOrderByCreatedAtDesc(UUID userId, ChatMode mode);

    Optional<Conversation> findByIdAndUserId(UUID id, UUID userId);
}
