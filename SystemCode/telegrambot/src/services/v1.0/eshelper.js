const { Client } = require('@elastic/elasticsearch');

class ESHelper {
    constructor() {
        this.client = new Client({
            cloud: { id: process.env.ELASTIC_CLOUDID },
            auth: {
                username: process.env.ELASTIC_USER,
                password: process.env.ELASTIC_PASS,
            },
        });
    }

    async searchRecipe(indexname, text, topN) {
        return this.client.search({
            index: indexname,
            query: {
                match: {
                    ingredients_weight_g: {
                        query: text,
                    },
                },
            },
            size: topN,
        });
    }

    async getAverageCalories(indexname, foodname) {
        return this.client.search({
            index: indexname,
            query: {
                match_phrase: {
                    title: {
                        query: foodname,
                    },
                },
            },
            aggs: {
                'avg-cal': {
                    avg: {
                        field: 'sum_cal',
                    },
                },
            },
            size: 10,
        });
    }

    async searchRecipeUsingNaiveBayes(indexname, text, topN) {
        return this.client.search({
            index: indexname,
            query: {
                function_score: {
                    query: {
                        match: {
                            ingredients_name: text,
                        },
                    },
                    script_score: {
                        script: ESHelper.buildNaiveBayesScript(text),
                    },
                    boost_mode: 'replace',
                },
            },
            size: topN,
        });
    }

    async searchRecipesByPreferences(indexname, ingredients, calorie, topN) {
        const q = ESHelper.buildComplexQuery(ingredients, calorie);
        console.log(JSON.stringify(q));
        return this.client.search({
            index: indexname,
            ...q,
            size: topN,
            _source: ['recipe_id', 'sum_cal', 'title', 'source_url'],
        });
    }

    async searchIngredients(indexname, ingredients) {
        let q = {
            bool: {
                must: [
                    {
                        bool: {
                            should: [
                                {
                                    match_phrase: {
                                        'ingredient.keyword': 'cheese',
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        };

        ingredients.forEach((i) => {
            q.bool.must[0].bool.should.push({
                match_phrase: {
                    'ingredient.keyword': i.name,
                },
            });
        });

        return this.client.search({
            index: indexname,
            query: q,
            size: 1000,
        });
    }

    static buildNaiveBayesScript(text) {
        const subScripts = [];
        const words = text.split(' ');
        words.forEach((w) => {
            subScripts.push(
                `(doc['ingredients_popularity.${w}'].size() != 0 ? doc['ingredients_popularity.${w}'].value : 0)`
            );
        });
        return subScripts.join('+');
    }

    static buildComplexQuery(ingredients, calorie) {
        const ingredientsName = ingredients.map((i) => i.name);

        const query = {
            query: {
                bool: {
                    must: [
                        {
                            match: {
                                ingredients_weight_g: {
                                    query: ingredientsName.join(' '),
                                },
                            },
                        },
                    ],
                },
            },
        };

        ingredients.forEach((i) => {
            if (i.value && i.value > 0) {
                query.query.bool.must.push({
                    range: {
                        [`ingredients_g.${i.name}`]: {
                            lte: i.value,
                        },
                    },
                });
            }
        });

        if (calorie && calorie > 0) {
            query.query.bool.must.push({
                range: {
                    sum_cal: {
                        lte: calorie,
                    },
                },
            });
        }

        return query;
    }
}

module.exports = ESHelper;
