package com.mecnun.ads;

import com.mecnun.ads.domain.AdRewardEvent;
import com.mecnun.ads.repository.AdRewardEventRepository;
import com.mecnun.common.config.MecnunProperties;
import com.mecnun.limits.LimitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * AdMob rewarded-ad server-side verification callback.
 *
 * AdMob calls this as a GET with user_id, transaction_id, reward_amount, signature and key_id.
 * The reward is granted only after the signature checks out — otherwise anyone who learned the URL
 * could mint themselves unlimited messages.
 */
@Tag(name = "ads", description = "Rewarded ad ilə limit artırma")
@Slf4j
@RestController
@RequestMapping("/api/v1/ads")
@RequiredArgsConstructor
public class AdsController {

    private final AdRewardEventRepository adRewardEventRepository;
    private final AdMobSsvVerifier verifier;
    private final LimitService limitService;
    private final MecnunProperties props;

    @SecurityRequirements
    @Operation(summary = "AdMob SSV callback — imza yoxlanılır, sonra limit artırılır")
    @GetMapping("/reward-callback")
    @Transactional
    public ResponseEntity<Void> rewardCallback(HttpServletRequest request,
                                               @RequestParam(value = "user_id", required = false) String userIdParam,
                                               @RequestParam(value = "transaction_id", required = false) String transactionId,
                                               @RequestParam(value = "reward_amount", required = false) Integer rewardAmount) {
        // Verified against the RAW query string: re-encoding decoded parameters changes the bytes
        // that were signed, and every signature would fail.
        if (!verifier.verify(request.getQueryString())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        UUID userId = parseUuid(userIdParam);
        if (userId == null) {
            log.warn("AdMob SSV: user_id oxunmadı: {}", userIdParam);
            return ResponseEntity.badRequest().build();
        }

        // AdMob retries callbacks, so a repeat must not pay out twice.
        if (transactionId != null && adRewardEventRepository.existsByTransactionId(transactionId)) {
            return ResponseEntity.ok().build();
        }

        if (!limitService.grantAdReward(userId)) {
            log.info("Gündəlik reklam tavanına çatılıb: user {}", userId);
            return ResponseEntity.ok().build();
        }

        adRewardEventRepository.save(AdRewardEvent.builder()
                .userId(userId)
                .provider("ADMOB")
                .transactionId(transactionId)
                .rewardAmount(rewardAmount != null ? rewardAmount : props.getAds().getMessagesPerReward())
                .build());

        log.info("Reklam mükafatı verildi: user {}", userId);
        return ResponseEntity.ok().build();
    }

    private UUID parseUuid(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
