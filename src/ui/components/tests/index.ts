// Basic Info Test Components
import { EnToFrSelectMC } from './basicInfo/EnToFrSelectMC';
import { FrToEnSelectMC } from './basicInfo/FrToEnSelectMC';
import { EnToFrType } from './basicInfo/EnToFrType';
import { FrToEnType } from './basicInfo/FrToEnType';
import { FrAudioToEnMC } from './basicInfo/FrAudioToEnMC';
import { FrAudioToFrType } from './basicInfo/FrAudioToFrType';
import { FrShownPronounce } from './basicInfo/FrShownPronounce';
import { EnShownPronounce } from './basicInfo/EnShownPronounce';

export * from './basicInfo/EnToFrSelectMC';
export * from './basicInfo/FrToEnSelectMC';
export * from './basicInfo/EnToFrType';
export * from './basicInfo/FrToEnType';
export * from './basicInfo/FrAudioToEnMC';
export * from './basicInfo/FrAudioToFrType';
export * from './basicInfo/FrShownPronounce';
export * from './basicInfo/EnShownPronounce';

export const basicInfoTestRegistry = {
  'en_to_fr_select_mc': EnToFrSelectMC,
  'fr_to_en_select_mc': FrToEnSelectMC,
  'en_to_fr_type': EnToFrType,
  'fr_to_en_type': FrToEnType,
  'fr_audio_to_en_mc': FrAudioToEnMC,
  'fr_audio_to_fr_type': FrAudioToFrType,
  'fr_shown_pronounce_fr': FrShownPronounce,
  'en_shown_pronounce_fr': EnShownPronounce,
};
