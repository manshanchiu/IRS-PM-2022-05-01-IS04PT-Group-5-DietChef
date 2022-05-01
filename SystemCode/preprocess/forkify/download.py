#encoding=utf8

import time
import requests
import json
import urllib.parse
import os

'''
安装包：
pip3 install requests

'''

# 每抓取一个 api， 就SLEEP 一段时间（秒）
SLEEP_TIME = 1

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

def get_url(url): 
    '''
    get response from a server url
    '''
    print(url)
    time.sleep(SLEEP_TIME)
    response = requests.get(url)
    txt = response.text
    return txt


# step 1. 调用 search api，得到每个query对应的recipes. 保存到文件中
for query in query_list: 
    param = urllib.parse.quote(query)
    url = 'https://forkify-api.herokuapp.com/api/search?q=%s' % (param)

    txt = get_url(url)

    file_name = 'data/search_%s.txt' % (query.replace(' ', '-'))
    with open(file_name, 'w') as fw: 
        fw.write(txt)

# step 2. 解析 step 1 得到的文件，从而得到全部的 recipe_id
# 依次调用 get api,得到每个recipe的详表，保存到文件中
for query in query_list: 
    file_name = 'data/search_%s.txt' % (query.replace(' ', '-'))
    txt = open(file_name).read()
    obj = json.loads(txt)
    for recipe in obj['recipes']: 
        recipe_id = recipe['recipe_id']
        file_name = 'data/get_%s_%s.txt' % (query.replace(' ', '-'), recipe_id)

        # 已经下载的，就不再重复下载了
        if os.path.exists(file_name): 
            print('skip', file_name)
            continue

        url = 'https://forkify-api.herokuapp.com/api/get?rId=%s' % (recipe_id)

        txt = get_url(url)

        with open(file_name, 'w') as fw: 
            fw.write(txt)

