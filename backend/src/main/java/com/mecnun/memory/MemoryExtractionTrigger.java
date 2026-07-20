package com.mecnun.memory;

import com.mecnun.chat.repository.ConversationRepository;
import com.mecnun.common.config.MecnunProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * When extraction runs.
 *
 * Two triggers, matching the locked decision (roadmap §6): the user never sees a "session".
 *   1. Every N messages, right after the reply is committed — the common case.
 *   2. A sweep for conversations that went quiet mid-chunk, so a trailing 3 messages are not
 *      stranded forever waiting for a 10th that never comes.
 *
 * Both run off the request thread. A user waiting on a reply must never wait on extraction.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MemoryExtractionTrigger {

    private final MemoryService memoryService;
    private final ConversationRepository conversationRepository;
    private final MecnunProperties props;

    @Async
    @TransactionalEventListener
    public void onMessagesAppended(MessagesAppendedEvent event) {
        try {
            if (memoryService.isExtractionDue(event.conversationId())) {
                memoryService.extract(event.conversationId());
            }
        } catch (Exception ex) {
            log.warn("Fon yaddaş çıxarması alınmadı: {}", event.conversationId(), ex);
        }
    }

    /** Picks up conversations that stopped before reaching the message threshold. */
    @Scheduled(fixedDelayString = "${mecnun.memory.sweep-interval-ms:300000}")
    public void sweepQuietConversations() {
        Instant cutoff = Instant.now().minus(props.getMemory().getQuietSweepMinutes(), ChronoUnit.MINUTES);

        conversationRepository.findQuietWithPendingExtraction(cutoff).forEach(conversation -> {
            try {
                memoryService.extract(conversation.getId());
            } catch (Exception ex) {
                log.warn("Sükut sweep-i alınmadı: {}", conversation.getId(), ex);
            }
        });
    }
}
