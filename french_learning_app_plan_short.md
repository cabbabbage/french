# French Learning App Plan (Short)

This is a concrete, buildable outline for: data model, phase unlocking, scoring, test catalog, and orchestration + selection logic.

---

## 1) Data Model

Each entry in `french.json` includes:

- `french_word`
- `part_of_speech` (noun, verb, adjective, adverb, expression)
- `english_meanings` (list)
- `pronunciation_guide`
- `learning_phases` (9 phase objects)
- optional POS blocks: `noun_data`, `verb_data`, `adjective_data`, `adverb_data` (example sentences + grammar metadata)

Each phase object:

```json
"intro": { "user_progress": 0, "target_progress": 3 }
```

Phase complete when `user_progress >= target_progress` (progress may go negative).

---

## 2) Result Codes + Scoring

Every test returns:

- `2` = correct first try
- `1` = correct second try
- `0` = incorrect both tries

Scoring (all phases except intro):

- `2` => `+1`
- `1` => `+0`
- `0` => `-1`

Intro special case:

- IntroCard always returns `2`
- Intro never decrements

---

## 3) Phases + Unlocking

Phases (in order):

1. `intro`
2. `en_to_fr_match`
3. `fr_to_en_identification`
4. `spelling_basic`
5. `spelling_advanced`
6. `pronunciation_basic`
7. `pronunciation_advanced`
8. `usage_basic`
9. `usage_advanced`

Unlock rules (per word), using `progress_ratio = user_progress / target_progress`:

- `intro`: always
- `en_to_fr_match`: intro.progress >= 1
- `fr_to_en_identification`: en_to_fr_match.ratio >= 0.30
- `spelling_basic`: en_to_fr_match.ratio >= 0.30 AND fr_to_en_identification.ratio >= 0.30
- `spelling_advanced`: spelling_basic.ratio >= 0.50
- `pronunciation_basic`: intro complete
- `pronunciation_advanced`: pronunciation_basic.ratio >= 0.50
- `usage_basic`: en_to_fr_match.ratio >= 0.60 AND fr_to_en_identification.ratio >= 0.60
- `usage_advanced`: usage_basic.ratio >= 0.60 AND (spelling + pronunciation not both at 0)

Optional hard guard (recommended):
- Do not schedule `usage_advanced` unless all prior phases are >= 50 percent.

---

## 4) Audio Capability Gating (Critical)

When the app opens, the user chooses capabilities:

- `has_audio_output` (speakers/headphones for TTS playback)
- `has_audio_input` (microphone for STT speaking tests)

Each test type must declare two flags:

- `requires_audio_output: bool` (the test needs playback as a requirement)
- `requires_audio_input: bool` (the test needs mic input as a requirement)

Selection rule:
- If `requires_audio_output` is True and user lacks output, do not schedule that test.
- If `requires_audio_input` is True and user lacks input, do not schedule that test.
- If a word’s only unlocked / incomplete tests all require missing capability, skip that word for now.

Notes:
- Many tests may *offer* audio optionally. Only set `requires_audio_output=True` when audio is required to complete the test (dictation, audio matching, etc.).

---

## 5) Test Catalog (MC + Text + Speech per phase)

Each phase has three variants:
- MC = multiple choice
- TXT = text input
- SPK = speech input

Basic phases: solvable by reading text (audio optional).
Advanced phases: require listening (audio output required).

### 5.1 `intro`
- **IntroCard** (forced completion)
  - requires_audio_output: True (user must play word audio once)
  - requires_audio_input: False
- **IntroQuickRecap (MC)**
  - requires_audio_output: False
  - requires_audio_input: False

### 5.2 `en_to_fr_match`
- MC: pick French word from English meaning
  - output: False, input: False
- TXT: type French word from English meaning
  - output: False, input: False
- SPK: say French word from English meaning
  - output: False, input: True

### 5.3 `fr_to_en_identification`
- MC: pick English meaning from French word/sentence
  - output: False, input: False
- TXT: type English meaning
  - output: False, input: False
- SPK: say English meaning
  - output: False, input: True

### 5.4 `spelling_basic`
- MC: missing letters / choose spelling
  - output: False, input: False
- TXT: jumble with hints, type full word
  - output: False, input: False
- SPK: say the word (STT check)
  - output: False, input: True

### 5.5 `spelling_advanced` (dictation)
- MC: hear word, choose spelling
  - output: True, input: False
- TXT: hear word, type spelling
  - output: True, input: False
- SPK: hear word, repeat aloud
  - output: True, input: True

### 5.6 `pronunciation_basic`
- MC: audio discrimination (pick which audio/spelling matches)
  - output: True, input: False
- TXT: record + show transcript (user confirms or auto-check)
  - output: False, input: True
- SPK: say the word (STT match)
  - output: False, input: True

### 5.7 `pronunciation_advanced` (sentence)
- MC: hear sentence, pick matching text
  - output: True, input: False
- TXT: hear sentence, type target word (or short phrase)
  - output: True, input: False
- SPK: hear sentence, repeat sentence/phrase
  - output: True, input: True

### 5.8 `usage_basic`
- MC: gap fill multiple choice
  - output: False, input: False
- TXT: choose correct sentence (type 1/2/3)
  - output: False, input: False
- SPK: read chosen sentence aloud (STT contains target)
  - output: False, input: True

### 5.9 `usage_advanced`
- MC: hear short context, pick best meaning/sentence
  - output: True, input: False
- TXT: hear prompt, write sentence using target
  - output: True, input: False
- SPK: hear prompt, speak sentence using target
  - output: True, input: True

---

## 6) POS Specific Tests (only when applicable)

These are additional test types added into spelling/usage (or as their own test types under those phases).

### Nouns (articles, gender, plural)
- ArticleChoice (MC): choose `le/la/l'` + noun (output False, input False)
- ArticleTypeIn (TXT): type article + noun (output False, input False)
- ArticleSpeak (SPK): say article + noun (output False, input True)
- PluralizeMC / PluralizeTypeIn (output False, input False)
- Contractions in sentence gap fill (du/au/de la/etc.) (output False, input False)

### Verbs (conjugation)
- ConjugationChoice (MC) (output False, input False)
- ConjugationTypeIn (TXT) (output False, input False)
- ConjugationSpeak (SPK) (output False, input True)
- DictationConjugation (advanced): hear conjugated form (output True, input False/True depending on variant)

### Adjectives (agreement, placement)
- AgreementChoice (MC) (output False, input False)
- AgreementTypeIn (TXT) (output False, input False)
- AgreementSpeak (SPK) (output False, input True)
- DictationAdjPhrase (advanced): hear phrase (output True, input False/True)

---

## 7) UI + Orchestration

### BaseTestUI (common contract)
Each test class:
- builds widgets
- allows up to 2 attempts
- calls `_finish(result_code)` with 0/1/2

Also includes:
- `test_type_key`
- `requires_audio_output`
- `requires_audio_input`

### HoverableTextDisplay
- token hover tooltips from dictionary (excluding target word tooltip)
- token click plays token audio (optional)
- phrase audio button

### TestOrchestrator
- runs a single test UI
- applies scoring
- saves JSON
- records history into selector

---

## 8) Word + Test Selection (with capability filter)

Maintain:
- recent word window (no repeat within last 3 tests)
- recent test type window (avoid repeating same test type for same word-phase)

Selection steps:
1) Build candidate (word, phase, test_type) triples:
   - phase is unlocked and incomplete
   - test_type allowed for phase
   - pass capability filter:
     - skip if requires_audio_output and user lacks output
     - skip if requires_audio_input and user lacks input
2) Weight candidates (simple):
   - favor mid progress words, avoid brand new spam, rarely pick mastered
   - apply recency spacing
3) Sample by weight (roulette wheel)
4) If empty pool: relax recency first, then allow low weight review items that fit capabilities

---

## 9) Minimal Implementation Checklist

- Add `UserCapabilities(has_audio_output, has_audio_input)` at startup.
- Add `requires_audio_output` and `requires_audio_input` to every test class.
- In selector, filter out tests and words blocked by capabilities.
- In advanced phases, ensure at least one variant requires listening (audio output).

