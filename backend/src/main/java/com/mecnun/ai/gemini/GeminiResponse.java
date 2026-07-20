package com.mecnun.ai.gemini;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/** Only the fields we actually read; everything else in the payload is ignored. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record GeminiResponse(List<Candidate> candidates, PromptFeedback promptFeedback) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Candidate(Content content, String finishReason) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Content(List<Part> parts) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Part(String text) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PromptFeedback(String blockReason) {
    }

    /** @return concatenated text of the first candidate, or null when there is nothing usable. */
    public String firstText() {
        if (candidates == null || candidates.isEmpty()) {
            return null;
        }
        Content content = candidates.get(0).content();
        if (content == null || content.parts() == null) {
            return null;
        }
        String joined = content.parts().stream()
                .map(Part::text)
                .filter(t -> t != null && !t.isBlank())
                .reduce("", (a, b) -> a.isEmpty() ? b : a + "\n" + b);
        return joined.isBlank() ? null : joined;
    }

    /** True when the model ran out of output budget — the text exists but is cut off. */
    public boolean isTruncated() {
        return candidates != null
                && !candidates.isEmpty()
                && "MAX_TOKENS".equals(candidates.get(0).finishReason());
    }

    /** Human-readable reason for an unusable response, for logs. */
    public String blockDescription() {
        if (promptFeedback != null && promptFeedback.blockReason() != null) {
            return "promptFeedback.blockReason=" + promptFeedback.blockReason();
        }
        if (candidates != null && !candidates.isEmpty()) {
            return "finishReason=" + candidates.get(0).finishReason();
        }
        return "no candidates";
    }
}
