#encoding=utf8

import re
import spacy
import pandas as pd
import nltk
from nltk.corpus import words
from nltk.metrics.distance import jaccard_distance
from nltk.util import ngrams

# Create the nlp tool
nlp = spacy.load('en_core_web_sm')

def my_preprocessing(raw_sentence): 
    token_sentence = nlp(raw_sentence)
    preprocessed_sentence = []
    for word in token_sentence:
        if not word.is_stop and word.pos_ != 'PUNCT':
            preprocessed_sentence.append(word.lemma_)
    return preprocessed_sentence

def spell_correction(word): 
    if re.search(r'\d', word): 
        return word
    correct_words = words.words()
    try: 
        temp =[(jaccard_distance(set(ngrams(word,2)),
            set(ngrams(w,2))), w)
            for w in correct_words if w[0] == word[0]]

    except Exception as e: 
        return word

    if len(temp) == 0: 
        return word

    return sorted(temp, key = lambda val:val[0])[0][1]

NUTRITION_DICT = {
}
# nutrition_df = pd.read_csv('./data/nutrition_ingredients_metadata.csv')
# for index, row in nutrition_df.iterrows(): 
#     ingredient = row['ingr']

#     arr_words = my_preprocessing(ingredient)

#     for word in arr_words: 
#         if word not in NUTRITION_DICT: 
#             NUTRITION_DICT[word] = []

#         NUTRITION_DICT[word].append({
#             'ingr': ingredient,
#             'words': arr_words,
#             'id': row['id'],
#             'cal': row['cal/g'],
#             'fat': row['fat(g)'],
#             'carb': row['carb(g)'],
#             'protein': row['protein(g)']
#         })

# print('size:', len(NUTRITION_DICT))

# with open('./data/query.txt') as f: 
#     for line in f: 
#         line = line.strip()
#         if len(line) == 0: 
#             continue
#         arr_words = my_preprocessing(line)

#         print('-' * 100)
#         print('query:', line)
#         print('my_preprocessing words:', arr_words)
#         for i in range(len(arr_words)): 
#             word = arr_words[i]
#             old_word = word
#             word = spell_correction(old_word)
#             if not word == old_word: 
#                 print('spell_correction: [%s] -> [%s]' % (old_word, word))
#             arr_words[i] = word

#         print('words found in database: ')
#         for word in arr_words: 
#             if word in NUTRITION_DICT: 
#                 value_list = NUTRITION_DICT[word]
#                 for value in value_list: 
#                     print('\tword[%s] ingredient[%s]' % (word, value['ingr']))

#         print('digits:')
#         for word in arr_words: 
#             m = re.search(r'^(\d+k*)(.*)$', word)
#             if not m: 
#                 continue
#             digits = m.group(1)
#             unit = m.group(2)
#             print('\t%s %s' % (digits, unit))

def processUserQuery(input):
    print('query:', input)
    arr_words = my_preprocessing(input)
    print('my_preprocessing words:', arr_words)
    for i in range(len(arr_words)): 
        word = arr_words[i]
        old_word = word
        word = spell_correction(old_word)
        if not word == old_word: 
            print('spell_correction: [%s] -> [%s]' % (old_word, word))
        arr_words[i] = word

    print('words found in database: ')
    for word in arr_words: 
        if word in NUTRITION_DICT: 
            value_list = NUTRITION_DICT[word]
            for value in value_list: 
                print('\tword[%s] ingredient[%s]' % (word, value['ingr']))

    print('digits:')
    for word in arr_words: 
        m = re.search(r'^(\d+k*)(.*)$', word)
        if not m: 
            continue
        digits = m.group(1)
        unit = m.group(2)
        print('\t%s %s' % (digits, unit))

processUserQuery("i have 250g pork want to make a meal with less than 350kcal")