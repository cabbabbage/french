import json
import csv
import re
from pygrammalecte import grammalecte_text
import argostranslate.package
import argostranslate.translate
import time

REQUIRED_PHASES = [
    "intro",
    "en_to_fr_match",
    "fr_identification",
    "spelling_basic",
    "spelling_advanced",
    "pronunciation_basic",
    "pronunciation_advanced",
    "usage_basic",
    "usage_advanced",
]

def grammar_check_and_fix(data):
    """
    For every example dict {"fr": "...", "en": "..."} in french.json:
      1) Fix French grammar.
      2) Translate fixed French to English.
      3) Replace both "fr" and "en" with the corrected / retranslated values.

    Uses:
      - pygrammalecte for French grammar
      - argostranslate for offline fr->en translation
    """
    print("=== Starting grammar check and fix ===")
    grammar_fixes_applied = 0
    translation_fixes_applied = 0

    translation_obj = None
    translation_error = None
    try:
        translation_obj = argostranslate.translate.get_translation_from_codes("fr", "en")
    except Exception as exc:  # pragma: no cover - best-effort translation
        translation_error = exc
    if translation_obj is None:
        msg = "Argos Translate fr->en package is not installed; english examples will remain unchanged."
        if translation_error:
            msg += f" ({translation_error})"
        print(msg)

    def fix_french_sentence(fr_text: str) -> str:
        # Apply Grammalecte suggestions directly
        chars = list(fr_text)
        offset = 0
        fixes = []

        messages = list(grammalecte_text(fr_text))

        for msg in messages:
            suggestions = getattr(msg, "suggestions", None)
            if not suggestions:
                continue

            start = msg.start + offset
            end = msg.end + offset
            replacement = suggestions[0]

            before_len = end - start
            chars[start:end] = list(replacement)
            after_len = len(replacement)
            offset += after_len - before_len

            fixes.append(f"  '{fr_text[start:end]}' -> '{replacement}'")

        fixed = "".join(chars)
        if fixes:
            print(f"  Grammar fixes for '{fr_text}':")
            for fix in fixes:
                print(f"    {fix}")
        return fixed

    def translate_fr_en(fr_text):
        nonlocal translation_obj
        if translation_obj is None:
            return None
        try:
            return translation_obj.translate(fr_text)
        except Exception as exc:
            print(f"Argos Translate fr->en failed; english updates disabled: {exc}")
            translation_obj = None
            return None

    def handle_example_dict(ex: dict, path: str):
        nonlocal grammar_fixes_applied, translation_fixes_applied
        fr = ex.get("fr")
        if not isinstance(fr, str) or not fr.strip():
            return

        print(f"  Processing example at {path}: '{fr}'")

        # 1) fix French
        fixed_fr = fix_french_sentence(fr)
        if fixed_fr != fr:
            grammar_fixes_applied += 1
            print(f"    French fixed: '{fr}' -> '{fixed_fr}'")

        # 2) translate to English (only if the package is available)
        new_en = translate_fr_en(fixed_fr)
        old_en = ex.get("en", "")

        ex["fr"] = fixed_fr
        if new_en is not None and new_en != old_en:
            translation_fixes_applied += 1
            print(f"    English retranslated: '{old_en}' -> '{new_en}'")
            ex["en"] = new_en

    # Walk every entry and hit every example list
    for entry_index, entry in enumerate(data):
        if not isinstance(entry, dict):
            continue

        pos = entry.get("part_of_speech")
        word = entry.get("french_word", "unknown")
        print(f"  Checking grammar for entry {entry_index}: {word} ({pos})")

        if pos == "noun":
            noun_data = entry.get("noun_data", {})
            art = noun_data.get("articles_examples", {})
            for bucket in ["un_une", "le_la_l", "du_de_la_de_l_des", "plural"]:
                examples = art.get(bucket)
                if isinstance(examples, list):
                    for i, ex in enumerate(examples):
                        if isinstance(ex, dict):
                            handle_example_dict(ex, f"noun_data.articles_examples.{bucket}[{i}]")

        elif pos == "verb":
            verb_data = entry.get("verb_data", {})
            exmap = verb_data.get("examples", {})
            for tense in ["present", "past", "future", "conditional"]:
                examples = exmap.get(tense)
                if isinstance(examples, list):
                    for i, ex in enumerate(examples):
                        if isinstance(ex, dict):
                            handle_example_dict(ex, f"verb_data.examples.{tense}[{i}]")

        elif pos == "adjective":
            adj_data = entry.get("adjective_data", {})
            examples = adj_data.get("examples")
            if isinstance(examples, list):
                for i, ex in enumerate(examples):
                    if isinstance(ex, dict):
                        handle_example_dict(ex, f"adjective_data.examples[{i}]")

        elif pos == "adverb":
            adv_data = entry.get("adverb_data", {})
            examples = adv_data.get("examples")
            if isinstance(examples, list):
                for i, ex in enumerate(examples):
                    if isinstance(ex, dict):
                        handle_example_dict(ex, f"adverb_data.examples[{i}]")

    print(f"=== Grammar check completed: {grammar_fixes_applied} grammar fixes, {translation_fixes_applied} translations ===")
    # Return data in case you want to inspect or chain calls
    return data


def validate_french_json():
    start_time = time.time()
    print("=== Starting validation of french.json ===")

    try:
        with open("french.json", "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error loading french.json: {e}")
        return False

    if not isinstance(data, list):
        print("Error: french.json must be a JSON array of entries")
        return False

    print(f"Loaded {len(data)} entries from french.json")

    errors = []
    entries_processed = 0

    # Check for duplicate french_word entries (case insensitive) and remove duplicates
    seen = set()
    new_data = []
    removed_count = 0
    for entry in data:
        if not isinstance(entry, dict):
            errors.append(f"Entry {len(new_data)} is not a dictionary")
            new_data.append(entry)
            continue
        word = entry.get("french_word")
        if not isinstance(word, str) or not word.strip():
            new_data.append(entry)
            continue
        key = word.strip().lower()
        if key not in seen:
            new_data.append(entry)
            seen.add(key)
        else:
            removed_count += 1

    data = new_data

    if removed_count > 0:
        # Save the cleaned data back to french.json
        with open("french.json", "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Removed {removed_count} duplicate entries.")

    unique_count = len(seen)

    required_top_keys = {
        "french_word",
        "part_of_speech",
        "english_meanings",
        "pronunciation_guide",
        "learning_phases",
    }
    valid_pos = {"noun", "verb", "adjective", "adverb"}

    for i, entry in enumerate(data):
        if not isinstance(entry, dict):
            continue

        word = entry.get("french_word", "unknown")
        pos = entry.get("part_of_speech", "unknown")
        print(f"Processing entry {i+1}/{len(data)}: '{word}' ({pos})")
        entries_processed += 1

        # Check top-level keys
        entry_keys = set(entry.keys())
        missing_keys = required_top_keys - entry_keys
        if missing_keys:
            errors.append(f"Entry {i} ({word}): missing required keys {missing_keys}")
            print(f"  FAIL: Missing keys {missing_keys}")
        else:
            print("  PASS: Top-level keys")

        # Check for extra keys (allowing the specific _data keys)
        allowed_keys = required_top_keys | {"noun_data", "verb_data", "adjective_data", "adverb_data"}
        extra_keys = entry_keys - allowed_keys
        if extra_keys:
            errors.append(f"Entry {i} ({word}): extra keys {extra_keys}")
            print(f"  FAIL: Extra keys {extra_keys}")
        else:
            print("  PASS: No extra keys")

        # Validate field types and values
        if "french_word" in entry and not isinstance(entry["french_word"], str):
            errors.append(f"Entry {i}: french_word is not a string")
            print("  FAIL: french_word not string")
        else:
            print("  PASS: french_word valid")

        if "part_of_speech" in entry:
            pos = entry["part_of_speech"]
            if pos not in valid_pos:
                errors.append(f"Entry {i}: invalid part_of_speech '{pos}'")
                print(f"  FAIL: Invalid POS '{pos}'")
            else:
                print(f"  PASS: POS '{pos}'")
                data_key = f"{pos}_data"
                if data_key not in entry:
                    errors.append(f"Entry {i}: missing {data_key}")
                    print(f"  FAIL: Missing {data_key}")
                else:
                    print(f"  PASS: {data_key} present")
                    validate_pos_data(entry[data_key], pos, i, word, errors)

        if "english_meanings" in entry:
            eng_mean = entry["english_meanings"]
            if (
                not isinstance(eng_mean, list)
                or not eng_mean
                or not all(isinstance(m, str) for m in eng_mean)
            ):
                errors.append(f"Entry {i} ({word}): english_meanings must be a non empty list of strings")
                print("  FAIL: english_meanings invalid")
            else:
                print(f"  PASS: english_meanings ({len(eng_mean)} items)")

        if "pronunciation_guide" in entry and not isinstance(entry["pronunciation_guide"], str):
            errors.append(f"Entry {i} ({word}): pronunciation_guide is not a string")
            print("  FAIL: pronunciation_guide not string")
        else:
            print("  PASS: pronunciation_guide valid")

        if "learning_phases" in entry:
            try:
                validate_learning_phases(entry["learning_phases"], i, word, errors)
                print("  PASS: learning_phases valid")
            except Exception as e:
                print(f"  FAIL: learning_phases error: {e}")
        else:
            print("  FAIL: learning_phases missing")

    print(f"Unique french_word count: {unique_count}")

    # Always write progress.csv even if there are errors
    try:
        write_progress_csv(data, "progress.csv")
        print("Wrote progress.csv successfully")
    except Exception as e:
        errors.append(f"Failed to write progress.csv: {e}")
        print(f"FAIL: Writing progress.csv: {e}")

    elapsed_time = time.time() - start_time
    print(f"=== Validation completed in {elapsed_time:.2f} seconds ===")
    print(f"Entries processed: {entries_processed}")
    print(f"Errors found: {len(errors)}")

    if errors:
        print("Validation errors:")
        for error in errors:
            print(f"  - {error}")
        return False

    grammar_check_and_fix(data)
    print("All entries are valid!")
    return True


def validate_learning_phases(phases, index, word, errors):
    """
    Accepts either:
    - list of objects: [{ "phase": "...", "user_progress": 0, "target_progress": 10 }, ...]
    - dict mapping: { "intro": { "user_progress": 0, "target_progress": 3 }, ... }

    Entries do not need specific default values, but the structure must be valid and contain all required phases.
    """
    print(f"    Validating learning_phases for {word}")
    if isinstance(phases, list):
        phase_map = {}
        for j, item in enumerate(phases):
            if not isinstance(item, dict):
                errors.append(f"Entry {index} ({word}): learning_phases[{j}] is not a dictionary")
                continue

            phase_name = item.get("phase")
            if not isinstance(phase_name, str) or not phase_name.strip():
                errors.append(f"Entry {index} ({word}): learning_phases[{j}] missing valid 'phase'")
                continue

            phase_key = phase_name.strip()
            if phase_key in phase_map:
                errors.append(f"Entry {index} ({word}): duplicate phase '{phase_key}' in learning_phases")
                continue

            phase_map[phase_key] = item

        missing = [p for p in REQUIRED_PHASES if p not in phase_map]
        extra = [p for p in phase_map.keys() if p not in REQUIRED_PHASES]
        if missing:
            errors.append(f"Entry {index} ({word}): learning_phases missing phases {set(missing)}")
        if extra:
            errors.append(f"Entry {index} ({word}): learning_phases has extra phases {set(extra)}")

        for phase_key, obj in phase_map.items():
            validate_phase_object(obj, index, word, phase_key, errors, expects_phase_key=True)

    elif isinstance(phases, dict):
        missing = [p for p in REQUIRED_PHASES if p not in phases]
        extra = [p for p in phases.keys() if p not in REQUIRED_PHASES]
        if missing:
            errors.append(f"Entry {index} ({word}): learning_phases missing phases {set(missing)}")
        if extra:
            errors.append(f"Entry {index} ({word}): learning_phases has extra phases {set(extra)}")

        for phase_key in REQUIRED_PHASES:
            if phase_key not in phases:
                continue
            obj = phases[phase_key]
            if not isinstance(obj, dict):
                errors.append(f"Entry {index} ({word}): learning_phases.{phase_key} is not a dictionary")
                continue
            validate_phase_object(obj, index, word, phase_key, errors, expects_phase_key=False)

    else:
        errors.append(f"Entry {index} ({word}): learning_phases must be a list or a dictionary")


def validate_phase_object(obj, index, word, phase_key, errors, expects_phase_key):
    allowed = {"user_progress", "target_progress"}
    if expects_phase_key:
        allowed = allowed | {"phase"}

    obj_keys = set(obj.keys())
    extra = obj_keys - allowed
    if extra:
        errors.append(f"Entry {index} ({word}): phase '{phase_key}' has extra keys {extra}")

    if "user_progress" not in obj:
        errors.append(f"Entry {index} ({word}): phase '{phase_key}' missing user_progress")
    else:
        if not isinstance(obj["user_progress"], int):
            errors.append(f"Entry {index} ({word}): phase '{phase_key}' user_progress is not an integer")
        elif obj["user_progress"] < 0:
            errors.append(f"Entry {index} ({word}): phase '{phase_key}' user_progress is negative")

    if "target_progress" not in obj:
        errors.append(f"Entry {index} ({word}): phase '{phase_key}' missing target_progress")
    else:
        if not isinstance(obj["target_progress"], int):
            errors.append(f"Entry {index} ({word}): phase '{phase_key}' target_progress is not an integer")
        elif obj["target_progress"] <= 0:
            errors.append(f"Entry {index} ({word}): phase '{phase_key}' target_progress must be > 0")

    if expects_phase_key:
        if "phase" not in obj or obj.get("phase") != phase_key:
            errors.append(f"Entry {index} ({word}): phase object does not match phase name '{phase_key}'")


def validate_pos_data(data, pos, index, word, errors):
    print(f"      Validating {pos}_data for {word}")
    if not isinstance(data, dict):
        errors.append(f"Entry {index} ({word}): {pos}_data is not a dictionary")
        return

    if pos == "noun":
        required_keys = {"gender", "singular_form", "plural_form", "articles_examples"}
        keys = set(data.keys())
        missing = required_keys - keys
        if missing:
            errors.append(f"Entry {index} ({word}): noun_data missing {missing}")
        extra = keys - required_keys
        if extra:
            errors.append(f"Entry {index} ({word}): noun_data has extra keys {extra}")

        if "gender" in data and data["gender"] not in ["masculine", "feminine"]:
            errors.append(f"Entry {index} ({word}): invalid gender '{data['gender']}'")

        for field in ["singular_form", "plural_form"]:
            if field in data and not isinstance(data[field], str):
                errors.append(f"Entry {index} ({word}): {field} is not a string")

        if "articles_examples" in data:
            if not isinstance(data["articles_examples"], dict):
                errors.append(f"Entry {index} ({word}): articles_examples is not a dictionary")
            else:
                required_article_keys = {"un_une", "le_la_l", "du_de_la_de_l_des", "plural"}
                art_keys = set(data["articles_examples"].keys())
                missing_art = required_article_keys - art_keys
                if missing_art:
                    errors.append(f"Entry {index} ({word}): articles_examples missing keys {missing_art}")
                extra_art = art_keys - required_article_keys
                if extra_art:
                    errors.append(f"Entry {index} ({word}): articles_examples has extra keys {extra_art}")
                for key in required_article_keys:
                    if key in data["articles_examples"]:
                        validate_examples(
                            data["articles_examples"][key],
                            f"articles_examples.{key}",
                            index,
                            word,
                            errors,
                        )

    elif pos == "verb":
        required_keys = {"infinitive", "reflexive", "conjugations", "examples"}
        keys = set(data.keys())
        missing = required_keys - keys
        if missing:
            errors.append(f"Entry {index} ({word}): verb_data missing {missing}")
        extra = keys - required_keys
        if extra:
            errors.append(f"Entry {index} ({word}): verb_data has extra keys {extra}")

        if "infinitive" in data and not isinstance(data["infinitive"], str):
            errors.append(f"Entry {index} ({word}): infinitive is not a string")

        if "reflexive" in data and not isinstance(data["reflexive"], bool):
            errors.append(f"Entry {index} ({word}): reflexive is not a boolean")

        if "conjugations" in data:
            validate_conjugations(data["conjugations"], index, word, errors)

        if "examples" in data:
            if not isinstance(data["examples"], dict):
                errors.append(f"Entry {index} ({word}): examples is not a dictionary")
            else:
                required_ex_keys = {"present", "past", "future", "conditional"}
                ex_keys = set(data["examples"].keys())
                missing_ex = required_ex_keys - ex_keys
                if missing_ex:
                    errors.append(f"Entry {index} ({word}): examples missing keys {missing_ex}")
                extra_ex = ex_keys - required_ex_keys
                if extra_ex:
                    errors.append(f"Entry {index} ({word}): examples has extra keys {extra_ex}")
                for key in required_ex_keys:
                    if key in data["examples"]:
                        validate_examples(data["examples"][key], f"examples.{key}", index, word, errors)

    elif pos == "adjective":
        required_keys = {"masculine_singular", "feminine_singular", "masculine_plural", "feminine_plural", "examples"}
        keys = set(data.keys())
        missing = required_keys - keys
        if missing:
            errors.append(f"Entry {index} ({word}): adjective_data missing {missing}")
        extra = keys - required_keys
        if extra:
            errors.append(f"Entry {index} ({word}): adjective_data has extra keys {extra}")

        for field in required_keys - {"examples"}:
            if field in data and not isinstance(data[field], str):
                errors.append(f"Entry {index} ({word}): {field} is not a string")

        if "examples" in data:
            validate_examples(data["examples"], "examples", index, word, errors)

    elif pos == "adverb":
        required_keys = {"examples"}
        keys = set(data.keys())
        missing = required_keys - keys
        if missing:
            errors.append(f"Entry {index} ({word}): adverb_data missing {missing}")
        extra = keys - required_keys
        if extra:
            errors.append(f"Entry {index} ({word}): adverb_data has extra keys {extra}")

        if "examples" in data:
            validate_examples(data["examples"], "examples", index, word, errors)


def validate_conjugations(conj, index, word, errors):
    print(f"        Validating conjugations for {word}")
    if not isinstance(conj, dict):
        errors.append(f"Entry {index} ({word}): conjugations is not a dictionary")
        return

    required_tenses = {"present", "imparfait", "futur_simple", "conditional", "past_participle"}
    conj_keys = set(conj.keys())
    missing_conj = required_tenses - conj_keys
    if missing_conj:
        errors.append(f"Entry {index} ({word}): conjugations missing {missing_conj}")
    extra_conj = conj_keys - required_tenses
    if extra_conj:
        errors.append(f"Entry {index} ({word}): conjugations has extra keys {extra_conj}")

    if "present" in conj:
        present = conj["present"]
        if not isinstance(present, dict):
            errors.append(f"Entry {index} ({word}): present conjugations is not a dictionary")
        else:
            required_pronouns = {"je", "tu", "il_elle_on", "nous", "vous", "ils_elles"}
            pr_keys = set(present.keys())
            missing_pr = required_pronouns - pr_keys
            if missing_pr:
                errors.append(f"Entry {index} ({word}): present conjugations missing {missing_pr}")
            extra_pr = pr_keys - required_pronouns
            if extra_pr:
                errors.append(f"Entry {index} ({word}): present conjugations has extra keys {extra_pr}")
            for p in required_pronouns:
                if p in present and not isinstance(present[p], str):
                    errors.append(f"Entry {index} ({word}): present {p} is not a string")

    for tense in ["imparfait", "futur_simple", "conditional"]:
        if tense in conj:
            if not isinstance(conj[tense], dict):
                errors.append(f"Entry {index} ({word}): {tense} is not a dictionary")
            else:
                if "je" not in conj[tense]:
                    errors.append(f"Entry {index} ({word}): {tense} missing 'je'")
                elif not isinstance(conj[tense]["je"], str):
                    errors.append(f"Entry {index} ({word}): {tense} 'je' is not a string")
                extra_tense = set(conj[tense].keys()) - {"je"}
                if extra_tense:
                    errors.append(f"Entry {index} ({word}): {tense} has extra keys {extra_tense}")

    if "past_participle" in conj and not isinstance(conj["past_participle"], str):
        errors.append(f"Entry {index} ({word}): past_participle is not a string")


def validate_examples(examples, path, index, word, errors):
    print(f"          Validating examples for {word} at {path}")
    if not isinstance(examples, list):
        errors.append(f"Entry {index} ({word}): {path} is not a list")
        return

    if len(examples) != 3:
        errors.append(f"Entry {index} ({word}): {path} does not have exactly 3 items (has {len(examples)})")
        return

    for j, ex in enumerate(examples):
        if not isinstance(ex, dict):
            errors.append(f"Entry {index} ({word}): {path}[{j}] is not a dictionary")
            continue

        ex_keys = set(ex.keys())
        if ex_keys != {"fr", "en"}:
            errors.append(f"Entry {index} ({word}): {path}[{j}] has keys {ex_keys}, expected {{'fr', 'en'}}")

        for k in ["fr", "en"]:
            if k in ex and not isinstance(ex[k], str):
                errors.append(f"Entry {index} ({word}): {path}[{j}].{k} is not a string")


def write_progress_csv(data, out_path):
    """
    Writes progress.csv with rows:
    english_word, french_word, user_progress_sum, target_progress_sum
    """
    rows = []
    for entry in data:
        if not isinstance(entry, dict):
            continue

        french_word = entry.get("french_word", "")
        english_meanings = entry.get("english_meanings", [])
        english_word = ""
        if isinstance(english_meanings, list) and english_meanings:
            if isinstance(english_meanings[0], str):
                english_word = english_meanings[0]

        phases = entry.get("learning_phases", None)
        user_sum = 0
        target_sum = 0

        if isinstance(phases, list):
            for item in phases:
                if not isinstance(item, dict):
                    continue
                up = item.get("user_progress", 0)
                tp = item.get("target_progress", 0)
                if isinstance(up, int):
                    user_sum += up
                if isinstance(tp, int):
                    target_sum += tp

        elif isinstance(phases, dict):
            for _, item in phases.items():
                if not isinstance(item, dict):
                    continue
                up = item.get("user_progress", 0)
                tp = item.get("target_progress", 0)
                if isinstance(up, int):
                    user_sum += up
                if isinstance(tp, int):
                    target_sum += tp

        rows.append([english_word, french_word, user_sum, target_sum])

    with open(out_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["english_word", "french_word", "user_progress_sum", "target_progress_sum"])
        w.writerows(rows)




"""Grammalecte wrapper."""

import io
import json
import os
import subprocess
import sys
import sysconfig
import tempfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import Generator, List, Union
from zipfile import ZipFile

import requests


def safe_string(text: str) -> str:
    if os.name == "nt":
        return text.encode("cp1252", errors="replace").decode("cp1252")
    return text


@dataclass
class GrammalecteMessage:
    """Base class for Grammalecte messages."""

    line: int
    start: int
    end: int

    def __str__(self):
        return f"Ligne {self.line} [{self.start}:{self.end}]"

    def __eq__(self, other: "GrammalecteMessage"):
        # to be sortable, but misleading equality usage
        return (self.line, self.start, self.end) == (other.line, other.start, other.end)

    def __lt__(self, other: "GrammalecteMessage"):
        return (self.line, self.start, self.end) < (other.line, other.start, other.end)


@dataclass
class GrammalecteSpellingMessage(GrammalecteMessage):
    """Spelling error message."""

    word: str
    message: str = field(init=False)

    def __post_init__(self):
        self.message = f"Mot inconnu : {self.word}"

    def __str__(self):
        return super().__str__() + " " + self.message

    @staticmethod
    def from_dict(line: int, grammalecte_dict: dict) -> "GrammalecteSpellingMessage":
        """Instanciate GrammalecteSpellingMessage from Grammalecte result."""
        return GrammalecteSpellingMessage(
            line=line,
            start=int(grammalecte_dict["nStart"]),
            end=int(grammalecte_dict["nEnd"]),
            word=safe_string(grammalecte_dict["sValue"]),
        )


@dataclass
class GrammalecteGrammarMessage(GrammalecteMessage):
    """Grammar error message."""

    url: str
    color: List[int]
    suggestions: List[str]
    message: str
    rule: str
    type: str

    def __str__(self):
        ret = super().__str__() + f" [{self.rule}] {self.message}"
        if self.suggestions:
            ret += f" (Suggestions : {', '.join(self.suggestions)})"
        return ret

    @staticmethod
    def from_dict(line: int, grammalecte_dict: dict) -> "GrammalecteGrammarMessage":
        """Instanciate GrammalecteGrammarMessage from Grammalecte result."""
        return GrammalecteGrammarMessage(
            line=line,
            start=int(grammalecte_dict["nStart"]),
            end=int(grammalecte_dict["nEnd"]),
            url=grammalecte_dict["URL"],
            color=grammalecte_dict["aColor"],
            suggestions=[
                safe_string(suggestion)
                for suggestion in grammalecte_dict["aSuggestions"]
            ],
            message=safe_string(
                grammalecte_dict["sMessage"].replace("“", "« ").replace("”", " »")
            ),
            rule=grammalecte_dict["sRuleId"],
            type=grammalecte_dict["sType"],
        )


def grammalecte_text(text: str) -> Generator[GrammalecteMessage, None, None]:
    """Run grammalecte on a string, generate messages."""
    with tempfile.TemporaryDirectory() as tmpdirname:
        tmpfile = Path(tmpdirname) / "file.txt"
        tmpfile.write_text(text, encoding="utf-8")
        yield from grammalecte_file(tmpfile)


def grammalecte_file(
    filename: Union[str, Path],
) -> Generator[GrammalecteMessage, None, None]:
    """Run grammalecte on a file given its path, generate messages."""
    stdout = '{"data":[]}'
    filename = str(filename)
    try:
        stdout = _run_grammalecte(filename)
    except FileNotFoundError as e:
        if e.filename == "grammalecte-cli.py":
            _install_grammalecte()
            stdout = _run_grammalecte(filename)
    yield from _convert_to_messages(stdout)


def _convert_to_messages(
    grammalecte_json: str,
) -> Generator[GrammalecteMessage, None, None]:
    # grammalecte 1.12.0 adds python comments in the JSON!
    grammalecte_json_str = "\n".join(
        line for line in grammalecte_json.splitlines() if not line.startswith("#")
    )
    warnings = json.loads(grammalecte_json_str)
    for warning in warnings["data"]:
        lineno = int(warning["iParagraph"])
        messages = []
        for error in warning["lGrammarErrors"]:
            messages.append(GrammalecteGrammarMessage.from_dict(lineno, error))
        for error in warning["lSpellingErrors"]:
            messages.append(GrammalecteSpellingMessage.from_dict(lineno, error))
        for message in sorted(messages):
            yield message


def _run_grammalecte(filepath: str) -> str:
    """Run Grammalecte on a file."""
    # Use the Python API directly instead of CLI
    import grammalecte

    # inspired from grammalecte-cli.py, keep the bad naming convention
    # to ease further maintainance
    warnings_list = []
    oGrammarChecker = grammalecte.GrammarChecker("fr")
    oGrammarChecker.gce.setOptions({"html": True, "latex": True, "apos": False})

    # Read the file and split into paragraphs
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    paragraphs = content.split('\n\n')
    for i, sText in enumerate(paragraphs):
        if sText.strip():
            sText = oGrammarChecker.getParagraphErrorsAsJSON(
                i,
                sText.strip(),
                bContext=False,
                bEmptyIfNoErrors=True,
                bSpellSugg=False,
                bReturnText=False,
                lLineSet=[],  # Not used
            )
            warnings_list.append(sText)
    warnings = ",\n".join(warnings_list)
    result = f'{{"data": [\n{warnings}\n]}}'
    return result


def _install_grammalecte():
    """Install grammalecte CLI."""
    version = "2.1.1"
    tmpdirname = tempfile.mkdtemp(prefix="grammalecte_")
    tmpdirname = Path(tmpdirname)
    tmpdirname.mkdir(exist_ok=True)
    download_request = requests.get(
        f"https://grammalecte.net/zip/Grammalecte-fr-v{version}.zip"
    )
    download_request.raise_for_status()
    zip_file = tmpdirname / f"Grammalecte-fr-v{version}.zip"
    zip_file.write_bytes(download_request.content)
    with ZipFile(zip_file, "r") as zip_obj:
        zip_obj.extractall(tmpdirname / f"Grammalecte-fr-v{version}")
    subprocess.check_call(
        [
            sys.executable,
            "-m",
            "pip",
            "install",
            str(tmpdirname / f"Grammalecte-fr-v{version}"),
        ]
    )

    grammalecte_script = Path(sysconfig.get_paths()["scripts"]) / "grammalecte-cli.py"
    grammalecte_dir = Path(sysconfig.get_paths()["purelib"]) / "grammalecte"

    importable_grammalecte_script = grammalecte_dir / "grammalecte_cli.py"
    importable_grammalecte_script.write_bytes(grammalecte_script.read_bytes())

    echo_file = grammalecte_dir / "graphspell" / "echo.py"
    content = echo_file.read_text(encoding="utf-8")
    content = content.replace("file=file, ", "")
    echo_file.write_text(content, encoding="utf-8")


import json
from pathlib import Path


# --------------------------


def normalize_word(w: str):
    return w.strip().lower()


# --------------------------
# STEP 1: Extract phrases
# --------------------------
def extract_french_phrases(input_json="french.json", output_txt="phrases.txt"):
    with open(input_json, "r", encoding="utf-8") as f:
        data = json.load(f)

    phrases = []

    def collect_from_examples(example_list):
        if not isinstance(example_list, list):
            return
        for ex in example_list:
            if isinstance(ex, dict):
                fr = ex.get("fr")
                if isinstance(fr, str) and fr.strip():
                    phrases.append(fr.strip())

    for entry in data:
        if not isinstance(entry, dict):
            continue

        pos = entry.get("part_of_speech")

        if pos == "noun":
            noun_data = entry.get("noun_data", {})
            art = noun_data.get("articles_examples", {})
            for key in ["un_une", "le_la_l", "du_de_la_de_l_des", "plural"]:
                collect_from_examples(art.get(key))

        elif pos == "verb":
            verb_data = entry.get("verb_data", {})
            examples = verb_data.get("examples", {})
            for key in ["present", "past", "future", "conditional"]:
                collect_from_examples(examples.get(key))

        elif pos == "adjective":
            collect_from_examples(entry.get("adjective_data", {}).get("examples"))

        elif pos == "adverb":
            collect_from_examples(entry.get("adverb_data", {}).get("examples"))

    # Deduplicate in order
    seen = set()
    unique_phrases = []
    for p in phrases:
        if p not in seen:
            seen.add(p)
            unique_phrases.append(p)

    Path(output_txt).write_text("\n".join(unique_phrases), encoding="utf-8")
    print(f"Wrote {len(unique_phrases)} phrases to {output_txt}")

    return unique_phrases


# --------------------------
# STEP 2: Load dictionary
# --------------------------
def load_existing_words(json_path="french.json"):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    words = set()
    for entry in data:
        if isinstance(entry, dict):
            fw = entry.get("french_word")
            if isinstance(fw, str):
                words.add(normalize_word(fw))

    return words


# --------------------------
# STEP 3: Extract words from phrases
# --------------------------
def extract_words_from_phrases(phrases):
    words = set()

    for phrase in phrases:
        # Split phrase into words (simple split on spaces and punctuation)
        import re
        phrase_words = re.findall(r'\b\w+\b', phrase.lower())
        for word in phrase_words:
            word = word.strip()
            if word and len(word) >= 2:
                words.add(word)

    return words


# --------------------------
# MAIN
# --------------------------
def main():
    # Step 1: Extract example sentences
    phrases = extract_french_phrases("french.json", "phrases.txt")

    # Step 2: Extract words from phrases
    words_in_phrases = extract_words_from_phrases(phrases)

    # Step 3: Collect existing dictionary words
    existing_words = load_existing_words("french.json")

    # Step 4: Compute missing words
    missing = sorted([w for w in words_in_phrases if w not in existing_words])

    Path("missing_base_words.txt").write_text("\n".join(missing), encoding="utf-8")

    print(f"Found {len(missing)} words in phrases not in dictionary.")
    print("Saved to missing_base_words.txt")



if __name__ == "__main__":
    
    validate_french_json()
    main()
