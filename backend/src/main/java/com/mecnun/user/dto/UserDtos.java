package com.mecnun.user.dto;

import com.mecnun.user.domain.Gender;
import com.mecnun.user.domain.Persona;
import com.mecnun.user.domain.RelationshipStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public final class UserDtos {

    private UserDtos() {
    }

    @Schema(description = "Cari istifadəçi — profil + abunəlik")
    public record MeResponse(
            UUID id,
            String identifier,
            Gender gender,
            String displayName,
            Persona persona,
            RelationshipStatus relationshipStatus,
            boolean profanityEnabled,
            boolean premium,
            Instant createdAt) {
    }

    @Schema(description = "Onboarding-də toplanan profil məlumatları")
    public record UpdateProfileRequest(
            @Size(max = 80) String displayName,
            @NotNull Gender gender,
            @NotNull Persona persona,
            @NotNull RelationshipStatus relationshipStatus) {
    }

    @Schema(description = "Ayarlar — hazırda yalnız söyüş modu (premium tələb edir)")
    public record UpdateSettingsRequest(Boolean profanityEnabled) {
    }
}
