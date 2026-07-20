package com.mecnun.ads;

import com.mecnun.ads.domain.AdRewardEvent;
import com.mecnun.ads.repository.AdRewardEventRepository;
import com.mecnun.common.config.MecnunProperties;
import com.mecnun.limits.LimitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * AdMob server-side verification (SSV) callback. AdMob calls this as a GET with query params
 * including `user_id`, `transaction_id`, `reward_amount`, `signature` and `key_id`.
 */
@Tag(name = "ads", description = "Rewarded ad ilə limit artırma")
@Slf4j
@RestController
@RequestMapping("/api/v1/ads")
@RequiredArgsConstructor
public class AdsController {

    private final AdRewardEventRepository adRewardEventRepository;
    private final LimitService limitService;
    private final MecnunProperties props;

    @Value("${mecnun.admob.ssv-public-key:}")
    private String ssvPublicKey;

    @SecurityRequirements
    @Operation(summary = "AdMob SSV callback — imza yoxlaması placeholder-dir")
    @GetMapping("/reward-callback")
    @Transactional
    public ResponseEntity<Void> rewardCallback(@RequestParam("user_id") UUID userId,
                                               @RequestParam(value = "transaction_id", required = false) String transactionId,
                                               @RequestParam(value = "reward_amount", required = false) Integer rewardAmount,
                                               @RequestParam(value = "signature", required = false) String signature,
                                               @RequestParam(value = "key_id", required = false) String keyId) {
        // TODO(next prompt): verify `signature` with the ECDSA public key fetched from
        // https://gstatic.com/admob/reward/verifier-keys.json (cached), keyed by `key_id`.
        if (ssvPublicKey == null || ssvPublicKey.isBlank()) {
            log.warn("ADMOB_SSV_PUBLIC_KEY is not configured — accepting reward callback unverified (dev only)");
        }

        if (transactionId != null && adRewardEventRepository.existsByTransactionId(transactionId)) {
            return ResponseEntity.ok().build(); // replay — already granted
        }

        boolean granted = limitService.grantAdReward(userId);
        if (!granted) {
            log.info("Daily rewarded-ad cap reached for user {}", userId);
            return ResponseEntity.ok().build();
        }

        adRewardEventRepository.save(AdRewardEvent.builder()
                .userId(userId)
                .provider("ADMOB")
                .transactionId(transactionId)
                .rewardAmount(rewardAmount != null ? rewardAmount : props.getAds().getMessagesPerReward())
                .build());

        return ResponseEntity.ok().build();
    }
}
