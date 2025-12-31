import json

def fix_french_json():
    with open('french.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    for i, entry in enumerate(data):
        if not isinstance(entry, dict):
            continue

        # Fix part_of_speech
        pos = entry.get('part_of_speech')
        if pos not in ['noun', 'verb', 'adjective', 'adverb']:
            entry['part_of_speech'] = 'adverb'  # default to adverb
            # Change data key
            old_key = f"{pos}_data"
            new_key = "adverb_data"
            if old_key in entry:
                entry[new_key] = entry.pop(old_key)

        # Move learning_phases if misplaced
        for data_key in ['noun_data', 'verb_data', 'adjective_data', 'adverb_data']:
            if data_key in entry and 'learning_phases' in entry[data_key]:
                entry['learning_phases'] = entry[data_key].pop('learning_phases')

        # Fix learning_phases
        phases = entry.get('learning_phases')
        if isinstance(phases, dict):
            if 'fr_to_en_identification' in phases:
                phases['fr_identification'] = phases.pop('fr_to_en_identification')

        # Fix verb data
        if entry.get('part_of_speech') == 'verb':
            verb_data = entry.get('verb_data', {})
            conj = verb_data.get('conjugations', {})
            for tense in ['imparfait', 'futur_simple', 'conditional']:
                if tense in conj and isinstance(conj[tense], dict):
                    je_form = conj[tense].get('je')
                    if je_form:
                        conj[tense] = {'je': je_form}
                    else:
                        conj[tense] = {'je': ''}  # placeholder

            # Fix examples
            examples = verb_data.get('examples', {})
            for tense in ['present', 'past', 'future', 'conditional']:
                ex_list = examples.get(tense, [])
                if not isinstance(ex_list, list):
                    ex_list = []
                if len(ex_list) > 3:
                    ex_list = ex_list[:3]
                elif len(ex_list) < 3:
                    ex_list.extend([{'fr': '', 'en': ''}] * (3 - len(ex_list)))
                examples[tense] = ex_list

        # Fix noun data
        if entry.get('part_of_speech') == 'noun':
            noun_data = entry.get('noun_data', {})
            art = noun_data.get('articles_examples', {})
            required_keys = ['un_une', 'le_la_l', 'du_de_la_de_l_des', 'plural']
            for key in required_keys:
                if key not in art:
                    art[key] = [{'fr': '', 'en': ''}] * 3
                elif not isinstance(art[key], list):
                    art[key] = [{'fr': '', 'en': ''}] * 3
                else:
                    if len(art[key]) > 3:
                        art[key] = art[key][:3]
                    elif len(art[key]) < 3:
                        art[key].extend([{'fr': '', 'en': ''}] * (3 - len(art[key])))

            # Remove extra keys from noun_data
            allowed = ['gender', 'singular_form', 'plural_form', 'articles_examples']
            extra = [k for k in noun_data if k not in allowed]
            for k in extra:
                del noun_data[k]

        # Fix adjective data
        if entry.get('part_of_speech') == 'adjective':
            adj_data = entry.get('adjective_data', {})
            ex_list = adj_data.get('examples', [])
            if not isinstance(ex_list, list):
                ex_list = []
            if len(ex_list) > 3:
                ex_list = ex_list[:3]
            elif len(ex_list) < 3:
                ex_list.extend([{'fr': '', 'en': ''}] * (3 - len(ex_list)))
            adj_data['examples'] = ex_list

        # Fix adverb data
        if entry.get('part_of_speech') == 'adverb':
            adv_data = entry.get('adverb_data', {})
            ex_list = adv_data.get('examples', [])
            if not isinstance(ex_list, list):
                ex_list = []
            if len(ex_list) > 3:
                ex_list = ex_list[:3]
            elif len(ex_list) < 3:
                ex_list.extend([{'fr': '', 'en': ''}] * (3 - len(ex_list)))
            adv_data['examples'] = ex_list

        # Remove extra top-level keys
        allowed_top = ['french_word', 'part_of_speech', 'english_meanings', 'pronunciation_guide', 'learning_phases', 'noun_data', 'verb_data', 'adjective_data', 'adverb_data']
        extra_top = [k for k in list(entry.keys()) if k not in allowed_top]
        for k in extra_top:
            del entry[k]

    # Save back
    with open('french.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("Fixed french.json")

if __name__ == "__main__":
    fix_french_json()
