import json
import re

# Read the file
with open('french.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all { ... } objects that look like word entries
pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
matches = re.findall(pattern, content, re.DOTALL)

entries = []
for match in matches:
    try:
        obj = json.loads(match)
        if 'french_word' in obj and 'part_of_speech' in obj:
            entries.append(obj)
    except:
        pass

# Remove duplicates based on french_word
seen = set()
unique_entries = []
for entry in entries:
    word = entry['french_word']
    if word not in seen:
        seen.add(word)
        unique_entries.append(entry)

print(f"Found {len(unique_entries)} unique entries")

# Write the fixed JSON
with open('french_fixed.json', 'w', encoding='utf-8') as f:
    json.dump(unique_entries, f, ensure_ascii=False, indent=2)

print("Fixed JSON written to french_fixed.json")
