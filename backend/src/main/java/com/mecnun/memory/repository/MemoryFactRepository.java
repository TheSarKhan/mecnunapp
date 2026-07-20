package com.mecnun.memory.repository;

import com.mecnun.memory.domain.MemoryFact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MemoryFactRepository extends JpaRepository<MemoryFact, UUID> {

    List<MemoryFact> findByUserIdOrderByCreatedAtDesc(UUID userId);

    /** Cheap exact-duplicate guard, behind the row lock that prevents overlapping extractions. */
    boolean existsByUserIdAndFactText(UUID userId, String factText);

    Optional<MemoryFact> findByIdAndUserId(UUID id, UUID userId);

    void deleteByUserId(UUID userId);
}
