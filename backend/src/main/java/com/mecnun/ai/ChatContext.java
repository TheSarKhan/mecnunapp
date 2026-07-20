package com.mecnun.ai;

import com.mecnun.chat.domain.ChatMode;
import com.mecnun.user.domain.Gender;
import com.mecnun.user.domain.Persona;
import com.mecnun.user.domain.RelationshipStatus;
import lombok.Builder;

import java.util.List;

/**
 * Everything the prompt needs about who is talking and how. Deliberately a value object with no
 * JPA entities in it, so prompt composition never triggers a lazy load or a database round trip.
 *
 * @param memoryFacts facts recalled for this turn — empty until M2 (RAG) lands
 */
@Builder
public record ChatContext(
        Persona persona,
        Gender gender,
        RelationshipStatus relationshipStatus,
        String displayName,
        ChatMode mode,
        boolean profanityEnabled,
        List<String> memoryFacts,
        List<Turn> history) {

    /** One prior message, flattened to what the model actually needs. */
    public record Turn(boolean fromUser, String content) {
    }

    public List<String> memoryFacts() {
        return memoryFacts == null ? List.of() : memoryFacts;
    }

    public List<Turn> history() {
        return history == null ? List.of() : history;
    }
}
