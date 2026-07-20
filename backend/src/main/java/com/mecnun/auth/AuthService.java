package com.mecnun.auth;

import com.mecnun.auth.dto.AuthDtos.*;
import com.mecnun.common.error.ApiException;
import com.mecnun.subscription.SubscriptionService;
import com.mecnun.user.domain.Gender;
import com.mecnun.user.domain.Persona;
import com.mecnun.user.domain.RelationshipStatus;
import com.mecnun.user.domain.User;
import com.mecnun.user.domain.UserProfile;
import com.mecnun.user.repository.UserProfileRepository;
import com.mecnun.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Minimal identifier + password auth. Real OTP/SMS verification is a later iteration —
 * the token shape stays the same, only the credential check changes.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final SubscriptionService subscriptionService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        String identifier = request.identifier().trim().toLowerCase();
        if (userRepository.existsByIdentifier(identifier)) {
            throw ApiException.conflict("Bu nömrə/e-poçt artıq qeydiyyatdan keçib.");
        }

        User user = userRepository.save(User.builder()
                .identifier(identifier)
                .passwordHash(passwordEncoder.encode(request.password()))
                .gender(Gender.UNSPECIFIED)
                .build());

        userProfileRepository.save(UserProfile.builder()
                .userId(user.getId())
                .persona(Persona.MECNUN)
                .relationshipStatus(RelationshipStatus.UNSPECIFIED)
                .profanityEnabled(false)
                .build());

        subscriptionService.createFreeSubscription(user.getId());

        return issue(user.getId());
    }

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request) {
        String identifier = request.identifier().trim().toLowerCase();
        User user = userRepository.findByIdentifier(identifier)
                .orElseThrow(() -> ApiException.unauthorized("Nömrə/e-poçt və ya şifrə yanlışdır."));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized("Nömrə/e-poçt və ya şifrə yanlışdır.");
        }
        return issue(user.getId());
    }

    public TokenResponse refresh(RefreshRequest request) {
        UUID userId = jwtService.parseUserId(request.refreshToken(), true);
        if (userId == null) {
            throw ApiException.unauthorized("Refresh token etibarsızdır.");
        }
        return issue(userId);
    }

    private TokenResponse issue(UUID userId) {
        return TokenResponse.of(
                jwtService.issueAccessToken(userId),
                jwtService.issueRefreshToken(userId),
                jwtService.accessTtlSeconds());
    }
}
