import json
with open('french.json','r',encoding='utf-8') as f:
    data=json.load(f)
print(type(data), len(data))
print(list(data[0].keys()))
print('first', data[0].get('french_word'))
