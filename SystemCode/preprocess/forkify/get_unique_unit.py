#encoding=utf8
'''
把unit那一列 unique 的单位挑出来 
目的：去赋个值 然后 乘一下就能获得一部分的weight
'''

import pandas as pd

df = pd.read_csv('ingredient.csv')
unit_list = df['unit'].dropna().unique().tolist()

# 排序
unit_list = sorted(unit_list)

with open('unique_unit.txt', 'w', encoding='utf8') as fw: 
    for unit in unit_list: 
        fw.write(unit + '\n')
