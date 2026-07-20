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

    @Test
    void blankInputYieldsNothing() {
        assertTrue(BubbleSplitter.split("   ", 3).isEmpty());
        assertTrue(BubbleSplitter.split(null, 3).isEmpty());
    }

    @Test
    void separatorOnlyOutputFallsBackToTheRawText() {
        assertEquals(List.of("---"), BubbleSplitter.split("---", 3));
    }
}
