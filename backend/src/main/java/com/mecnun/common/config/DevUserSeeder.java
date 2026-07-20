package com.mecnun.common.config;

import com.mecnun.subscription.SubscriptionService;
import com.mecnun.user.domain.Gender;
import com.mecnun.user.domain.Persona;
import com.mecnun.user.domain.RelationshipStatus;
import com.mecnun.user.domain.User;
import com.mecnun.user.domain.UserProfile;
import com.mecnun.user.repository.UserProfileRepository;
import com.mecnun.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates a known account for local work, so there is something to log in with without going
 * through onboarding every time the database is reset.
 *
 * Gated on mecnun.dev.seed-test-user, which is only set in the local and docker profiles. It is
 * off by default precisely so it cannot follow the jar into production, where a published
 * password would be a live account anyone can use.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
@ConditionalOnProperty(name = "mecnun.dev.seed-test-user", havingValue = "true")
public class DevUserSeeder {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final SubscriptionService subscriptionService;
    private final PasswordEncoder passwordEncoder;
    private final MecnunProperties props;

    @Bean
    public ApplicationRunner seedTestUser() {
        return args -> createIfMissing();
    }

    @Transactional
    void createIfMissing() {
        String identifier = props.getDev().getTestUserIdentifier().trim().toLowerCase();
        if (userRepository.existsByIdentifier(identifier)) {
            log.info("Test hesabı artıq var: {}", identifier);
            return;
        }

        User user = userRepository.save(User.builder()
                .identifier(identifier)
                .email(identifier.contains("@") ? identifier : null)
                .passwordHash(passwordEncoder.encode(props.getDev().getTestUserPassword()))
                .gender(Gender.MALE)
                .build());

        // Seeded fully onboarded: the point is to skip straight to the chat, not to land back in
        // the flow this account exists to avoid.
        userProfileRepository.save(UserProfile.builder()
                .userId(user.getId())
                .displayName("Test")
                .persona(Persona.MECNUN)
                .relationshipStatus(RelationshipStatus.SINGLE)
                .profanityEnabled(false)
                .build());

        subscriptionService.createFreeSubscription(user.getId());

        log.info("Test hesabı yaradıldı: {} / {}", identifier, props.getDev().getTestUserPassword());
    }
}
