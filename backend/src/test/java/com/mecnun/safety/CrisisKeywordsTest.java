package com.mecnun.safety;

import com.mecnun.ai.PromptRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

/**
 * The deterministic half of the safety layer.
 *
 * This is the one suite where "most cases pass" is not a passing grade: every hard phrase must be
 * caught without a model in the loop, because that path is what still works when the model is
 * down, slow, or has been talked around.
 */
class CrisisKeywordsTest {

    private final CrisisKeywords keywords = CrisisKeywords.load(new PromptRepository("../ai"));

    @ParameterizedTest
    @ValueSource(strings = {
            "artıq yaşamaq istəmirəm",
            "yasamaq istemirem daha",
            "özümü öldürmək istəyirəm",
            "ozumu oldurecem bu gece",
            "intihar haqqında düşünürəm",
            "həyatıma son qoymaq istəyirəm",
            "heyatima son vermek isteyirem",
            "bileyimi kəsdim dünən",
            "bir neçə həb içdim",
            "ölsəm yaxşıdır hamı üçün",
            "olmek isteyirem",
    })
    void hardSignalsAreCaughtWithoutAModel(String message) {
        assertTrue(keywords.matchesHard(message), "tutulmalı idi: " + message);
    }

    /**
     * Everyday exaggeration must not trigger. A false positive stops the conversation dead and
     * tells someone their normal sentence looked like a crisis — that erodes trust in the one
     * feature that must be trusted.
     */
    @ParameterizedTest
    @ValueSource(strings = {
            "bu iş məni öldürür vallah",
            "ölürəm gülməkdən 😄",
            "öldüm yorğunluqdan",
            "ex-im məni öldürdü əsəbdən",
            "sevgilim canımı aldı",
            "salam, necəsən?",
            "3 gündür yazmır, əsəbiyəm",
    })
    void everydayExaggerationIsNotAHardSignal(String message) {
        assertFalse(keywords.matchesHard(message), "tutulmamalı idi: " + message);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "həyatın mənası yoxdur",
            "daha dözmürəm bu vəziyyətə",
            "heç kimə lazım deyiləm",
            "çıxış yolu yoxdur",
            "gecələr yata bilmirəm",
    })
    void softSignalsGoToTheClassifier(String message) {
        assertTrue(keywords.matchesSoft(message), "yumşaq siyahı tutmalı idi: " + message);
        assertFalse(keywords.matchesHard(message), "sərt siyahıya düşməməli idi: " + message);
    }

    @Test
    void ordinaryChatTriggersNeitherList() {
        String message = "Ex-im story-mə baxıb yazmır, 3 gündür belədir";
        assertFalse(keywords.matchesHard(message));
        // Also matters for cost: no soft match means no classifier call on normal conversation.
        assertFalse(keywords.matchesSoft(message));
    }

    @Test
    void detectionIsCaseInsensitive() {
        assertTrue(keywords.matchesHard("YAŞAMAQ İSTƏMİRƏM"));
        assertTrue(keywords.matchesHard("Özümü Öldürmək istəyirəm"));
    }

    /**
     * The capital İ is the specific trap here: lowercasing it outside an Azerbaijani locale
     * leaves a combining dot behind, which silently broke matching for anyone typing in caps.
     */
    @ParameterizedTest
    @ValueSource(strings = {
            "YAŞAMAQ İSTƏMİRƏM",
            "İntihar düşünürəm",
            "İNTİHAR",
            "ÖLMƏK İSTƏYİRƏM",
    })
    void azerbaijaniCapitalIsAreHandled(String message) {
        assertTrue(keywords.matchesHard(message), "tutulmalı idi: " + message);
    }

    /** Same phrase, four ways of typing it — all must land. */
    @ParameterizedTest
    @ValueSource(strings = {
            "ölmək istəyirəm",
            "olmek isteyirem",
            "ölmek isteyirem",
            "OLMEK ISTEYIREM",
    })
    void spellingVariantsCollapseToTheSameMatch(String message) {
        assertTrue(keywords.matchesHard(message), "tutulmalı idi: " + message);
    }

    @Test
    void nullAndBlankAreSafe() {
        assertFalse(keywords.matchesHard(null));
        assertFalse(keywords.matchesHard("   "));
        assertFalse(keywords.matchesSoft(null));
    }
}
