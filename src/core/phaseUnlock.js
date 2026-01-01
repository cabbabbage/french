function getPhase(word, key) {
    return word.learning_phases[key];
}
function progressRatio(phase) {
    return phase.target_progress === 0 ? 0 : phase.user_progress / phase.target_progress;
}
const USAGE_ADVANCED_HARD_GUARD = true; // follow optional recommendation from the plan
export function isPhaseUnlocked(word, target) {
    const phases = word.learning_phases;
    const intro = getPhase(word, 'intro');
    const enMatch = getPhase(word, 'en_to_fr_match');
    const frIdent = getPhase(word, 'fr_to_en_identification');
    const spellBasic = getPhase(word, 'spelling_basic');
    const spellAdvanced = getPhase(word, 'spelling_advanced');
    const pronBasic = getPhase(word, 'pronunciation_basic');
    const pronAdvanced = getPhase(word, 'pronunciation_advanced');
    const usageBasic = getPhase(word, 'usage_basic');
    switch (target) {
        case 'intro':
            return true;
        case 'en_to_fr_match':
            return intro.user_progress >= 1;
        case 'fr_to_en_identification':
            return progressRatio(enMatch) >= 0.3;
        case 'spelling_basic':
            return progressRatio(enMatch) >= 0.3 && progressRatio(frIdent) >= 0.3;
        case 'spelling_advanced':
            return progressRatio(spellBasic) >= 0.5;
        case 'pronunciation_basic':
            return intro.user_progress >= intro.target_progress;
        case 'pronunciation_advanced':
            return progressRatio(pronBasic) >= 0.5;
        case 'usage_basic':
            return progressRatio(enMatch) >= 0.6 && progressRatio(frIdent) >= 0.6;
        case 'usage_advanced':
            if (progressRatio(usageBasic) < 0.6) {
                return false;
            }
            if (spellAdvanced.user_progress === 0 && pronAdvanced.user_progress === 0) {
                return false;
            }
            if (USAGE_ADVANCED_HARD_GUARD) {
                const priorPhases = [
                    'intro',
                    'en_to_fr_match',
                    'fr_to_en_identification',
                    'spelling_basic',
                    'spelling_advanced',
                    'pronunciation_basic',
                    'pronunciation_advanced',
                    'usage_basic'
                ];
                const ready = priorPhases.every((key) => progressRatio(getPhase(word, key)) >= 0.5);
                if (!ready) {
                    return false;
                }
            }
            return true;
        default:
            return false;
    }
}
