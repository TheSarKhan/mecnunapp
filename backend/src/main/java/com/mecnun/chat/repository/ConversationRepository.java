package com.mecnun.chat.repository;

import com.mecnun.chat.domain.ChatMode;
import com.mecnun.chat.domain.Conversation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    /**
     * Conversations that have gone quiet but still have messages past the extraction watermark.
     *
     * The lastExtractedAt < lastMessageAt comparison is what makes this idempotent: once a sweep
     * catches up, the row stops matching and is not reprocessed on every tick.
     */
    @Query("""
            SELECT c FROM Conversation c
            WHERE c.lastMessageAt IS NOT NULL
              AND c.lastMessageAt < :cutoff
              AND (c.lastExtractedAt IS NULL OR c.lastExtractedAt < c.lastMessageAt)
            ORDER BY c.lastMessageAt ASC
            """)
    List<Conversation> findQuietWithPendingExtraction(@Param("cutoff") Instant cutoff);

    /**
     * Row lock held for the duration of a memory extraction.
     *
     * Extraction is triggered per message and runs asynchronously, so several runs for one
     * conversation can overlap. Without this they all read the same watermark, extract the same
     * messages and store the same facts several times over — observed in practice as three
     * concurrent runs producing duplicate facts. Serialising here means the runs that queue up
     * see the advanced watermark and find nothing left to do.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Conversation c WHERE c.id = :id")
    Optional<Conversation> findByIdForExtraction(@Param("id") UUID id);

    List<Conversation> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Conversation> findFirstByUserIdAndModeOrderByCreatedAtDesc(UUID userId, ChatMode mode);

    Optional<Conversation> findByIdAndUserId(UUID id, UUID userId);
}
