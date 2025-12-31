export interface BasicInfoTestDefinition {
  id: string;
  title: string;
  description: string;
  requires_audio_output: boolean;
  requires_audio_input: boolean;
}

export const BASIC_INFO_TESTS: BasicInfoTestDefinition[] = [
  {
    id: 'intro',
    title: 'Intro walkthrough',
    description: 'Meet the word with a short guided recap before exercises begin.',
    requires_audio_output: false,
    requires_audio_input: false
  },
  {
    id: 'en_to_fr_select_mc',
    title: 'English prompt → French multiple choice',
    description: 'Select the French translation for the English prompt from a list of options.',
    requires_audio_output: false,
    requires_audio_input: false
  },
  {
    id: 'fr_to_en_select_mc',
    title: 'French prompt → English multiple choice',
    description: 'Choose the English meaning that matches the French prompt.',
    requires_audio_output: false,
    requires_audio_input: false
  },
  {
    id: 'en_to_fr_type',
    title: 'English prompt → type French',
    description: 'Type the French word that corresponds to the English prompt.',
    requires_audio_output: false,
    requires_audio_input: false
  },
  {
    id: 'fr_to_en_type',
    title: 'French prompt → type English',
    description: 'Type the English meaning that fits the French prompt.',
    requires_audio_output: false,
    requires_audio_input: false
  },
  {
    id: 'fr_audio_to_en_mc',
    title: 'French audio → English multiple choice',
    description: 'Listen to the French audio before picking the English meaning.',
    requires_audio_output: true,
    requires_audio_input: false
  },
  {
    id: 'fr_audio_to_fr_type',
    title: 'French audio → type French',
    description: 'Type the French word that matches the played audio.',
    requires_audio_output: true,
    requires_audio_input: false
  },
  {
    id: 'fr_shown_pronounce_fr',
    title: 'French text → pronounce French',
    description: 'Speak the French word that is shown on screen.',
    requires_audio_output: false,
    requires_audio_input: true
  },
  {
    id: 'en_shown_pronounce_fr',
    title: 'English prompt → pronounce French',
    description: 'Say the French word indicated by the English prompt.',
    requires_audio_output: false,
    requires_audio_input: true
  }
];

export const LAST_STEP = BASIC_INFO_TESTS.length - 1;
export const COMPLETION_STEP = LAST_STEP + 1;
