import json

# Read the file
with open('french.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the position where the array closes properly
# The array starts with [, ends with ]
# But there is extra content after the array
# So, find the last ] that is the array close

# Look for the pattern where the last entry is closed, then the array
# The extra content is after the array close

# Find the last occurrence of '}' followed by '\n]' or something
# Let's find the position of the last '}' that is followed by '\n]' without comma

lines = content.split('\n')
in_array = False
array_start = -1
for i, line in enumerate(lines):
    if '[' in line:
        in_array = True
        array_start = i
    if ']' in line and in_array:
        # This might be the array end
        # Check if there's content after this line
        if i + 1 < len(lines) and lines[i+1].strip() == '':
            continue  # Empty line
        else:
            array_end = i
            break

# The array ends at array_end, but there is extra content
# Actually, from the content, the array is closed, but then there is more JSON-like text
# The extra text is after the ]

# Let's find the position of the first { after the array close
# The array close is at line where ] is, then extra content starts

# Perhaps it's easier to remove everything after the first ] that is not followed by anything

# Let's find the position of the closing ]
# The content has the array, then extra

# Let's count the braces
brace_count = 0
array_closed = False
end_pos = 0
for i, char in enumerate(content):
    if char == '{':
        brace_count += 1
    elif char == '}':
        brace_count -= 1
        if brace_count == 0 and not array_closed:
            # This might be the end of an entry, check if next is ]
            if content[i+1:i+3] == '\n]':
                end_pos = i + 2  # include the ]
                array_closed = True
                break

# If array_closed, truncate at end_pos
if array_closed:
    fixed_content = content[:end_pos + 1]  # include the ]
else:
    # Fallback, find the last ]
    last_bracket = content.rfind(']')
    if last_bracket != -1:
        fixed_content = content[:last_bracket + 1]

# Now, try to parse the fixed content
try:
    data = json.loads(fixed_content)
    print(f"Successfully parsed {len(data)} entries")
    # Remove duplicates
    seen = set()
    unique = []
    for item in data:
        word = item['french_word']
        if word not in seen:
            seen.add(word)
            unique.append(item)
    print(f"After removing duplicates: {len(unique)} entries")
    # Write back
    with open('french.json', 'w', encoding='utf-8') as f:
        json.dump(unique, f, ensure_ascii=False, indent=2)
    print("Fixed french.json")
except Exception as e:
    print(f"Still error: {e}")
    # Write the fixed content anyway
    with open('french_temp.json', 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    print("Wrote fixed content to french_temp.json")
