package com.mecnun.ai;

import java.util.Arrays;
import java.util.List;

/**
 * Splits a model response into chat bubbles.
 *
 * The prompt asks for a lone {@code ---} between bubbles, but in practice the model often just
 * leaves a blank line instead, which used to collapse two intended bubbles into one. Both are
 * therefore treated as separators — safe here because the persona is instructed to write 1–3
 * sentence bubbles, so a blank line inside one is not a paragraph break, it is a bubble break.
 *
 * Everything else is defensive: no separator yields one bubble, and anything past the cap is
 * folded back into the last bubble rather than dropped — losing the tail of a reply is worse
 * than showing one slightly long bubble.
 */
public final class BubbleSplitter {

    /** A line break, then a line that is empty or contains only dashes, then another break. */
    private static final String SEPARATOR = "\\R[ \\t]*(?:-{3,})?[ \\t]*\\R";

    /**
     * A fragment that is nothing but dashes. The model often surrounds its {@code ---} with blank
     * lines; the blank line then matches the separator first and strands the dashes as their own
     * fragment, which would otherwise be shown to the user as a bubble containing "---".
     */
    private static final String DASHES_ONLY = "-{3,}";

    private BubbleSplitter() {
    }

    public static List<String> split(String raw, int maxBubbles) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }

        List<String> parts = Arrays.stream(raw.strip().split(SEPARATOR))
                .map(String::strip)
                .filter(s -> !s.isEmpty())
                .filter(s -> !s.matches(DASHES_ONLY))
                .toList();

        // Nothing but separators. Returning them as a bubble would show the user "---", so hand
        // back empty and let the caller serve its in-persona fallback instead.
        if (parts.isEmpty()) {
            return List.of();
        }
        if (maxBubbles < 1 || parts.size() <= maxBubbles) {
            return parts;
        }

        List<String> capped = new java.util.ArrayList<>(parts.subList(0, maxBubbles - 1));
        capped.add(String.join("\n", parts.subList(maxBubbles - 1, parts.size())));
        return List.copyOf(capped);
    }
}
