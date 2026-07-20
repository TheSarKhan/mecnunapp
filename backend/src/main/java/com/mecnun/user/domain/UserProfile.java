package com.mecnun.user.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "display_name", length = 80)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(name = "persona", nullable = false, length = 20)
    @Builder.Default
    private Persona persona = Persona.MECNUN;

    @Enumerated(EnumType.STRING)
    @Column(name = "relationship_status", nullable = false, length = 30)
    @Builder.Default
    private RelationshipStatus relationshipStatus = RelationshipStatus.UNSPECIFIED;

    /** "Söyüş modu" — premium-gated, so the toggle is checked against the subscription plan. */
    @Column(name = "profanity_enabled", nullable = false)
    @Builder.Default
    private boolean profanityEnabled = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
