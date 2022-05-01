const Base = require('./base');
const ESHelper = require('../eshelper');

class RecommendSimilarRecipes extends Base {
    constructor(ctx) {
        super(ctx);
        this._recipename = '';
        this._recipe = '';
        this._recipes = [];
    }

    static get command() {
        return 'recommend_similar_recipes';
    }

    static get description() {
        return 'to get similar recipes';
    }

    async _handle(recipename) {
        if (!recipename) {
            this.sendMessage(
                RecommendSimilarRecipes.Questions.askForRecipeNmae,
                {
                    reply_markup: {
                        force_reply: true,
                    },
                }
            );
        } else {
            this._recipename = recipename;
            await this.genericSearch();
        }
    }

    async handleReply() {
        this._recipename = this._message;
        await this.genericSearch();
    }

    async genericSearch() {
        // process user input first
        try {
            // 'i have 25000 g pork and 35000g chicken want to make a meal with less than 350000 cal'
            const recipes = await this.searchRecipeByName();
            if (recipes.length === 0) {
                this.sendMessage(
                    "*Sorry the recipe doesn't exist in our database.*",
                    {
                        parse_mode: 'Markdown',
                        reply_to_message_id: this._messageId,
                    }
                );
                return;
            }
            console.log(recipes);
            [this._recipe] = recipes;
            // get detail for all the recipes

            this._recipes = await this.searchRecipeById();
            if (this._recipes.length === 0) {
                this.sendMessage(
                    "*Sorry the recipe doesn't have any similar recipes in our database.*",
                    {
                        parse_mode: 'Markdown',
                        reply_to_message_id: this._messageId,
                    }
                );
                return;
            }
            const r = this.buildResponse();
            this.sendMessage(r, {
                parse_mode: 'Markdown',
                reply_to_message_id: this._messageId,
            });
        } catch (err) {
            console.log(err);
            this.sendMessage(
                "*Sorry the recipe doesn't exist in our database.*",
                {
                    parse_mode: 'Markdown',
                    reply_to_message_id: this._messageId,
                }
            );
        }
    }

    async searchRecipeByName() {
        const eshelper = new ESHelper();
        const result = await eshelper.searchRecipeByName(
            process.env.RECIPE_INDEX,
            this._recipename,
            1
        );
        return result.hits.hits;
    }

    async searchRecipeById() {
        const eshelper = new ESHelper();
        const result = await eshelper.searchRecipeByIds(
            process.env.RECIPE_INDEX,
            this._recipe._source.similar_recipes.map((r) => r.recipe_id),
            1
        );
        return result.hits.hits;
    }

    buildResponse() {
        let t = '';
        // t += `*Your Recipe:*\n`;
        // t += `[${this._recipe._source.title} (${parseInt(
        //     this._recipe._source.sum_cal,
        //     10
        // )} cal)](${this._recipe._source.source_url}) \n`;

        t += `*Similar Recipes*\n`;
        for (let i = 0; i < this._recipes.length; i += 1) {
            const r = this._recipes[i];
            t += `[${i + 1}. ${r._source.title} (${parseInt(
                r._source.sum_cal,
                10
            )} kcal)](${r._source.source_url})\n`;
        }
        return t;
    }

    static get Questions() {
        return {
            askForRecipeNmae: 'Please give us the recipe name',
        };
    }
}

module.exports = RecommendSimilarRecipes;
