package com.mecnun.memory;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.StringJoiner;
import java.util.UUID;

/**
 * The pgvector half of memory storage.
 *
 * {@code memory_facts.embedding} is deliberately unmapped in the JPA entity (see MemoryFact):
 * {@code vector(768)} is not a type Hibernate understands, and bending JPA around it costs more
 * than the two native statements here. JPA still owns the row's lifecycle — this class only
 * writes the vector column and reads similarity order.
 */
@Repository
@RequiredArgsConstructor
public class MemoryVectorStore {

    private final JdbcTemplate jdbc;

    /**
     * Attaches an embedding to a fact row that JPA has already flushed.
     *
     * Throws when nothing was updated: a no-op UPDATE means the row is not visible on this
     * connection yet, and swallowing it would leave the fact permanently unsearchable while
     * everything above reported success.
     */
    public void saveEmbedding(UUID factId, float[] embedding) {
        int updated = jdbc.update("UPDATE memory_facts SET embedding = ?::vector WHERE id = ?",
                toVectorLiteral(embedding), factId);
        if (updated == 0) {
            throw new IllegalStateException(
                    "Embedding yazılmadı, fakt sətri tapılmadı: " + factId + " (JPA flush olunmayıb?)");
        }
    }

    /**
     * Top-k facts for this user by cosine distance.
     *
     * Rows without an embedding are excluded: they are unreachable by similarity, and including
     * them would silently return arbitrary facts whenever embedding had failed.
     */
    public List<String> findSimilar(UUID userId, float[] queryEmbedding, int limit) {
        return jdbc.queryForList("""
                        SELECT fact_text
                        FROM memory_facts
                        WHERE user_id = ? AND embedding IS NOT NULL
                        ORDER BY embedding <=> ?::vector
                        LIMIT ?
                        """,
                String.class, userId, toVectorLiteral(queryEmbedding), limit);
    }

    /** Most recent facts, used as the recall fallback when no embedding is available. */
    public List<String> findRecent(UUID userId, int limit) {
        return jdbc.queryForList(
                "SELECT fact_text FROM memory_facts WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
                String.class, userId, limit);
    }

    public int countByUser(UUID userId) {
        Integer count = jdbc.queryForObject(
                "SELECT count(*) FROM memory_facts WHERE user_id = ?", Integer.class, userId);
        return count == null ? 0 : count;
    }

    /**
     * Drops the oldest facts beyond the cap, so a heavy user's memory cannot grow without bound.
     *
     * @return number of rows removed
     */
    public int trimToLimit(UUID userId, int maxFacts) {
        return jdbc.update("""
                        DELETE FROM memory_facts
                        WHERE id IN (
                            SELECT id FROM memory_facts
                            WHERE user_id = ?
                            ORDER BY created_at DESC
                            OFFSET ?
                        )
                        """,
                userId, maxFacts);
    }

    /** pgvector's text input format: [0.1,0.2,...] */
    private String toVectorLiteral(float[] vector) {
        StringJoiner joiner = new StringJoiner(",", "[", "]");
        for (float value : vector) {
            joiner.add(Float.toString(value));
        }
        return joiner.toString();
    }
}
