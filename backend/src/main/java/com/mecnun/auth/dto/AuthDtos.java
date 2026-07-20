package com.mecnun.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    @Schema(description = "Qeydiyyat sorğusu")
    public record RegisterRequest(
            @Schema(description = "Telefon (+994...) və ya e-poçt", example = "+994501234567")
            @NotBlank @Size(max = 190) String identifier,
            @NotBlank @Size(min = 6, max = 100) String password) {
    }

    @Schema(description = "Giriş sorğusu")
    public record LoginRequest(
            @NotBlank String identifier,
            @NotBlank String password) {
    }

    @Schema(description = "Refresh sorğusu")
    public record RefreshRequest(@NotBlank String refreshToken) {
    }

    @Schema(description = "Google ilə giriş — mobil app-in Google Sign-In-dan aldığı ID token")
    public record GoogleLoginRequest(@NotBlank String idToken) {
    }

    @Schema(description = "Token cütü")
    public record TokenResponse(
            String accessToken,
            String refreshToken,
            String tokenType,
            long expiresIn) {

        public static TokenResponse of(String access, String refresh, long expiresIn) {
            return new TokenResponse(access, refresh, "Bearer", expiresIn);
        }
    }
}
