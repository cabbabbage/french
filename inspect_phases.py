import json
with open('french.json','r',encoding='utf-8') as f:
    data = json.load(f)
print(list(data[0]['learning_phases'].keys()))
