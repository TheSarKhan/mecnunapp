package com.mecnun.user.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    /** Phone number in E.164 (+994...) or e-mail — whichever the user registered with. */
    @Column(name = "identifier", nullable = false, unique = true, length = 190)
    private String identifier;

    /** Null for accounts that only ever sign in with Google. */
    @Column(name = "password_hash")
    private String passwordHash;

    /** Google's subject id — stable for this user, unlike the e-mail. */
    @Column(name = "google_sub", length = 190)
    private String googleSub;

    @Column(name = "email", length = 190)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false, length = 20)
    @Builder.Default
    private Gender gender = Gender.UNSPECIFIED;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
