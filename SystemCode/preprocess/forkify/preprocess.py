#encoding=utf8

import time
import json
import os
import pandas as pd
import re

# 128 queries
query_list = [
'carrot',
'broccoli',
'asparagus',
'cauliflower',
'corn',
'cucumber',
'green pepper',
'lettuce',
'mushrooms',
'onion',
'potato',
'pumpkin',
'red pepper',
'tomato',
'beetroot',
'brussel sprouts',
'peas',
'zucchini',
'radish',
'sweet potato',
'artichoke',
'leek',
'cabbage',
'celery',
'chili',
'garlic',
'basil',
'coriander',
'parsley',
'dill',
'rosemary',
'oregano',
'cinnamon',
'saffron',
'green bean',
'bean',
'chickpea',
'lentil',
'apple',
'apricot',
'avocado',
'banana',
'blackberry',
'blackcurrant',
'blueberry',
'boysenberry',
'cherry',
'coconut',
'fig',
'grape',
'grapefruit',
'kiwifruit',
'lemon',
'lime',
'lychee',
'mandarin',
'mango',
'melon',
'nectarine',
'orange',
'papaya',
'passion fruit',
'peach',
'pear',
'pineapple',
'plum',
'pomegranate',
'quince',
'raspberry',
'strawberry',
'watermelon',
'salad',
'pizza',
'pasta',
'popcorn',
'lobster',
'steak',
'bbq',
'pudding',
'hamburger',
'pie',
'cake',
'sausage',
'tacos',
'kebab',
'poutine',
'seafood',
'chips',
'fries',
'masala',
'paella',
'som tam',
'chicken',
'toast',
'marzipan',
'tofu',
'ketchup',
'hummus',
'chili',
'maple syrup',
'parma ham',
'fajitas',
'champ',
'lasagna',
'poke',
'chocolate',
'croissant',
'arepas',
'bunny chow',
'pierogi',
'donuts',
'rendang',
'sushi',
'ice cream',
'duck',
'curry',
'beef',
'goat',
'lamb',
'turkey',
'pork',
'fish',
'crab',
'bacon',
'ham',
'pepperoni',
'salami',
'ribs',
]


# --> g
WEIGHT_EXCHANGE_DICT = {
    'pound': 453.59237,
    'ml': 1,
    'l': 1000,
    'oz': 28.3495231,
    'ounce': 28.3495231,
    'heaping': 28.3495231,
    'gram': 1,
    'kg': 1000,
    'g': 1,
}


# --> unit ->  g
UNIT_EXCHANGE_DICT = {
    'big bunch': 22,
    'big handful': 20,
    'bottle': 50,
    'bunch': 10,
    'can': 20,
    'cans': 20,
    'clove': 5,
    'cloves': 5,
    'cup': 20,
    'cups': 20,
    'g': 1,
    'grams': 1,
    'handful': 10,
    'jar': 15,
    'jars': 15,
    'kg': 1000,
    'l': 150,
    'large bunch': 22,
    'large clove': 2,
    'large cloves': 2,
    'large handful': 20,
    'large jar': 10,
    'large lb': 453.59237,
    'large pinch': 0.7,
    'large sheet': 0.8,
    'large slices': 2,
    'large sprigs': 1,
    'large stalk': 6,
    'lb': 453.59237,
    'lbs': 453.59237,
    'medium clove': 10,
    'medium cloves': 10,
    'ml': 1,
    'ounce': 28.3495231,
    'ounces': 28.3495231,
    'oz': 28.3495231,
    'oz.': 28.3495231,
    'package': 20,
    'packages': 20,
    'pinch': 0.5,
    'pound': 453.59237,
    'pounds': 453.59237,
    'sheet': 0.65,
    'slices': 3,
    'small bunch': 8,
    'small can': 10,
    'small clove': 3,
    'small handful': 8,
    'small jar': 10,
    'small pinch': 0.3,
    'small sprigs': 5,
    'small stalk': 20,
    'sprigs': 8,
    'stalk': 30,
    'stalks': 30,
    'stick': 12,
    'sticks': 12,
    'tablespoon': 4.3,
    'tablespoons': 4.3,
    'tbsp': 4.3,
    'teaspoon': 4.2,
    'teaspoons': 4.2,
}

# King Arthur Baking -> g
KAB_EXCHANGE_DICT = {
}
kab = open('data/Ingredient Weight Chart _ King Arthur Baking.html').read()

arr_lines = kab.split('<tr>')
cnt = 0
for line in arr_lines: 
    # print('-' * 100)
    if '<th>' not in line: 
        continue
    if '<tbody>' in line: 
        continue
    # print(line)
    tds = line.strip().split('\n')
    # print(tds)
    title = tds[0].replace('<th>', '').replace('</th>', '').strip().lower()
    weight = tds[3].replace('<td>', '').replace('</td>', '').strip().split()[0].strip()
    weight = float(weight)
    m = re.match('<a.+>(.+)</a>', title)
    if m: 
        title = m.group(1)

    title = re.sub('\(.*\)', '', title).strip()
    # print(title)
    # print(weight)
    KAB_EXCHANGE_DICT[title] = weight
    cnt += 1
# print(len(arr_lines), cnt)
# sys.exit(0)
# print(KAB_EXCHANGE_DICT['celery'])


# obj -> cal/fat/carb/protein
NUTRITION_EXCHANGE_DICT = {
}
nutrition_df = pd.read_csv('data/nutrition5k_dataset_metadata_ingredients_metadata.csv')
for index, row in nutrition_df.iterrows(): 
    ingredient = row['ingr'].lower()

    NUTRITION_EXCHANGE_DICT[ingredient] = {
        'cal': row['cal/g'],
        'fat': row['fat(g)'],
        'carb': row['carb(g)'],
        'protein': row['protein(g)']
    }

# print(len(NUTRITION_EXCHANGE_DICT))
# print(NUTRITION_EXCHANGE_DICT)
# sys.exit(0)



search_rows = []
recipe_rows = []
ingredient_rows = []


def parse_quantity(string): 
    '''
    检查string是否为数量，比如1, 1/2等格式
    '''
    if string == "a": 
        return '1'

    if string.lower() == 'One': 
        return '1'

    if string == 'to': 
        return string

    for c in string: 
        if c == '/': 
            continue
        if c == '-': 
            continue
        if c == '(': 
            continue
        if c == ')': 
            continue
        if c == '.': 
            continue
        if c >= '0' and c <= '9': 
            continue

        return None

    return string

def parse_unit(string): 
    '''
    检查string是否为单位，如cup cups等
    '''
    string = string.lower()
    string = string.strip(')')

    unit_list = ['cup', 'cups', 
    'teaspoon', 'teaspoons', 
    'stick', 
    'slices',
    'ounces', 'ounce',
    'oz', 'oz.',
    'tablespoon', 'tablespoons',
    'tbsp',
    'handful',
    'pinch',
    'clove', 'cloves',
    'stalk', 'stalks',
    'bunch',
    'lb', 'lbs',
    'bottle',
    'sheet',
    'package', 'packages',
    'can', 'cans', 'jar', 'jars',
    'kg', 'g', 'mg', 'grams',
    'l', 'ml',
    'sprigs', 'sticks',
    'pounds', 'pound']
    if string in unit_list:
        return string
    return None

def parse_quantity_and_unit(string): 
    '''
    处理 100ml 100mg 100g 这种情况的数量和单位
    '''
    if string[0] >= '0' and string[0] <= '9': 
        if string[-2:] == "mg": 
            return (string[0:-2], string[-2:])
        if string[-2:] == 'ml': 
            return (string[0:-2], string[-2:])
        if string[-1:] == "g": 
            return (string[0:-1], string[-1:])
        if string[-1:] == "l": 
            return (string[0:-1], string[-1:])
    return (None, None)


def parse(ingredient): 
    '''
    解析一个ingredient
    '''
    quantity = ''
    unit = ''
    left = ''
    weight = ''
    # print(ingredient)
    arr_tokens = ingredient.strip(' ~').split()

    has_quantity = False
    has_unit = False

    words_before_unit = ''

    # 遍历每一个词
    for i in range(len(arr_tokens)): 
        token = arr_tokens[i]
        token = token.strip(',')
        if len(token) == 0: 
            continue

        # 目前还没有数量
        # 尝试一次性获取数量和单位
        if not has_quantity: 
            (new_quantity, new_unit) = parse_quantity_and_unit(token)

            # 一次性取到了数量和单位
            if new_quantity is not None and new_unit is not None: 
                has_quantity = True
                has_unit = True
                quantity = new_quantity
                unit = new_unit
                continue

        # 1 (14.5 ounce) can diced tomatoes
        # 1 can (28 Ounce) Whole Tomatoes With Juice
        # 1 cup (to 2 Cups) Red Wine
        # 跳过(xxx ounce)
        if has_quantity and (token[0] == '(' or token[-1] == ')'): 
            weight = weight + ' ' + token
            if weight.strip() == '(to': 
                weight = ''
            continue

        # 没有单位的情况下：
        if not has_unit: 
            # 尝试获取数量
            # 数量可以分为两段。。或者多段..
            new_quantity = parse_quantity(token)
            if new_quantity is not None: 
                has_quantity = True
                quantity = quantity + ' ' + str(new_quantity)
                continue

            # 有了数量，才能尝试获取单位
            if has_quantity: 
                new_unit = parse_unit(token)
                if new_unit is not None: 
                    has_unit = True
                    unit = words_before_unit + ' ' + new_unit
                    words_before_unit = ''
                    continue

        # 已经有了单位..就不再向后解析了
        if has_unit: 
            left = ' '.join(arr_tokens[i:])
            left = words_before_unit + ' ' + left

            return (quantity, unit, weight, left)

        # 运行到这里，说明遇到了一个既不是数量又不是单位的词，结束

        # 某些词可以出现在单位前面...
        if token in ['big', 'small', 'large', 'medium']: 
            words_before_unit = token
            continue

        # 其它词就结束parse吧
        left = ' '.join(arr_tokens[i:])
        left = words_before_unit + ' ' + left

        return (quantity, unit, weight, left)

    return (quantity, unit, weight, left)


def convert_one_quantity_to_float(quantity): 
    '''
    convert one string to float
    1/2 -> 0.5
    '''
    arr_tokens = quantity.strip().split('/')
    try: 
        if len(arr_tokens) == 1: 
            return float(quantity)

        q1 = float(arr_tokens[0])
        q2 = float(arr_tokens[1])
    except Exception as e: 
        return None
    return q1 / q2

def convert_quantity_to_float(quantity): 
    '''
    convert multi-string to float
    1/2 -> 0.5 or  1 1/2 -> 1.5
    '''
    arr_tokens = quantity.strip().split('-')
    quantity = arr_tokens[0]
    arr_tokens = quantity.strip().split()
    sum = 0
    for token in arr_tokens: 
        if token == '-': 
            break
        value = convert_one_quantity_to_float(token)

        if value is None: 
            if sum == 0: 
                return None
            return sum

        sum += value

    return sum


def get_trunk(string): 
    '''
    提取主干: 
        去掉不完整的括号...前面处理weight的时候没处理好，遗留下来的.
        去掉括号里面的内容, 
        用逗号分隔，只保留第一段
    '''

    pos_right = string.find(')')
    if pos_right > 0: 
        pos_left = string.find('(')
        if pos_right < pos_left or pos_left < 0: 
            string = string[pos_right:].strip(')')

    string = re.sub('\([^()]*\)', '', string)
    arr_tokens = string.strip().split(',')

    trunk = arr_tokens[0].strip()
    new_weight = ''

    # 3 1/2 oz / 100g fresh spinach leaves
    # ~ 1 3/4 cups / 3.5 oz / 100 g grated whit
    # 8 1/2 cups / 2 liters good-tasting vegetable
    loop = 0
    while trunk.startswith('/ '): 
        arr_tokens = trunk.split()
        (q, u) = parse_quantity_and_unit(arr_tokens[1])
        if q is not None: 
            new_weight = '%s%s' % (q, u)
            trunk = ' '.join(arr_tokens[2:])
        else: 
            m = re.search('(/ \d+\.*\d* (g|ml|oz|liters)) ', trunk)
            if m: 
                # / 100 g
                token = m.group(1)
                new_weight = token.strip('/ ')
                pos = trunk.find(token) + len(token)
                trunk = trunk[pos:]
        trunk = trunk.strip()
        loop += 1

        if loop > 3:
            break

    trunk = trunk.strip()

    if trunk == '': 
        return (new_weight, trunk)

    # for serving / to taste
    arr_tokens = trunk.split()
    if len(arr_tokens) > 2 and arr_tokens[-2].lower() in ['to', 'for']: 
        trunk = ' '.join(arr_tokens[0:-2])

    # whold
    arr_tokens = trunk.split()
    if arr_tokens[0] == 'whole': 
        trunk = ' '.join(arr_tokens[1:])
    
    return (new_weight, trunk)


def convert_quantity_to_float_ext(quantity): 
    '''
    对convert_one_quantity_to_float的补充
    '''
    if 'x' in quantity: 
        tokens = quantity.split('x')
        if len(tokens) == 2: 
            count = tokens[0]
            q = tokens[1]
            return int(count) * float(q)

    if quantity[-1] == 'k': 
        quantity = quantity[0:-1]
        return float(quantity) * 1000

    return None

def convert_weight_to_g(weight): 
    '''
    把现有的 weight 里面的数值 都变成g
    '''
    old_weight = weight
    weight = weight.strip('~() ')
    if weight == '':
        return weight

    quantity = 0
    unit = '...'

    tokens = weight.split()
    if len(tokens) == 1: 
        m = re.search('^(\d+\.*\d*)(\-)*(.+)$', weight)
        if m: 
            quantity = m.group(1)
            unit = m.group(3).lower()
        else:
            unit = weight
    else: 
        unit = tokens[-1]
        str_quantity = ' '.join(tokens[0:-1]).strip('- ')
        quantity = convert_quantity_to_float(str_quantity)
        if quantity is None: 
            quantity = convert_quantity_to_float_ext(str_quantity)
        
    unit = unit.lower()

    if unit not in WEIGHT_EXCHANGE_DICT: 
        last_char = unit[-1]
        if last_char in ['s', '.']: 
            unit = unit[0:-1]

        if '-' in unit: 
            unit = unit.split('-')[-1]
    
    if unit in WEIGHT_EXCHANGE_DICT and quantity is not None: 
        quantity = float(quantity)
        if quantity == 0: 
            quantity = 1
        return quantity * WEIGHT_EXCHANGE_DICT[unit]
    else: 
        print(old_weight, '###', quantity, '###', unit, '###', 'failed')

    return ''

def convert_unit_to_g(quantity, unit): 
    weight_g = ''

    if quantity is None: 
        return weight_g

    if unit not in UNIT_EXCHANGE_DICT: 
        return weight_g

    return quantity * UNIT_EXCHANGE_DICT[unit];

def convert_kab_to_g(quantity, unit, left): 
    '''
    模糊匹配
    '''
    weight_g = ''

    '''
    if quantity is None: 
        return weight_g
    '''

    tokens = left.split()
    for k, v in KAB_EXCHANGE_DICT.items(): 
        k_tokens = k.split()
        for k_token in k_tokens: 
            k_token = k_token.lower().strip()
            for token in tokens: 
                token = token.lower().strip()
                if token in k_token or k_token in token: 
                    # return quantity * v
                    return v
            
    return weight_g


def get_nutrition(left): 
    '''
    模糊匹配
    '''

    # 去掉 left 中一些不太适合的词
    left = left.lower()
    left = left.replace('green', '')
    left = left.replace('dried', '')
    left = left.replace('garden', '')
    left = left.replace('wild', '')
    left = left.replace('white', '')
    left = left.replace('mixed', '')
    left = left.replace('and', '')
    # left = left.replace('blue', '')

    # 第0个阶段，白名单
    if 'vegetable' in left and 'oil' not in left: 
        key = 'mixed vegetables'
        return (key, NUTRITION_EXCHANGE_DICT[key])

    if 'vegetable' in left and 'oil' in left: 
        key = 'vegetable oil'
        return (key, NUTRITION_EXCHANGE_DICT[key])

    # 第一阶段
    max_length = -1
    max_k = None
    max_v = None
    for k, v in NUTRITION_EXCHANGE_DICT.items(): 
        # 相同
        if k == left: 
            return (k, v)

        # 复数相同
        if k + 's' == left or k == left + 's': 
            return (k, v)

        if k + 'es' == left or k == left + 'es': 
            return (k, v)

        # 包含
        if ' ' + left + ' ' in ' ' + k + ' ': 
            length = len(left)
            if length > max_length: 
                max_length = length
                max_k = k
                max_v = v

        if ' ' + k + ' ' in ' ' + left + ' ': 
            length = len(k)
            if length > max_length: 
                max_length = length
                max_k = k
                max_v = v

    if max_length > 0: 
        return (max_k, max_v)

    # 第二阶段就比较模糊了
    tokens = left.split()
    for k, v in NUTRITION_EXCHANGE_DICT.items(): 
        k_tokens = k.split()
        for k_token in k_tokens: 
            k_token = k_token.lower().strip()
            for token in tokens: 
                token = token.lower().strip()
                # 相同
                if token == k_token or k_token == token: 
                    return (k, v)

                # 复数相同
                if token + 's' == k_token or token == k_token + 's': 
                    return (k, v)

                if token + 'es' == k_token or token == k_token + 'es': 
                    return (k, v)
                
            

    # 第三阶段就更加的模糊了
    tokens = left.split()
    for k, v in NUTRITION_EXCHANGE_DICT.items(): 
        k_tokens = k.split()
        for k_token in k_tokens: 
            k_token = k_token.lower().strip()
            for token in tokens: 
                token = token.lower().strip()
                if token in k_token or k_token in token: 
                    return (k, v)


    # 实在是匹配不到了，使用 默认值

    key = 'zzseasoning'
    return (key, NUTRITION_EXCHANGE_DICT[key])


def should_drop_whole_line(left, nutrition_key): 

    # 匹配到 nutrition_key 的肯定不能删
    if not nutrition_key == 'zzseasoning': 
        return False

    left = left.strip(';_!:. ').lower()
    if left == '':
        return True

    drop_list = ['this', 
        'browsing', 
        'scroll', 'Vintage',
        'marfa fantasy',
        'you will need',
        'everything else',
        'events',
        'event/signings',
        'cups cups',
        'base',
        'and',
        '6 cups',
        '4 cups',
        '2 packages',
        '2 cups',
        '&nbsp',
        "aida's",
        "can't wait for",
    ]
    if left in drop_list: 
        return True

    return False


def entity_recall(ingredient, left): 
    entity_list = [
        'chicken breast',
        'chicken breasts',
        'pie',
    ]
    for entity in entity_list: 
        if ' ' + entity + ' ' in ' ' + ingredient + ' ': 
            if entity == 'pie': 
                return 'pies'
            return entity

    # 否则直接使用 left
    return left

# test

left = 'blue cheese'
(n_key, n_value) = get_nutrition(left)
assert(n_key == left)


left = 'vegetable stock cube'
(n_key, n_value) = get_nutrition(left)
assert(n_key == 'mixed vegetables')


left = 'Peanut or vegetable oil'
(n_key, n_value) = get_nutrition(left)
assert(n_key == 'vegetable oil')

weight = '(heaping)'
assert(convert_weight_to_g(weight) == 1 * WEIGHT_EXCHANGE_DICT['heaping'])

weight = '13- 14-ounce'
assert(convert_weight_to_g(weight) == 13 * WEIGHT_EXCHANGE_DICT['ounce'])

weight = '1k g'
assert(convert_weight_to_g(weight) == 1000 * WEIGHT_EXCHANGE_DICT['g'])

weight = '(1x400 g)'
assert(convert_weight_to_g(weight) == 400 * WEIGHT_EXCHANGE_DICT['g'])

weight = '(1 1/2 pounds)'
assert(convert_weight_to_g(weight) == 1.5 * WEIGHT_EXCHANGE_DICT['pound'])

weight = '(28 Ounce)'
assert(convert_weight_to_g(weight) == 28 * WEIGHT_EXCHANGE_DICT['ounce'])

assert(convert_kab_to_g(5, 'cup', 'celery') == 1 * KAB_EXCHANGE_DICT['celery'])

assert(should_drop_whole_line('You will need:', 'zzseasoning'))

'''
x = parse('500g potatoes , cut into chunks')
print(x)
quantity = x[0]
unit = x[1]
weight = x[2]
quantity_float = convert_quantity_to_float(x[0])
print('quantity_float:', quantity_float)
x  = get_trunk(x[3])
print(x)
if unit.lower() in ['pound', 'pounds', 'g', 'kg', 'ounce', 'ounces'] and weight == '': 
    weight = '%s %s' % (quantity, unit)
    print(weight)
sys.exit(0)
'''

# run all the data
dropped = 0

# 遍历每一个query
for query in query_list: 
    # search result
    file_name = 'data/search_%s.txt' % (query.replace(' ', '-'))
    txt = open(file_name, encoding='utf8').read()
    obj = json.loads(txt)
    # 遍历每一个 recipe
    for recipe in obj['recipes']: 
        recipe_id = recipe['recipe_id']
        # 一行 search 数据
        row = [
            query, 
            recipe_id
        ]
        search_rows.append(row)

        # get result
        file_name = 'data/get_%s_%s.txt' % (query.replace(' ', '-'), recipe_id)
        txt = open(file_name, encoding='utf8').read()
        obj = json.loads(txt)
        if 'recipe' not in obj: 
            print(file_name, 'no recipe')
            continue

            
        sum_cal = 0
        sum_fat = 0
        sum_carb = 0
        sum_protein = 0
        # 遍历每一个 ingredient
        for ingredient in obj['recipe']['ingredients']: 
            # print('-' * 100)

            # 跳过某些奇怪的 ingredients
            if 'for the dressing' in ingredient.lower(): 
                continue

            (quantity, unit, weight, left) = parse(ingredient)
            '''
            print('quantity:', quantity)
            print('unit:', unit)
            print('weight:', weight)
            print('left:', left)
            '''

            quantity_float = convert_quantity_to_float(quantity)

            (new_weight, left) = get_trunk(left)
            if weight == '': 
                weight = new_weight

            quantity = quantity.strip()
            unit = unit.strip()
            weight = weight.strip()
            left = left.strip()
            
            # 对 left 进行补充召回(实体白名单)
            left = entity_recall(ingredient, left)

            # 如果unit是g/kg/ounce，且weight为空的，则把 quantity + unit 挪到 weight里面
            if unit.lower() in ['pound', 'pounds', 'g', 'kg', 'ounce', 'ounces'] and weight == '': 
                weight = '%s %s' % (quantity, unit)



            # 把现有的 weight 里面的数值 都变成g
            weight_g = convert_weight_to_g(weight)

            # 通过quantity * unit的方式对weight进行补充
            if weight_g == '': 
                weight_g = convert_unit_to_g(quantity_float, unit)

            # 通过 KAB 的数据对weight进行再次的补充
            if weight_g == '': 
                weight_g = convert_kab_to_g(quantity_float, unit, left)

            # 剩下的全部用1来填充
            weight_g = str(weight_g)

            if weight_g == '' or weight_g == '0.0': 
                weight_g = '1'


            # 与 NUTRITION 数据进行关联
            (nutrition_key, nutrition_value) = get_nutrition(left)

            if should_drop_whole_line(left, nutrition_key): 
                dropped += 1
                continue


            # 一行 ingredient 数据
            row = [
                query, recipe_id, 
                # quantity.strip(), 
                quantity_float, 
                unit.strip(), 
                # weight.strip(),
                weight_g,
                left.strip(), 
                nutrition_key,
                str(nutrition_value),
                nutrition_value['cal'] * float(weight_g),
                nutrition_value['fat'] * float(weight_g),
                nutrition_value['carb'] * float(weight_g),
                nutrition_value['protein'] * float(weight_g),
                ingredient.strip()
            ]

            ingredient_rows.append(row)

            sum_cal += nutrition_value['cal'] * float(weight_g)
            sum_fat += nutrition_value['fat'] * float(weight_g)
            sum_carb += nutrition_value['carb'] * float(weight_g)
            sum_protein += nutrition_value['protein'] * float(weight_g)


        # end of for loop 
        # 一行 recipe 数据
        row = [
            query,
            recipe_id,
            obj['recipe']['publisher'],
            obj['recipe']['source_url'],
            obj['recipe']['image_url'],
            obj['recipe']['social_rank'],
            obj['recipe']['publisher_url'],
            obj['recipe']['title'],
            sum_cal,
            sum_fat,
            sum_carb,
            sum_protein
        ]

        recipe_rows.append(row)


# 输出到 csv 文件中
print('output to csv files')
df = pd.DataFrame(search_rows, columns=['query', 'recipe_id'])
df.to_csv('search.csv', index=0)

df = pd.DataFrame(recipe_rows, columns=['query', 'recipe_id', 'publisher', 'source_url', 
    'image_url', 'social_rank', 'publisher_url', 'title',
    'sum_cal', 'sum_fat', 'sum_carb', 'sum_protein'])
df.to_csv('recipe.csv', index=0)

print('dropped:', dropped, ', left:', len(ingredient_rows))
df = pd.DataFrame(ingredient_rows, columns=['query', 'recipe_id', 
    'quantity', 'unit', 'weight_g', 
    'ingredient', 
    'nutrition_key', 'nutrition_value',
    'cal', 'fat', 'cah', 'protein',
    'original ingredient'])
df.to_csv('ingredient.csv', index=0)


