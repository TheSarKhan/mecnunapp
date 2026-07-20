package com.mecnun.ai;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BubbleSplitterTest {

    @Test
    void splitsOnSeparatorLine() {
        List<String> bubbles = BubbleSplitter.split("baxır amma yazmır 😄\n---\nsən nə gözləyirsən?", 3);
        assertEquals(List.of("baxır amma yazmır 😄", "sən nə gözləyirsən?"), bubbles);
    }

    @Test
    void noSeparatorYieldsASingleBubble() {
        assertEquals(List.of("tək cümlə"), BubbleSplitter.split("tək cümlə", 3));
    }

    @Test
    void toleratesLongerDashRunsAndSurroundingSpace() {
        List<String> bubbles = BubbleSplitter.split("bir  \n  -----  \niki", 3);
        assertEquals(List.of("bir", "iki"), bubbles);
    }

    /** Overflow must be folded into the last bubble — never dropped. */
    @Test
    void foldsOverflowIntoTheLastBubbleWithoutLosingText() {
        List<String> bubbles = BubbleSplitter.split("a\n---\nb\n---\nc\n---\nd", 3);

        assertEquals(3, bubbles.size());
        assertEquals("a", bubbles.get(0));
        assertEquals("b", bubbles.get(1));
        assertTrue(bubbles.get(2).contains("c"), "third bubble kept c");
        assertTrue(bubbles.get(2).contains("d"), "third bubble kept the overflow d");
    }

    /** Observed in real Gemini output: it drops a blank line instead of the requested ---. */
    @Test
    void splitsOnABlankLineToo() {
        List<String> bubbles = BubbleSplitter.split("özünü günahlandırma, qaqaş.\n\nkonkret nə olub?", 3);
        assertEquals(List.of("özünü günahlandırma, qaqaş.", "konkret nə olub?"), bubbles);
    }

    @Test
    void trailingWhitespaceOnTheSeparatorLineStillSplits() {
        assertEquals(List.of("bir", "iki"), BubbleSplitter.split("bir  \n   \niki", 3));
    }

    /** A single newline is inside one bubble, not between two. */
    @Test
    void singleNewlineDoesNotSplit() {
        assertEquals(List.of("bir\niki"), BubbleSplitter.split("bir\niki", 3));
    }

    @Test
    void blankInputYieldsNothing() {
        assertTrue(BubbleSplitter.split("   ", 3).isEmpty());
        assertTrue(BubbleSplitter.split(null, 3).isEmpty());
    }

    /** Never surface a separator as content; empty lets the caller use its persona fallback. */
    @Test
    void separatorOnlyOutputYieldsNothing() {
        assertTrue(BubbleSplitter.split("---", 3).isEmpty());
        assertTrue(BubbleSplitter.split("---\n\n---", 3).isEmpty());
    }

    /**
     * Observed in real Gemini output: the model wraps its --- in blank lines. The blank line
     * matches the separator first, which used to strand the dashes as a bubble of their own.
     */
    @Test
    void dashesPaddedWithBlankLinesDoNotBecomeABubble() {
        List<String> bubbles = BubbleSplitter.split("baxır amma yazmır, hə?\n\n---\n\ngörəsən niyə?", 3);
        assertEquals(List.of("baxır amma yazmır, hə?", "görəsən niyə?"), bubbles);
    }
}
