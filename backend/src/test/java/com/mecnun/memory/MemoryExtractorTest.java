package com.mecnun.memory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mecnun.ai.PromptRepository;
import com.mecnun.ai.gemini.GeminiClient;
import com.mecnun.ai.gemini.GeminiException;
import com.mecnun.chat.domain.Sender;
import com.mecnun.common.config.MecnunProperties;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Extraction depends on a model returning well-formed JSON, which it reliably does not. These
 * cover the shapes actually seen in the wild plus the failure paths, because a broken extraction
 * must never reach the user who is mid-conversation.
 */
class MemoryExtractorTest {

    private static final List<MemoryExtractor.Line> TRANSCRIPT =
            List.of(new MemoryExtractor.Line(Sender.USER, "Ex-imin adı Ayseldir, 2 il birlikdə olmuşuq."));

    private MemoryExtractor extractorReturning(String modelOutput) {
        return new MemoryExtractor(new StubClient(modelOutput), realPrompts(), new ObjectMapper());
    }

    private PromptRepository realPrompts() {
        return new PromptRepository("../ai");
    }

    @Test
    void parsesACleanJsonArray() {
        var facts = extractorReturning("[{\"fact\":\"Ex-inin adı Ayseldir\",\"confidence\":0.95}]")
                .extract(TRANSCRIPT, List.of());

        assertEquals(1, facts.size());
        assertEquals("Ex-inin adı Ayseldir", facts.get(0).fact());
        assertEquals(0.95, facts.get(0).confidence(), 0.0001);
    }

    /** Models habitually wrap JSON in ```json fences despite being told not to. */
    @Test
    void parsesJsonWrappedInACodeFence() {
        var facts = extractorReturning("```json\n[{\"fact\":\"2 il birlikdə olublar\",\"confidence\":0.9}]\n```")
                .extract(TRANSCRIPT, List.of());

        assertEquals(1, facts.size());
        assertEquals("2 il birlikdə olublar", facts.get(0).fact());
    }

    /** ...and sometimes add a sentence around it. */
    @Test
    void salvagesTheArrayFromSurroundingProse() {
        var facts = extractorReturning("Bu söhbətdən çıxan faktlar: [{\"fact\":\"Ayseldir\",\"confidence\":0.8}] Hamısı budur.")
                .extract(TRANSCRIPT, List.of());

        assertEquals(1, facts.size());
    }

    @Test
    void emptyArrayMeansNothingWorthRemembering() {
        assertTrue(extractorReturning("[]").extract(TRANSCRIPT, List.of()).isEmpty());
    }

    @Test
    void unparseableOutputYieldsNothingRatherThanThrowing() {
        assertTrue(extractorReturning("heç bir fakt tapılmadı").extract(TRANSCRIPT, List.of()).isEmpty());
        assertTrue(extractorReturning("[{bozuk json").extract(TRANSCRIPT, List.of()).isEmpty());
    }

    /** A model outage must be invisible to the person chatting. */
    @Test
    void modelFailureIsSwallowed() {
        MemoryExtractor extractor = new MemoryExtractor(
                new FailingClient(), realPrompts(), new ObjectMapper());
        assertTrue(extractor.extract(TRANSCRIPT, List.of()).isEmpty());
    }

    @Test
    void blankFactsAreDropped() {
        var facts = extractorReturning("[{\"fact\":\"  \",\"confidence\":0.9},{\"fact\":\"Bakıda yaşayır\",\"confidence\":0.9}]")
                .extract(TRANSCRIPT, List.of());

        assertEquals(1, facts.size());
        assertEquals("Bakıda yaşayır", facts.get(0).fact());
    }

    @Test
    void emptyTranscriptSkipsTheModelEntirely() {
        MemoryExtractor extractor = new MemoryExtractor(
                new FailingClient(), realPrompts(), new ObjectMapper());
        assertTrue(extractor.extract(List.of(), List.of()).isEmpty());
    }

    /** Known facts must reach the prompt, or the model re-emits them every run. */
    @Test
    void existingFactsArePassedToTheModel() {
        StubClient client = new StubClient("[]");
        new MemoryExtractor(client, realPrompts(), new ObjectMapper())
                .extract(TRANSCRIPT, List.of("Ex-inin adı Ayseldir"));

        assertTrue(client.lastSystemPrompt.contains("Ex-inin adı Ayseldir"));
        assertTrue(client.lastSystemPrompt.contains("Mövcud faktlar"));
    }

    @Test
    void transcriptIsLabelledBySpeaker() {
        StubClient client = new StubClient("[]");
        new MemoryExtractor(client, realPrompts(), new ObjectMapper()).extract(
                List.of(new MemoryExtractor.Line(Sender.USER, "salam"),
                        new MemoryExtractor.Line(Sender.BOT, "nooldu")),
                List.of());

        assertTrue(client.lastUserMessage.contains("İstifadəçi: salam"));
        assertTrue(client.lastUserMessage.contains("Bot: nooldu"));
    }

    // ------------------------------------------------------------------ stubs

    private static class StubClient extends GeminiClient {
        private final String output;
        String lastSystemPrompt;
        String lastUserMessage;

        StubClient(String output) {
            super(new MecnunProperties.Gemini());
            this.output = output;
        }

        @Override
        public String generate(String systemInstruction, List<Turn> history, String userMessage) {
            this.lastSystemPrompt = systemInstruction;
            this.lastUserMessage = userMessage;
            return output;
        }
    }

    private static class FailingClient extends GeminiClient {
        FailingClient() {
            super(new MecnunProperties.Gemini());
        }

        @Override
        public String generate(String systemInstruction, List<Turn> history, String userMessage) {
            throw new GeminiException("simulated outage");
        }
    }
}
