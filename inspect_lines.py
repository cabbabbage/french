import itertools
with open('french.json','r',encoding='utf-8') as f:
    for idx,line in enumerate(f,1):
        if 17770 <= idx <= 17795:
            print(idx, line.rstrip())
        if idx>17795:
            break
