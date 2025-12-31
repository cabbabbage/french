import json

# Read the file
with open('french.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the position of the first "coûter" entry
start = content.find('"french_word": "coûter"')
if start == -1:
    print("Coûter not found")
    exit(1)

# Find the end of the first coûter entry by looking for the closing } of the learning_phases
end = content.find('"usage_advanced": {', start)
if end == -1:
    print("usage_advanced not found")
    exit(1)

# Find the closing } after that
end = content.find('}', end)
end = content.find('}', end + 1)  # Two more }
end = content.find('}', end + 1)

# Now, the array should end here with ]
valid_content = content[:end+1] + '\n]'

# Parse to check if valid
try:
    data = json.loads(valid_content)
    print(f"Valid JSON with {len(data)} entries")
    # Write back
    with open('french_fixed.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Fixed JSON written to french_fixed.json")
except Exception as e:
    print(f"Still invalid: {e}")
    # Write the partial content for inspection
    with open('partial.json', 'w', encoding='utf-8') as f:
        f.write(valid_content)
    print("Partial content written to partial.json")
