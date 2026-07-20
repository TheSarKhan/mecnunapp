package com.mecnun.memory.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Uzunmüddətli yaddaş faktı — istifadəçi haqqında çıxarılmış bir cümlə.
 *
 * The `embedding vector(768)` column exists in the schema (see V1__init.sql) but is deliberately
 * NOT mapped here yet: it is written/read through native pgvector queries once RAG lands.
 */
@Entity
@Table(name = "memory_facts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemoryFact {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "fact_text", nullable = false, columnDefinition = "text")
    private String factText;

    @Column(name = "source_conversation_id")
    private UUID sourceConversationId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
