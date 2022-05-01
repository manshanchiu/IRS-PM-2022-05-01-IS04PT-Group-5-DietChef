import os
from elasticsearch import Elasticsearch
from elasticsearch import helpers

def newES():
    return Elasticsearch(
        os.getenv("ELASTIC_HOST"),
        basic_auth=(os.getenv("ELASTIC_USER"), os.getenv("ELASTIC_PASS"))
    )


def bulkIndex(docs, indexname, idformat):
    es = newES()
    actions = []
    for d in docs:
        action = {
            '_op_type': 'index',
            "_source": d,
            "_index": indexname,
            "_id": idformat.format(**d)
        }
        actions.append(action)
    try:
        print("pushing {0} documents".format(len(actions)))
        print(helpers.bulk(client=es, actions=actions))
    except Exception as e:
        return e


def searchByIngredient(indexname, text, topN):
    es = newES()
    resp = es.search(index=indexname, query={"match": {
        "ingredients_weight_g": {
            "query": text,
        }
    }}, size=topN)
    print("Got %d Hits:" % len(resp['hits']['hits']))