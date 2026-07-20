package com.mecnun.ai.gemini;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.mecnun.common.config.MecnunProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Turns a fact into a vector for pgvector similarity search.
 *
 * Like {@link GeminiClient}, this is not a @Component — it is only constructed when an API key
 * exists. Without one there is no memory recall, which is a degraded but working product.
 */
@Slf4j
public class EmbeddingClient {

    private final RestClient http;
    private final MecnunProperties.Gemini config;

    public EmbeddingClient(MecnunProperties.Gemini config) {
        this.config = config;

        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(10));
        factory.setReadTimeout(Duration.ofSeconds(config.getTimeoutSeconds()));

        this.http = RestClient.builder()
                .baseUrl(config.getBaseUrl())
                .requestFactory(factory)
                .build();
    }

    /**
     * @param taskType RETRIEVAL_DOCUMENT when storing a fact, RETRIEVAL_QUERY when searching.
     *                 Using the wrong one measurably degrades matching — the model embeds
     *                 questions and statements into different regions on purpose.
     * @return a vector of exactly {@code embeddingDimensions} floats
     * @throws GeminiException on failure or a dimension mismatch
     */
    public float[] embed(String text, String taskType) {
        Map<String, Object> body = Map.of(
                "content", Map.of("parts", List.of(Map.of("text", text))),
                "taskType", taskType,
                "outputDimensionality", config.getEmbeddingDimensions());

        EmbedResponse response;
        try {
            response = http.post()
                    .uri("/models/{model}:embedContent?key={key}", config.getEmbeddingModel(), config.getApiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(EmbedResponse.class);
        } catch (Exception ex) {
            throw new GeminiException("Embedding çağırışı alınmadı", ex);
        }

        List<Double> values = response == null || response.embedding() == null
                ? null
                : response.embedding().values();
        if (values == null || values.isEmpty()) {
            throw new GeminiException("Embedding boş qayıtdı");
        }
        if (values.size() != config.getEmbeddingDimensions()) {
            // Storing a wrong-width vector would fail at the database anyway, but with a far less
            // obvious error than this one.
            throw new GeminiException("Embedding ölçüsü uyğun gəlmir: gözlənilən "
                    + config.getEmbeddingDimensions() + ", gələn " + values.size());
        }

        float[] vector = new float[values.size()];
        for (int i = 0; i < values.size(); i++) {
            vector[i] = values.get(i).floatValue();
        }
        return vector;
    }

    public float[] embedForStorage(String text) {
        return embed(text, "RETRIEVAL_DOCUMENT");
    }

    public float[] embedForSearch(String text) {
        return embed(text, "RETRIEVAL_QUERY");
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record EmbedResponse(Embedding embedding) {

        @JsonIgnoreProperties(ignoreUnknown = true)
        record Embedding(List<Double> values) {
        }
    }
}
