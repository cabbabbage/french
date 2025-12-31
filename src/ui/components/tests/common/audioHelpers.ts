export interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognitionLike, event: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionLike, event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionLike, event: Event) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const recognitionConstructors = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

export function isSpeechRecognitionSupported(): boolean {
  return recognitionConstructors() !== null;
}

export function createSpeechRecognitionInstance(): SpeechRecognitionLike | null {
  const ctor = recognitionConstructors();
  if (!ctor) {
    return null;
  }
  return new ctor();
}

export function speakFrenchWord(word: string, locale = 'fr-FR') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !word) {
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = locale;
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}
