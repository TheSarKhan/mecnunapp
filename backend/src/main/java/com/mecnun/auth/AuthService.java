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
    private final GoogleTokenVerifier googleTokenVerifier;

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
        // Google-only accounts have no password hash; matches() would throw on null.
        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized("Nömrə/e-poçt və ya şifrə yanlışdır.");
        }
        return issue(user.getId());
    }

    /**
     * Signs in with a Google ID token obtained by the app.
     *
     * Matching order is deliberate: Google's subject first (it never changes), then a verified
     * e-mail to link an account that already signed up with a password. An unverified e-mail is
     * never linked — that would let someone claim an address they do not control.
     */
    @Transactional
    public TokenResponse loginWithGoogle(GoogleLoginRequest request) {
        if (!googleTokenVerifier.isEnabled()) {
            throw ApiException.badRequest("Google ilə giriş bu serverdə konfiqurasiya olunmayıb.");
        }

        GoogleTokenVerifier.GoogleIdentity identity = googleTokenVerifier.verify(request.idToken());
        if (identity == null) {
            throw ApiException.unauthorized("Google girişi təsdiqlənmədi.");
        }

        User user = userRepository.findByGoogleSub(identity.subject())
                .orElseGet(() -> linkOrCreate(identity));

        return issue(user.getId());
    }

    private User linkOrCreate(GoogleTokenVerifier.GoogleIdentity identity) {
        if (identity.emailVerified() && identity.email() != null) {
            String email = identity.email().trim().toLowerCase();
            User existing = userRepository.findByEmail(email)
                    .or(() -> userRepository.findByIdentifier(email))
                    .orElse(null);
            if (existing != null) {
                existing.setGoogleSub(identity.subject());
                existing.setEmail(email);
                return userRepository.save(existing);
            }
        }
        return createGoogleUser(identity);
    }

    private User createGoogleUser(GoogleTokenVerifier.GoogleIdentity identity) {
        String email = identity.email() == null ? null : identity.email().trim().toLowerCase();
        // identifier is NOT NULL and unique; the Google subject is the only value guaranteed to
        // exist and stay stable, so it is the fallback when no e-mail came back.
        String identifier = email != null ? email : "google:" + identity.subject();

        User user = userRepository.save(User.builder()
                .identifier(identifier)
                .email(email)
                .googleSub(identity.subject())
                .passwordHash(null)
                .gender(Gender.UNSPECIFIED)
                .build());

        userProfileRepository.save(UserProfile.builder()
                .userId(user.getId())
                .displayName(identity.name())
                .persona(Persona.MECNUN)
                .relationshipStatus(RelationshipStatus.UNSPECIFIED)
                .profanityEnabled(false)
                .build());

        subscriptionService.createFreeSubscription(user.getId());
        return user;
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
