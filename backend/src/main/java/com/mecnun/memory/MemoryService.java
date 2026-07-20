package com.mecnun.memory;

import com.mecnun.ai.gemini.EmbeddingClient;
import com.mecnun.chat.domain.Conversation;
import com.mecnun.chat.domain.Message;
import com.mecnun.chat.repository.ConversationRepository;
import com.mecnun.chat.repository.MessageRepository;
import com.mecnun.common.config.MecnunProperties;
import com.mecnun.memory.domain.MemoryFact;
import com.mecnun.memory.repository.MemoryFactRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Long-term memory: extraction (write side) and recall (read side).
 *
 * Nothing here is allowed to break a conversation. Every path degrades — no API key means no
 * recall, a failed embedding still stores the fact, a failed extraction is skipped and retried on
 * the next trigger. A user chatting must never see a memory error.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MemoryService {

    /** Below this the model was guessing rather than reporting; not worth remembering. */
    private static final double MIN_CONFIDENCE = 0.6;

    private final MemoryFactRepository factRepository;
    private final MemoryVectorStore vectorStore;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final MecnunProperties props;
    private final ObjectProvider<EmbeddingClient> embeddingClient;
    private final ObjectProvider<MemoryExtractor> extractor;

    // ---------------------------------------------------------------- recall

    /**
     * Facts to inject into the prompt for this turn.
     *
     * @param query the user's message — recall is about what they are talking about now, not
     *              about everything ever stored
     */
    @Transactional(readOnly = true)
    public List<String> recall(UUID userId, String query) {
        int limit = props.getMemory().getRecallLimit();
        EmbeddingClient client = embeddingClient.getIfAvailable();

        if (client == null || query == null || query.isBlank()) {
            return vectorStore.findRecent(userId, limit);
        }
        try {
            return vectorStore.findSimilar(userId, client.embedForSearch(query), limit);
        } catch (Exception ex) {
            // Recent facts are a worse answer than similar ones, but far better than none.
            log.warn("Semantik yaddaş axtarışı alınmadı, son faktlara keçilir", ex);
            return vectorStore.findRecent(userId, limit);
        }
    }

    // ------------------------------------------------------------ extraction

    /** True when enough new messages have piled up to be worth an extraction call. */
    @Transactional(readOnly = true)
    public boolean isExtractionDue(UUID conversationId) {
        return conversationRepository.findById(conversationId)
                .map(c -> pendingMessages(c).size() >= props.getMemory().getExtractEveryNMessages())
                .orElse(false);
    }

    /**
     * Extracts facts from everything said since the watermark, then moves the watermark.
     *
     * The watermark advances even when nothing was extracted — otherwise a chunk that genuinely
     * contains no durable facts would be re-sent to the model forever.
     */
    @Transactional
    public void extract(UUID conversationId) {
        MemoryExtractor memoryExtractor = extractor.getIfAvailable();
        if (memoryExtractor == null) {
            return;
        }

        // Locks the row for this transaction. Overlapping runs queue here and then find the
        // watermark already advanced, instead of all extracting the same messages.
        Conversation conversation = conversationRepository.findByIdForExtraction(conversationId).orElse(null);
        if (conversation == null) {
            return;
        }

        List<Message> pending = pendingMessages(conversation);
        if (pending.isEmpty()) {
            return;
        }

        UUID userId = conversation.getUserId();
        List<String> existing = vectorStore.findRecent(userId, props.getMemory().getMaxFactsPerUser());

        List<MemoryExtractor.Line> transcript = pending.stream()
                .map(m -> new MemoryExtractor.Line(m.getSender(), m.getContent()))
                .toList();

        List<MemoryExtractor.ExtractedFact> found = memoryExtractor.extract(transcript, existing);

        int stored = 0;
        for (MemoryExtractor.ExtractedFact candidate : found) {
            if (candidate.confidence() < MIN_CONFIDENCE) {
                continue;
            }
            String factText = candidate.fact().strip();
            // The model re-emits known facts despite being shown them; duplicates crowd out the
            // top-k recall window, which is how a real memory turns useless.
            if (factRepository.existsByUserIdAndFactText(userId, factText)) {
                continue;
            }
            storeFact(userId, conversationId, factText);
            stored++;
        }

        conversation.setLastExtractedAt(pending.get(pending.size() - 1).getCreatedAt());
        conversationRepository.save(conversation);

        if (stored > 0) {
            trim(userId);
            log.info("Yaddaş: söhbət {} üzrə {} mesajdan {} fakt saxlanıldı",
                    conversationId, pending.size(), stored);
        }
    }

    private void storeFact(UUID userId, UUID conversationId, String factText) {
        // saveAndFlush, not save: the embedding is written by a native UPDATE through JdbcTemplate,
        // which does not trigger Hibernate's auto-flush. With a deferred insert that UPDATE matches
        // zero rows and reports no error, leaving every fact silently unembedded and semantic
        // recall permanently empty — which is exactly what happened before this was fixed.
        MemoryFact fact = factRepository.saveAndFlush(MemoryFact.builder()
                .userId(userId)
                .factText(factText)
                .sourceConversationId(conversationId)
                .build());

        EmbeddingClient client = embeddingClient.getIfAvailable();
        if (client == null) {
            return;
        }
        try {
            vectorStore.saveEmbedding(fact.getId(), client.embedForStorage(factText));
        } catch (Exception ex) {
            // The fact is still stored and still visible on the "how does it know me" screen; it
            // just will not be reachable by similarity search until re-embedded.
            log.warn("Fakt {} embed edilmədi, semantik axtarışda görünməyəcək", fact.getId(), ex);
        }
    }

    private void trim(UUID userId) {
        int max = props.getMemory().getMaxFactsPerUser();
        if (vectorStore.countByUser(userId) > max) {
            int removed = vectorStore.trimToLimit(userId, max);
            log.info("Yaddaş tavanı: istifadəçi {} üçün {} köhnə fakt silindi", userId, removed);
        }
    }

    private List<Message> pendingMessages(Conversation conversation) {
        Instant watermark = conversation.getLastExtractedAt();
        List<Message> all = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
        List<Message> pending = watermark == null
                ? all
                : all.stream().filter(m -> m.getCreatedAt().isAfter(watermark)).toList();

        int cap = props.getMemory().getMaxMessagesPerExtraction();
        return pending.size() <= cap ? pending : pending.subList(pending.size() - cap, pending.size());
    }
}
