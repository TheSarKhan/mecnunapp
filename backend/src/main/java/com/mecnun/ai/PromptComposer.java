package com.mecnun.ai;

import com.mecnun.chat.domain.ChatMode;
import com.mecnun.user.domain.Gender;
import com.mecnun.user.domain.Persona;
import com.mecnun.user.domain.RelationshipStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Builds the system prompt, exactly in the order brief v2 §7.2 specifies:
 *
 *   persona + xitab parametrləri + mod təlimatı + söyüş bayrağı + yaddaş faktları + korpus + son N mesaj
 *
 * The last two blocks are assembled elsewhere: history is passed to the model as real turns rather
 * than pasted into the system prompt, and the corpus arrives in M2 alongside RAG.
 */
@Component
@RequiredArgsConstructor
public class PromptComposer {

    private static final String SHARED = "personas/_shared.md";
    private static final String OPENER = "prompts/opener.md";

    private final PromptRepository prompts;

    /** System prompt for a normal turn. */
    public String composeSystemPrompt(ChatContext context) {
        List<String> blocks = new ArrayList<>();
        blocks.add(prompts.load(SHARED));
        blocks.add(prompts.load(personaFile(context.persona())));
        blocks.add(prompts.load(addressFile(context.gender())));
        blocks.add(prompts.load(modeFile(context.mode())));

        if (context.profanityEnabled()) {
            blocks.add(prompts.load("prompts/profanity-on.md"));
        }

        blocks.add(userBlock(context));

        if (!context.memoryFacts().isEmpty()) {
            blocks.add(memoryBlock(context.memoryFacts()));
        }

        return String.join("\n\n---\n\n", blocks);
    }

    /** System prompt for the very first message, which the persona sends unprompted (§5.1.6). */
    public String composeOpenerPrompt(ChatContext context) {
        return composeSystemPrompt(context) + "\n\n---\n\n" + prompts.load(OPENER);
    }

    private String userBlock(ChatContext context) {
        StringBuilder sb = new StringBuilder("# İstifadəçi haqqında\n\n");
        if (context.displayName() != null && !context.displayName().isBlank()) {
            sb.append("- Adı: ").append(context.displayName().trim()).append('\n');
        }
        sb.append("- Münasibət statusu: ").append(statusLabel(context.relationshipStatus())).append('\n');
        // Without this the persona announces where it read the profile ("sənədə baxıram, yazılıb
        // ki..."), which reads like a form being processed instead of a friend already knowing.
        sb.append("\nBunları bilirsən, amma **haradan bildiyini demirsən**. ")
                .append("Anket, sənəd, profil, qeydiyyat kimi sözlər işlətmirsən — ")
                .append("sadəcə tanış adam kimi davranırsan.");
        return sb.toString();
    }

    private String memoryBlock(List<String> facts) {
        StringBuilder sb = new StringBuilder("# Əvvəlki söhbətlərdən bildiklərin\n\n");
        facts.forEach(fact -> sb.append("- ").append(fact).append('\n'));
        sb.append("\nBunları sadalamırsan — yerinə düşəndə təbii xatırlayırsan.");
        return sb.toString();
    }

    private String personaFile(Persona persona) {
        return persona == Persona.LEYLI ? "personas/leyli.md" : "personas/mecnun.md";
    }

    private String addressFile(Gender gender) {
        return switch (gender) {
            case FEMALE -> "prompts/address-female.md";
            case MALE -> "prompts/address-male.md";
            case UNSPECIFIED -> "prompts/address-neutral.md";
        };
    }

    private String modeFile(ChatMode mode) {
        return mode == ChatMode.QEYBET ? "prompts/mode-qeybet.md" : "prompts/mode-chat.md";
    }

    private String statusLabel(RelationshipStatus status) {
        return switch (status) {
            case SINGLE -> "subaydır";
            case IN_RELATIONSHIP -> "münasibətdədir";
            case COMPLICATED -> "qəlizdir";
            case BROKEN_UP -> "yeni ayrılıb";
            case MARRIED -> "evlidir";
            case UNSPECIFIED -> "bilinmir";
        };
    }
}
