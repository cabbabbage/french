import type { ComponentType } from 'react';
import type { TestVariantProps } from './types';

import { IntroQuickRecapMC } from './IntroQuickRecapMC';
import { IntroCardTXT } from './IntroCardTXT';
import { EnToFrMatchMC } from './EnToFrMatchMC';
import { EnToFrMatchTXT } from './EnToFrMatchTXT';
import { EnToFrMatchSPK } from './EnToFrMatchSPK';
import { FrToEnIdentificationMC } from './FrToEnIdentificationMC';
import { FrToEnIdentificationTXT } from './FrToEnIdentificationTXT';
import { FrToEnIdentificationSPK } from './FrToEnIdentificationSPK';
import { SpellingBasicMC } from './SpellingBasicMC';
import { SpellingBasicTXT } from './SpellingBasicTXT';
import { SpellingBasicSPK } from './SpellingBasicSPK';
import { SpellingAdvancedMC } from './SpellingAdvancedMC';
import { SpellingAdvancedTXT } from './SpellingAdvancedTXT';
import { SpellingAdvancedSPK } from './SpellingAdvancedSPK';
import { PronunciationBasicMC } from './PronunciationBasicMC';
import { PronunciationBasicTXT } from './PronunciationBasicTXT';
import { PronunciationBasicSPK } from './PronunciationBasicSPK';
import { PronunciationAdvancedMC } from './PronunciationAdvancedMC';
import { PronunciationAdvancedTXT } from './PronunciationAdvancedTXT';
import { PronunciationAdvancedSPK } from './PronunciationAdvancedSPK';
import { UsageBasicMC } from './UsageBasicMC';
import { UsageBasicTXT } from './UsageBasicTXT';
import { UsageBasicSPK } from './UsageBasicSPK';
import { UsageAdvancedMC } from './UsageAdvancedMC';
import { UsageAdvancedTXT } from './UsageAdvancedTXT';
import { UsageAdvancedSPK } from './UsageAdvancedSPK';

export * from './IntroQuickRecapMC';
export * from './IntroCardTXT';
export * from './EnToFrMatchMC';
export * from './EnToFrMatchTXT';
export * from './EnToFrMatchSPK';
export * from './FrToEnIdentificationMC';
export * from './FrToEnIdentificationTXT';
export * from './FrToEnIdentificationSPK';
export * from './SpellingBasicMC';
export * from './SpellingBasicTXT';
export * from './SpellingBasicSPK';
export * from './SpellingAdvancedMC';
export * from './SpellingAdvancedTXT';
export * from './SpellingAdvancedSPK';
export * from './PronunciationBasicMC';
export * from './PronunciationBasicTXT';
export * from './PronunciationBasicSPK';
export * from './PronunciationAdvancedMC';
export * from './PronunciationAdvancedTXT';
export * from './PronunciationAdvancedSPK';
export * from './UsageBasicMC';
export * from './UsageBasicTXT';
export * from './UsageBasicSPK';
export * from './UsageAdvancedMC';
export * from './UsageAdvancedTXT';
export * from './UsageAdvancedSPK';

export const testComponentRegistry: Record<string, ComponentType<TestVariantProps>> = {
  'intro-MC': IntroQuickRecapMC,
  'intro-TXT': IntroCardTXT,
  'en_to_fr_match-MC': EnToFrMatchMC,
  'en_to_fr_match-TXT': EnToFrMatchTXT,
  'en_to_fr_match-SPK': EnToFrMatchSPK,
  'fr_to_en_identification-MC': FrToEnIdentificationMC,
  'fr_to_en_identification-TXT': FrToEnIdentificationTXT,
  'fr_to_en_identification-SPK': FrToEnIdentificationSPK,
  'spelling_basic-MC': SpellingBasicMC,
  'spelling_basic-TXT': SpellingBasicTXT,
  'spelling_basic-SPK': SpellingBasicSPK,
  'spelling_advanced-MC': SpellingAdvancedMC,
  'spelling_advanced-TXT': SpellingAdvancedTXT,
  'spelling_advanced-SPK': SpellingAdvancedSPK,
  'pronunciation_basic-MC': PronunciationBasicMC,
  'pronunciation_basic-TXT': PronunciationBasicTXT,
  'pronunciation_basic-SPK': PronunciationBasicSPK,
  'pronunciation_advanced-MC': PronunciationAdvancedMC,
  'pronunciation_advanced-TXT': PronunciationAdvancedTXT,
  'pronunciation_advanced-SPK': PronunciationAdvancedSPK,
  'usage_basic-MC': UsageBasicMC,
  'usage_basic-TXT': UsageBasicTXT,
  'usage_basic-SPK': UsageBasicSPK,
  'usage_advanced-MC': UsageAdvancedMC,
  'usage_advanced-TXT': UsageAdvancedTXT,
  'usage_advanced-SPK': UsageAdvancedSPK,
};