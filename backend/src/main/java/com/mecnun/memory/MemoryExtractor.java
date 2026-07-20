package com.mecnun.memory;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mecnun.ai.PromptRepository;
import com.mecnun.ai.gemini.GeminiClient;
import com.mecnun.chat.domain.Sender;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

/**
 * Turns a slice of conversation into structured facts via a separate LLM call.
 *
 * Separate from the reply call on purpose: mixing "answer in persona" with "emit JSON" degrades
 * both, and extraction runs on a different schedule anyway (every N messages, in the background).
 */
@Slf4j
@RequiredArgsConstructor
public class MemoryExtractor {

    private static final String PROMPT = "prompts/memory-extraction.md";

    private final GeminiClient client;
    private final PromptRepository prompts;
    private final ObjectMapper objectMapper;

    public record Line(Sender sender, String content) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ExtractedFact(String fact, double confidence) {
    }

    /**
     * @param existingFacts already-known facts, passed in so the model does not re-emit them
     * @return facts found, or an empty list — never null. Failure is not propagated: extraction is
     *         a background nicety and must never surface as an error to a user who is chatting.
     */
    public List<ExtractedFact> extract(List<Line> transcript, List<String> existingFacts) {
        if (transcript.isEmpty()) {
            return List.of();
        }

        String systemPrompt = prompts.load(PROMPT) + existingFactsBlock(existingFacts);

        try {
            String raw = client.generate(systemPrompt, List.of(), renderTranscript(transcript));
            return parse(raw);
        } catch (Exception ex) {
            log.warn("Fakt çıxarma alınmadı, bu dəfə keçilir", ex);
            return List.of();
        }
    }

    private String existingFactsBlock(List<String> existingFacts) {
        if (existingFacts.isEmpty()) {
            return "\n\n# Mövcud faktlar\n\nHələ heç nə saxlanılmayıb.";
        }
        StringBuilder sb = new StringBuilder("\n\n# Mövcud faktlar\n\nBunlar artıq bilinir, təkrar yazma:\n\n");
        existingFacts.forEach(f -> sb.append("- ").append(f).append('\n'));
        return sb.toString();
    }

    private String renderTranscript(List<Line> transcript) {
        StringBuilder sb = new StringBuilder("Söhbət:\n\n");
        for (Line line : transcript) {
            sb.append(line.sender() == Sender.USER ? "İstifadəçi: " : "Bot: ")
                    .append(line.content())
                    .append('\n');
        }
        return sb.toString();
    }

    private List<ExtractedFact> parse(String raw) throws Exception {
        String json = stripCodeFence(raw).trim();
        // Models sometimes wrap the array in a sentence; salvage the array rather than lose the run.
        int start = json.indexOf('[');
        int end = json.lastIndexOf(']');
        if (start < 0 || end <= start) {
            log.warn("Fakt çıxarma JSON massivi qaytarmadı: {}", abbreviate(raw));
            return List.of();
        }
        json = json.substring(start, end + 1);

        ExtractedFact[] facts = objectMapper.readValue(json, ExtractedFact[].class);
        return List.of(facts).stream()
                .filter(f -> f.fact() != null && !f.fact().isBlank())
                .toList();
    }

    private String stripCodeFence(String raw) {
        String s = raw.strip();
        if (s.startsWith("```")) {
            int firstBreak = s.indexOf('\n');
            int lastFence = s.lastIndexOf("```");
            if (firstBreak > 0 && lastFence > firstBreak) {
                return s.substring(firstBreak + 1, lastFence);
            }
        }
        return s;
    }

    private String abbreviate(String text) {
        return text.length() <= 200 ? text : text.substring(0, 200) + "...";
    }
}
