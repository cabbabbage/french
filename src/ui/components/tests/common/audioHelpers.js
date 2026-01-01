const recognitionConstructors = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};
export function isSpeechRecognitionSupported() {
    return recognitionConstructors() !== null;
}
export function createSpeechRecognitionInstance() {
    const ctor = recognitionConstructors();
    if (!ctor) {
        return null;
    }
    return new ctor();
}
export function speakFrenchWord(word, locale = 'fr-FR') {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !word) {
        return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = locale;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
}
