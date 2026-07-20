package com.mecnun.safety;

import com.mecnun.ai.PromptRepository;
import lombok.extern.slf4j.Slf4j;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

/**
 * The two keyword tiers from ai/safety/crisis-keywords.md.
 *
 * Parsing is deliberately dumb — bullet lines under a heading. The file has to stay editable by
 * someone who is thinking about Azerbaijani phrasing, not about parsers.
 */
@Slf4j
public final class CrisisKeywords {

    private static final String HARD_HEADING = "## SƏRT";
    private static final String SOFT_HEADING = "## YUMŞAQ";
    /** Azerbaijani casing rules: İ lowercases to i, and I to ı. A neutral locale gets both wrong. */
    private static final Locale AZ = Locale.forLanguageTag("az");

    private final List<String> hard;
    private final List<String> soft;

    private CrisisKeywords(List<String> hard, List<String> soft) {
        this.hard = hard;
        this.soft = soft;
    }

    public static CrisisKeywords load(PromptRepository prompts) {
        String raw = prompts.load("safety/crisis-keywords.md");
        List<String> hard = bulletsUnder(raw, HARD_HEADING, SOFT_HEADING);
        List<String> soft = bulletsUnder(raw, SOFT_HEADING, "## Redaktə");

        if (hard.isEmpty()) {
            // Losing this list silently would disable the deterministic half of the safety layer.
            throw new IllegalStateException("Kriz açar sözləri oxunmadı: SƏRT siyahı boşdur");
        }
        log.info("Kriz açar sözləri yükləndi: {} sərt, {} yumşaq", hard.size(), soft.size());
        return new CrisisKeywords(hard, soft);
    }

    /** Unambiguous — answer with the safety response immediately, no model call. */
    public boolean matchesHard(String message) {
        return containsAny(message, hard);
    }

    /** Ambiguous — worth spending a classifier call on. */
    public boolean matchesSoft(String message) {
        return containsAny(message, soft);
    }

    private boolean containsAny(String message, List<String> phrases) {
        if (message == null || message.isBlank()) {
            return false;
        }
        String haystack = normalise(message);
        return phrases.stream().anyMatch(haystack::contains);
    }

    /**
     * Folds Azerbaijani spelling variation so one written phrase matches however it was typed.
     *
     * Three problems, all of which produced misses in testing:
     *
     * - Capital İ. Lowercasing it with a neutral locale yields "i" plus a combining dot, so
     *   "İSTƏMİRƏM" did not match "istəmirəm" — someone shouting in caps went undetected.
     * - Dotless ı versus i, the classic Turkic casing trap, in both directions.
     * - Diacritics generally: people type "olmek" as often as "ölmək", especially from a phone
     *   keyboard that is not set to Azerbaijani.
     *
     * Stripping accents costs a little precision, but a missed crisis costs more than a rare
     * false positive, and these are multi-word phrases rather than single ambiguous words.
     */
    private static String normalise(String text) {
        String lowered = text.toLowerCase(AZ);
        // NFD splits ş/ö/ü/ğ/ç into base + mark; removing the marks flattens spelling variants
        // and also clears the stray combining dot left behind by İ.
        String stripped = Normalizer.normalize(lowered, Normalizer.Form.NFD)
                .replaceAll("\\p{Mn}", "");
        // ə and ı have no decomposition, so they are folded explicitly.
        return stripped.replace('ə', 'e').replace('ı', 'i');
    }

    private static List<String> bulletsUnder(String raw, String startHeading, String endHeading) {
        int start = raw.indexOf(startHeading);
        if (start < 0) {
            return List.of();
        }
        int end = raw.indexOf(endHeading, start + startHeading.length());
        String section = end < 0 ? raw.substring(start) : raw.substring(start, end);

        // Normalised on the way in as well, so the file's diacritic and non-diacritic spellings
        // collapse to the same needle and both sides of the comparison agree.
        return section.lines()
                .map(String::strip)
                .filter(line -> line.startsWith("- "))
                .map(line -> normalise(line.substring(2).strip()))
                .filter(line -> !line.isEmpty())
                .distinct()
                .toList();
    }
}
