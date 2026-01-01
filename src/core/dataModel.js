import frenchDictionary from '../../french.json';
import { getBasicInfoProgress } from './basicInfoProgress';
function normalizeWord(raw) {
    const progress = getBasicInfoProgress(raw.french_word);
    return {
        french_word: raw.french_word,
        part_of_speech: raw.part_of_speech,
        english_meanings: raw.english_meanings ? [...raw.english_meanings] : [],
        pronunciation_guide: raw.pronunciation_guide,
        basic_info_step: progress.basic_info_step,
        basic_info_completed: progress.basic_info_completed,
        learning_phases: raw.learning_phases,
        noun_data: raw.noun_data,
        verb_data: raw.verb_data,
        adjective_data: raw.adjective_data,
        adverb_data: raw.adverb_data
    };
}
const normalizedDictionary = frenchDictionary.map(normalizeWord);
export function loadWordEntries() {
    return normalizedDictionary;
}
