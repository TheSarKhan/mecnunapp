package com.mecnun.safety;

import com.mecnun.ai.PromptRepository;
import com.mecnun.ai.gemini.GeminiClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

/**
 * The safety layer. Always on, in every mode, regardless of the profanity setting.
 *
 * Three defences, deliberately layered because each one fails differently:
 *
 *   1. A hard keyword list — deterministic, instant, cannot be talked out of it.
 *   2. A classifier call for ambiguous wording — catches what a word list cannot.
 *   3. The persona prompt itself (ai/personas/_shared.md) — the last net, for phrasing neither
 *      of the first two anticipated.
 *
 * Layers 1 and 2 exist precisely because layer 3 depends on the model choosing to obey, and a
 * model that is being pushed hard is exactly when that is least reliable.
 */
@Slf4j
@Service
public class SafetyService {

    private static final String CLASSIFIER_PROMPT = "safety/classifier.md";
    private static final String RESPONSE = "safety/safety-response.md";
    private static final String CRISIS_TOKEN = "KRIZ";

    private final PromptRepository prompts;
    private final ObjectProvider<GeminiClient> geminiClient;
    private final CrisisKeywords keywords;

    public SafetyService(PromptRepository prompts, ObjectProvider<GeminiClient> geminiClient) {
        this.prompts = prompts;
        this.geminiClient = geminiClient;
        // Loaded once at startup so a broken file fails the boot, not the first person in crisis.
        this.keywords = CrisisKeywords.load(prompts);
    }

    /**
     * @return true when the message should be answered with the safety response instead of the
     *         persona
     */
    public boolean isCrisis(String userMessage) {
        if (keywords.matchesHard(userMessage)) {
            return true;
        }
        if (!keywords.matchesSoft(userMessage)) {
            // No signal at all: no classifier call, so normal conversation costs nothing extra.
            return false;
        }
        return classify(userMessage);
    }

    /**
     * The safety reply, split into bubbles the same way a persona reply is, so it renders in the
     * existing chat UI without a special case.
     */
    public List<String> response() {
        String text = prompts.load(RESPONSE);
        return java.util.Arrays.stream(text.split("\\R\\s*---\\s*\\R"))
                .map(String::strip)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private boolean classify(String userMessage) {
        GeminiClient client = geminiClient.getIfAvailable();
        if (client == null) {
            // No model available. A soft signal already fired, and treating it as safe would mean
            // the one time we are unsure is the one time we say nothing.
            log.warn("Kriz təsnifatı üçün model yoxdur — yumşaq siqnal kriz sayılır");
            return true;
        }
        try {
            String verdict = client.generate(prompts.load(CLASSIFIER_PROMPT), List.of(), userMessage);
            return verdict != null && verdict.strip().toUpperCase(Locale.ROOT).contains(CRISIS_TOKEN);
        } catch (Exception ex) {
            // Same reasoning: fail towards showing help.
            log.warn("Kriz təsnifatı alınmadı — ehtiyatlı tərəfə keçilir (kriz sayılır)", ex);
            return true;
        }
    }
}
