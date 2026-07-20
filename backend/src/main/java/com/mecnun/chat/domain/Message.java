package com.mecnun.chat.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender", nullable = false, length = 10)
    private Sender sender;

    @Column(name = "content", nullable = false, columnDefinition = "text")
    private String content;

    /**
     * True for the safety layer's own reply.
     *
     * Shown to the user like any other bot message, but excluded from the history sent to the
     * model — otherwise the persona reads it back and starts repeating helpline numbers.
     */
    @Column(name = "is_safety", nullable = false)
    @Builder.Default
    private boolean safety = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
