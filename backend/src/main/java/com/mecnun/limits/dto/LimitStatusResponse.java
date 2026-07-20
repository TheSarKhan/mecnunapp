package com.mecnun.limits.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Gündəlik mesaj limitinin cari vəziyyəti")
public record LimitStatusResponse(
        @Schema(description = "Qalan mesaj sayı") int remaining,
        @Schema(description = "Bu günə düşən ümumi limit (baza + reklamdan qazanılan)") int total,
        @Schema(description = "Bu gün istifadə olunmuş mesaj sayı") int used,
        @Schema(description = "Reklama baxaraq qazanılmış əlavə mesaj sayı") int bonus,
        @Schema(description = "İstifadəçi premium-dursa true") boolean premium,
        @Schema(description = "Bu gün daha neçə dəfə reklama baxıb limit artırmaq olar") int rewardsRemaining,
        @Schema(description = "Limitin sıfırlanacağı an") Instant resetAt) {
}
