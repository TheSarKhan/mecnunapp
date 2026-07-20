package com.mecnun.memory;

import com.mecnun.common.error.ApiException;
import com.mecnun.common.security.CurrentUser;
import com.mecnun.memory.domain.MemoryFact;
import com.mecnun.memory.repository.MemoryFactRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** "Məcnun məni necə tanıyır?" ekranını qidalandırır. */
@Tag(name = "memory", description = "Uzunmüddətli yaddaş faktları")
@RestController
@RequestMapping("/api/v1/memory")
@RequiredArgsConstructor
public class MemoryController {

    private final MemoryFactRepository memoryFactRepository;

    public record MemoryFactDto(UUID id, String factText, Instant createdAt) {
    }

    @Operation(summary = "Bot-un istifadəçi haqqında yadda saxladığı faktlar")
    @GetMapping
    @Transactional(readOnly = true)
    public List<MemoryFactDto> list() {
        return memoryFactRepository.findByUserIdOrderByCreatedAtDesc(CurrentUser.id()).stream()
                .map(f -> new MemoryFactDto(f.getId(), f.getFactText(), f.getCreatedAt()))
                .toList();
    }

    @Operation(summary = "Bir faktı sil")
    @DeleteMapping("/{factId}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable UUID factId) {
        MemoryFact fact = memoryFactRepository.findByIdAndUserId(factId, CurrentUser.id())
                .orElseThrow(() -> ApiException.notFound("Fakt tapılmadı."));
        memoryFactRepository.delete(fact);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Bütün yaddaşı sil")
    @DeleteMapping
    @Transactional
    public ResponseEntity<Void> deleteAll() {
        memoryFactRepository.deleteByUserId(CurrentUser.id());
        return ResponseEntity.noContent().build();
    }
}
