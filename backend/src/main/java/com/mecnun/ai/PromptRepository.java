package com.mecnun.ai;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Reads persona prompts and corpus files from /ai.
 *
 * Two sources, in priority order:
 *   1. {@code mecnun.ai.dir} — a filesystem directory. Nothing is cached, so editing a prompt
 *      takes effect on the next message with no rebuild and no restart. This is how prompt
 *      iteration is meant to happen (see application-local.yml).
 *   2. The classpath under {@code /ai}, staged there at build time by maven-resources-plugin.
 *      This is what ships inside the jar, so a deployed artifact is self-contained.
 *
 * This closes the open question in ai/README.md: build-time copy is the default, filesystem
 * override exists for iteration speed.
 */
@Slf4j
@Component
public class PromptRepository {

    private static final String CLASSPATH_ROOT = "ai/";

    private final Path overrideDir;
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    public PromptRepository(@Value("${mecnun.ai.dir:}") String overrideDir) {
        this.overrideDir = (overrideDir == null || overrideDir.isBlank()) ? null : Path.of(overrideDir);
    }

    @PostConstruct
    void logSource() {
        if (overrideDir != null) {
            log.info("Prompts load from disk at {} (hot reload on, nothing cached)", overrideDir.toAbsolutePath());
        } else {
            log.info("Prompts load from the classpath under /{} (cached)", CLASSPATH_ROOT);
        }
    }

    /**
     * @param relativePath path under /ai, e.g. {@code personas/leyli.md}
     * @throws IllegalStateException if the file is missing — a missing persona prompt is a
     *         deployment error, not something to paper over with an empty string.
     */
    public String load(String relativePath) {
        if (overrideDir != null) {
            return readFromDisk(relativePath);
        }
        return cache.computeIfAbsent(relativePath, this::readFromClasspath);
    }

    /** @return file contents, or {@code fallback} when the file does not exist. */
    public String loadOrDefault(String relativePath, String fallback) {
        try {
            return load(relativePath);
        } catch (IllegalStateException ex) {
            log.warn("Optional prompt {} is missing, using the fallback", relativePath);
            return fallback;
        }
    }

    private String readFromDisk(String relativePath) {
        Path file = overrideDir.resolve(relativePath);
        if (!Files.isReadable(file)) {
            throw new IllegalStateException("Prompt not found on disk: " + file.toAbsolutePath());
        }
        try {
            return Files.readString(file, StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new UncheckedIOException("Could not read prompt " + file, ex);
        }
    }

    private String readFromClasspath(String relativePath) {
        ClassPathResource resource = new ClassPathResource(CLASSPATH_ROOT + relativePath);
        if (!resource.exists()) {
            throw new IllegalStateException(
                    "Prompt not found on the classpath: " + CLASSPATH_ROOT + relativePath
                            + " — did maven-resources-plugin stage /ai?");
        }
        try (var in = resource.getInputStream()) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new UncheckedIOException("Could not read prompt " + relativePath, ex);
        }
    }
}
