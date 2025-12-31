# Basic Info Phase Rework Plan

## Goal

Completely replace the existing test flow and progress system with a single ordered “Basic Info” test ladder per word.

This is a hard reset:
- Delete the old flow tests and the old progression logic.
- Ignore all legacy progress fields and phase structures that do not match this plan.
- The only progress that matters is `basic_info_step` for each word.

Key points:
- Word selection chooses a **word only** (random), not a test.
- The test shown is always the **current step** for that word.
- Each test has **up to 2 attempts** per time the word is selected.
- Word progress moves forward or backward based on performance.
- Audio input/output availability can temporarily block certain words from being selected.
- Once a word completes all tests, it is removed from the random pool.

---

## Non Goals

- Do not attempt to preserve or translate legacy learning phases.
- Do not keep old test routing, test registries, or “phase” orchestrators.
- Do not maintain compatibility with old progress fields beyond a minimal “ignore” migration.

---

## New Data Model

### Per word persisted fields

Each word must store:

- `basic_info_step: int`
  - Range: `0 .. LAST_STEP` (active ladder steps)
  - Meaning: which test to run next time this word is selected
- `basic_info_completed: bool`
  - True when the ladder is finished

Only these fields drive Basic Info behavior.

### Per session ephemeral fields (not saved)

- `attempt_index: int` (1 or 2)
- `attempt_correct_first: bool`

---

## Test Ladder Order

Define the ladder once and keep it in one list used everywhere.

Index and order:

0. **Intro**
1. **EN shown, pick FR** (multiple choice)
2. **FR shown, pick EN** (multiple choice)
3. **EN shown, type FR**
4. **FR shown, type EN**
5. **FR audio, pick EN** (multiple choice) (requires audio output)
6. **FR audio, type FR** (requires audio output)
7. **FR shown, pronounce FR** (requires audio input)
8. **EN shown, pronounce FR** (requires audio input)

`LAST_STEP = 8`

---

## Attempt Rules

Each time a word is selected, run exactly the test at `basic_info_step`.

The user gets **2 attempts** for that test.

### Progress outcome mapping

Resolve progress after attempt 1 and attempt 2:

- Correct on attempt 1:
  - Advance progress: `basic_info_step += 1`
- Wrong on attempt 1, correct on attempt 2:
  - No progress change
- Wrong on attempt 1, wrong on attempt 2:
  - Decrement progress: `basic_info_step -= 1`

### Bounds and completion

Clamp:
- minimum: `0`
- maximum: `LAST_STEP + 1` (completion marker)

Completion rule:
- if `basic_info_step` becomes `LAST_STEP + 1`, set `basic_info_completed = true`
- completed words must never be selected again

---

## Audio Capability Gating

At app start (per session), the user chooses:

- `has_audio_output: bool`
- `has_audio_input: bool`

Each ladder step declares requirements:
- Steps 5 and 6 require **audio output**
- Steps 7 and 8 require **audio input**

### Word selection gating

If a word’s current step requires audio input/output that is disabled:
- the selector must **skip that word**
- the word remains skipped until the user runs a different session with the capability enabled

This is not a progress change. It is selection gating.

---

## Word Selection Rules

### Eligible pool

Selectable words are those where:
- `basic_info_completed == false`
- AND the word is not gated by audio requirements for its current step

### Random selection

- Choose a random word from the eligible pool.
- Do not select the same word twice in a row.
- Exception: if only 1 eligible word exists, allow repeat.

### No eligible words

If the eligible pool is empty:
- Show a clear message explaining why:
  - all words completed, or
  - audio disabled but remaining words require it
- Provide an obvious way to restart a session with audio enabled or exit.

---

## Required Code Changes

### 1. Delete legacy flow and tests

Remove old systems that decide which test to run via phases, schedules, “learning_phases”, or legacy progress rules.

Actions:
- Delete or disable legacy test registries and phase orchestrators.
- Delete or de-register old tests that are not part of the Basic Info ladder.
- Remove any “phase progression” logic from selection and routing.

Result:
- Only the Basic Info orchestrator and ladder tests exist in the active learning mode.

### 2. Add new progress fields

Edit the persisted word structure (in memory model and saved JSON):
- add `basic_info_step` default `0`
- add `basic_info_completed` default `false` (or derive from step)

### 3. Migration behavior: ignore old progress

On load:
- If `basic_info_step` is missing, set it to `0`
- If `basic_info_completed` is missing, set it to `false`
- Do not read or map any legacy fields into these values
- Legacy fields may remain in the JSON but must not influence behavior

### 4. Centralize ladder definitions

Create a single module defining the ladder:

- `BASIC_INFO_TESTS = [ ... ]`

Each entry includes:
- `id` or enum
- `requires_audio_output: bool`
- `requires_audio_input: bool`
- UI component or factory used to render/run

### 5. Replace “word selects test” with “word selects only”

Refactor the learning loop into:

1. `word = select_random_word(eligible_words, last_word_id)`
2. `step = word.basic_info_step`
3. `test = BASIC_INFO_TESTS[step]`
4. Run test with up to 2 attempts
5. Apply step update rules
6. Persist word progress
7. If completed, remove from pool
8. Repeat

### 6. Attempt handling must be centralized

Do not let individual tests change progress.

Each test returns only:
- `is_correct: bool`

The orchestrator handles:
- attempt counting
- progress update rules
- clamping
- completion

### 7. Update selector

Implement `get_eligible_words(words, settings, last_word_id)`:
- filter out completed
- filter out audio gated for current step
- avoid last selected if more than 1 eligible word exists

### 8. Session settings capture

At program launch (or before starting):
- ask user about audio input and audio output availability
- store these in runtime settings used by selector and test runner

---

## UI Requirements Per Test

Each test screen must support:
- Attempt indicator: “Attempt 1 of 2” / “Attempt 2 of 2”
- Clear feedback: correct/incorrect
- A Next action that moves to:
  - attempt 2, or
  - next random word after applying progress logic

MCQ tests:
- generate distractors from other words
- distractor generation does not depend on the target word’s progress

Typing tests:
- normalize input consistently (case, accents rule decision)

Audio output tests:
- play prompt audio (TTS or recorded)

Audio input tests:
- record voice and validate via your chosen method (or stub until implemented)

If required audio capability is off, the selector never chooses that word in the first place.

---

## Acceptance Checklist

- Old flow tests and legacy phase routing are removed or fully ignored.
- The only persisted progress fields used are `basic_info_step` and `basic_info_completed`.
- Random selection chooses a word only. Test is derived from that word’s current step.
- No word repeats twice in a row unless it is the only eligible word.
- Two attempt logic matches:
  - correct first -> advance
  - correct second -> no change
  - wrong twice -> decrement
- Words gated by disabled audio at their current step are skipped until a later session.
- Completed words never appear again.

---

## Suggested Module Layout

Adjust to your repo naming, but keep these separations:

- `models/word.py`
  - add `basic_info_step`, `basic_info_completed`
- `learning/basic_info/tests.py`
  - ladder definitions + requirements
- `learning/basic_info/orchestrator.py`
  - selection + attempt handling + persistence
- `learning/basic_info/selector.py`
  - eligible pool logic
- `ui/tests/`
  - UI components for each test type
