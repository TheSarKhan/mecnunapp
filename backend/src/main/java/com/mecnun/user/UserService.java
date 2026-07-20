package com.mecnun.user;

import com.mecnun.common.error.ApiException;
import com.mecnun.memory.repository.MemoryFactRepository;
import com.mecnun.subscription.SubscriptionService;
import com.mecnun.user.domain.User;
import com.mecnun.user.domain.UserProfile;
import com.mecnun.user.dto.UserDtos.*;
import com.mecnun.user.repository.UserProfileRepository;
import com.mecnun.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final MemoryFactRepository memoryFactRepository;
    private final SubscriptionService subscriptionService;

    @Transactional(readOnly = true)
    public MeResponse me(UUID userId) {
        User user = requireUser(userId);
        UserProfile profile = requireProfile(userId);
        return toMe(user, profile, subscriptionService.isPremium(userId));
    }

    @Transactional
    public MeResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = requireUser(userId);
        UserProfile profile = requireProfile(userId);

        user.setGender(request.gender());
        profile.setDisplayName(request.displayName());
        profile.setPersona(request.persona());
        profile.setRelationshipStatus(request.relationshipStatus());

        userRepository.save(user);
        userProfileRepository.save(profile);
        return toMe(user, profile, subscriptionService.isPremium(userId));
    }

    @Transactional
    public MeResponse updateSettings(UUID userId, UpdateSettingsRequest request) {
        User user = requireUser(userId);
        UserProfile profile = requireProfile(userId);
        boolean premium = subscriptionService.isPremium(userId);

        if (request.profanityEnabled() != null) {
            if (request.profanityEnabled() && !premium) {
                throw ApiException.premiumRequired("Söyüş modu yalnız premium istifadəçilər üçündür.");
            }
            profile.setProfanityEnabled(request.profanityEnabled());
        }

        userProfileRepository.save(profile);
        return toMe(user, profile, premium);
    }

    @Transactional
    public void deleteAccount(UUID userId) {
        memoryFactRepository.deleteByUserId(userId);
        userProfileRepository.deleteById(userId);
        userRepository.deleteById(userId);
        // NOTE: conversations/messages/subscriptions are removed by ON DELETE CASCADE (see V1__init.sql).
    }

    private User requireUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("İstifadəçi tapılmadı."));
    }

    private UserProfile requireProfile(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Profil tapılmadı."));
    }

    private MeResponse toMe(User user, UserProfile profile, boolean premium) {
        return new MeResponse(
                user.getId(),
                user.getIdentifier(),
                user.getGender(),
                profile.getDisplayName(),
                profile.getPersona(),
                profile.getRelationshipStatus(),
                profile.isProfanityEnabled(),
                premium,
                user.getCreatedAt());
    }
}
