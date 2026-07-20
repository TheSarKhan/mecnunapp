package com.mecnun.ai;

import java.util.Arrays;
import java.util.List;

/**
 * Splits a model response into chat bubbles.
 *
 * The prompt tells the persona to put a lone {@code ---} on its own line between bubbles. Models
 * are not reliable about that, so this is defensive: no separator simply yields one bubble, and
 * anything past the cap is folded back into the last bubble rather than dropped — losing the tail
 * of a reply is worse than showing one slightly long bubble.
 */
public final class BubbleSplitter {

    private static final String SEPARATOR = "\\R\\s*-{3,}\\s*\\R";

    private BubbleSplitter() {
    }

    public static List<String> split(String raw, int maxBubbles) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }

        List<String> parts = Arrays.stream(raw.strip().split(SEPARATOR))
                .map(String::strip)
                .filter(s -> !s.isEmpty())
                .toList();

        if (parts.isEmpty()) {
            return List.of(raw.strip());
        }
        if (maxBubbles < 1 || parts.size() <= maxBubbles) {
            return parts;
        }

        List<String> capped = new java.util.ArrayList<>(parts.subList(0, maxBubbles - 1));
        capped.add(String.join("\n", parts.subList(maxBubbles - 1, parts.size())));
        return List.copyOf(capped);
    }
}
