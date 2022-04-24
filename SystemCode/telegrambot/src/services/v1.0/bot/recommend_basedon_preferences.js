const Base = require('./base');
const Service = require('./service');
const { Lambda } = require('../../../shared/services/aws');
const ESHelper = require('../eshelper');

class RecommendBasedonPreferences extends Base {
    constructor(ctx) {
        super(ctx);
        this._processedInput = '';
        this._calorie = undefined;
        this._preferences = '';
        this._ingredients = [];
        this._recipes = [];
    }

    static get command() {
        return 'recommend_basedon_preferences';
    }

    static get description() {
        return 'to get recipes recommendation based on preferences';
    }

    async _handle(preferences) {
        if (!preferences) {
            this.sendMessage(
                RecommendBasedonPreferences.Questions.askForPreferences,
                {
                    reply_markup: {
                        force_reply: true,
                    },
                }
            );
        } else {
            this._preferences = preferences;
        }
    }

    async handleReply() {
        this._preferences = this._message;
        await this.genericSearch();
    }

    async genericSearch() {
        // process user input first
        try {
            // 'i have 25000 g pork and 35000g chicken want to make a meal with less than 350000 cal'
            const lambdaR = await Lambda().invoke({
                FunctionName: 'issrecipepyactions-process-userinput',
                Payload: JSON.stringify({
                    body: this._preferences,
                }),
            });
            const p = JSON.parse(lambdaR.Payload);
            if (p.body.length === 0) {
                this.sendMessage("*Sorry we can't find any preference*", {
                    parse_mode: 'Markdown',
                    reply_to_message_id: this._messageId,
                });
                return;
            }
            const input = p.body;
            this._processedInput = input;
            this._ingredients = input
                .filter((i) => i.type === 'ingredient')
                .map((i) =>
                    Service.parseToIngredientObj(i.ingredient, i.value)
                );
            const calorie = input.filter((i) => i.type === 'calorie');
            this._calorie = calorie.length > 0 && calorie[0].value;
            this._recipes = await this.searchRecipesByPreferences();
            const r = this.buildResponse();
            this.sendMessage(r, {
                parse_mode: 'Markdown',
                reply_to_message_id: this._messageId,
            });
        } catch (err) {
            console.log(err);
            this.sendMessage("*Sorry we can't find any preference*", {
                parse_mode: 'Markdown',
                reply_to_message_id: this._messageId,
            });
        }
    }

    async searchRecipesByPreferences() {
        const eshelper = new ESHelper();
        const result = await eshelper.searchRecipesByPreferences(
            process.env.RECIPE_INDEX,
            this._ingredients,
            this._calorie,
            10
        );
        return result.hits.hits;
    }

    static get Questions() {
        return {
            askForPreferences: 'Please give us the preferences',
        };
    }

    buildResponse() {
        let t = '';
        if (this._calorie) {
            t += `*Calorie: ${this._calorie} cal*\n`;
        }

        if (this._ingredients.length > 0) {
            t += `\n*Ingredients*\n`;
            for (let i = 0; i < this._ingredients.length; i += 1) {
                t += `- ${this._ingredients[i].name} (${this._ingredients[i].value}g)\n`;
            }
        }

        if (this._recipes.length > 0) {
            t += `\n*Recipes*\n`;
            for (let i = 0; i < this._recipes.length; i += 1) {
                const r = this._recipes[i];
                t += `[${i + 1}. ${r._source.title} (${parseInt(
                    r._source.sum_cal,
                    10
                )} cal)](${r._source.source_url})\n`;
            }
        } else {
            t += `\n*Sorry we can't find any recipe in our database*`;
        }
        return t;
    }
}

module.exports = RecommendBasedonPreferences;
