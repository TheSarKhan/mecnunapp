package com.mecnun.ads.repository;

import com.mecnun.ads.domain.AdRewardEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AdRewardEventRepository extends JpaRepository<AdRewardEvent, UUID> {

    boolean existsByTransactionId(String transactionId);
}
