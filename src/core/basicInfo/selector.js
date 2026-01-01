import { BASIC_INFO_TESTS, LAST_STEP } from './tests';
function getStepIndex(word) {
    if (word.basic_info_step <= LAST_STEP) {
        return word.basic_info_step;
    }
    return LAST_STEP;
}
function testForWord(word) {
    const index = getStepIndex(word);
    return BASIC_INFO_TESTS[index];
}
function isAudioCompatible(word, capabilities) {
    const test = testForWord(word);
    if (test.requires_audio_output && !capabilities.has_audio_output) {
        return false;
    }
    if (test.requires_audio_input && !capabilities.has_audio_input) {
        return false;
    }
    return true;
}
export function buildSelectionPool(words, capabilities) {
    const remainingWords = words.filter((word) => !word.basic_info_completed);
    const blockedByAudio = remainingWords.filter((word) => !isAudioCompatible(word, capabilities));
    const eligibleWords = remainingWords.filter((word) => isAudioCompatible(word, capabilities));
    return { remainingWords, blockedByAudio, eligibleWords };
}
export function selectRandomWord(eligibleWords, lastWordId) {
    if (eligibleWords.length === 0) {
        return null;
    }
    let pool = eligibleWords;
    if (lastWordId && eligibleWords.length > 1) {
        const filtered = eligibleWords.filter((word) => word.french_word !== lastWordId);
        if (filtered.length > 0) {
            pool = filtered;
        }
    }
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
}
export function createSelection(words, capabilities, lastWordId) {
    const pool = buildSelectionPool(words, capabilities);
    const word = selectRandomWord(pool.eligibleWords, lastWordId);
    if (!word) {
        return null;
    }
    return {
        word,
        test: testForWord(word)
    };
}
export function getTestForWord(word) {
    return testForWord(word);
}
