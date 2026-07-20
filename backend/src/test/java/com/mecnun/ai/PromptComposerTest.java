package com.mecnun.ai;

import com.mecnun.chat.domain.ChatMode;
import com.mecnun.user.domain.Gender;
import com.mecnun.user.domain.Persona;
import com.mecnun.user.domain.RelationshipStatus;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Reads the real files under /ai, so it also catches a persona prompt being renamed or deleted —
 * which would otherwise only surface as a 500 in production.
 */
class PromptComposerTest {

    private final PromptComposer composer = new PromptComposer(new PromptRepository("../ai"));

    private ChatContext.ChatContextBuilder base() {
        return ChatContext.builder()
                .persona(Persona.MECNUN)
                .gender(Gender.MALE)
                .relationshipStatus(RelationshipStatus.BROKEN_UP)
                .displayName("Sərxan")
                .mode(ChatMode.CHAT)
                .profanityEnabled(false)
                .memoryFacts(List.of())
                .history(List.of());
    }

    @Test
    void maleUserGetsMaleAddressForms() {
        String prompt = composer.composeSystemPrompt(base().build());
        assertTrue(prompt.contains("brat"), "male address block present");
        assertFalse(prompt.contains("ay qız"), "female address block absent");
    }

    @Test
    void femaleUserGetsFemaleAddressForms() {
        String prompt = composer.composeSystemPrompt(base().gender(Gender.FEMALE).build());
        assertTrue(prompt.contains("ay qız"));
        assertFalse(prompt.contains("brat"));
    }

    @Test
    void unspecifiedGenderGetsNeitherSetOfAddressForms() {
        String prompt = composer.composeSystemPrompt(base().gender(Gender.UNSPECIFIED).build());
        assertFalse(prompt.contains("brat"));
        assertFalse(prompt.contains("ay qız"));
    }

    @Test
    void personaSelectionSwitchesTheCharacterBlock() {
        assertTrue(composer.composeSystemPrompt(base().build()).contains("Sən Məcnunsan"));
        assertTrue(composer.composeSystemPrompt(base().persona(Persona.LEYLI).build()).contains("Sən Leylisən"));
    }

    @Test
    void qeybetModeSwapsTheModeBlock() {
        assertTrue(composer.composeSystemPrompt(base().mode(ChatMode.QEYBET).build()).contains("Rejim: qeybət"));
        assertTrue(composer.composeSystemPrompt(base().build()).contains("Rejim: söhbət"));
    }

    @Test
    void profanityBlockOnlyAppearsWhenTheFlagIsOn() {
        assertFalse(composer.composeSystemPrompt(base().build()).contains("Söyüş modu: AÇIQ"));
        assertTrue(composer.composeSystemPrompt(base().profanityEnabled(true).build()).contains("Söyüş modu: AÇIQ"));
    }

    /** The safety block is not optional — it must survive every combination of flags. */
    @Test
    void safetyAndRedLinesAreAlwaysPresentEvenWithProfanityOn() {
        String prompt = composer.composeSystemPrompt(
                base().profanityEnabled(true).mode(ChatMode.QEYBET).build());
        assertTrue(prompt.contains("Qırmızı xətlər"));
        assertTrue(prompt.contains("Təhlükəsizlik"));
    }

    @Test
    void profileFactsReachThePrompt() {
        String prompt = composer.composeSystemPrompt(base().build());
        assertTrue(prompt.contains("Sərxan"));
        assertTrue(prompt.contains("yeni ayrılıb"));
    }

    @Test
    void memoryFactsAreOmittedWhenEmptyAndListedWhenPresent() {
        assertFalse(composer.composeSystemPrompt(base().build()).contains("Əvvəlki söhbətlərdən"));

        String withMemory = composer.composeSystemPrompt(
                base().memoryFacts(List.of("Keçmiş sevgilisinin adı Ayseldir")).build());
        assertTrue(withMemory.contains("Keçmiş sevgilisinin adı Ayseldir"));
    }

    @Test
    void openerPromptExtendsTheSystemPrompt() {
        ChatContext context = base().build();
        String opener = composer.composeOpenerPrompt(context);
        assertTrue(opener.startsWith(composer.composeSystemPrompt(context)));
        assertTrue(opener.contains("söhbəti sən başla"));
    }
}
