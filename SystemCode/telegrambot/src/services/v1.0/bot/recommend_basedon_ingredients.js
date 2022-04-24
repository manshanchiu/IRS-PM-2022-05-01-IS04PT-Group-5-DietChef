const { logger } = require('../../../shared/services/utils');
const GoogleSheetHelper = require('../googlesheet');
const Base = require('./base');
const Service = require('./service');
const ESHelper = require('../eshelper');

class RecommendBasedonIngredients extends Base {
    constructor(ctx) {
        super(ctx);
        this._sheetId = '';
        this._ingredients = [];
        this._recipes = [];
    }

    static get command() {
        return 'recommend_basedon_ingredients';
    }

    static get description() {
        return 'to get recipes based on the ingredients (from google sheet)';
    }

    async _handle(sheetId) {
        if (!sheetId) {
            this.sendMessage(
                RecommendBasedonIngredients.Questions.askForIngredientsLink,
                {
                    // parse_mode: 'Markdown',
                    // disable_web_page_preview: false,
                    reply_markup: {
                        force_reply: true,
                        // inline_keyboard: [[{ text: 'xxx', callback_data: 'aaaa' }]],
                        // keyboard: [
                        //     ['Estimate calories'],
                        //     ['Recommend recipes based on the ingredients'],
                        //     ['Recommend recipes based on preferences'],
                        // ],
                    },
                }
            );
        } else {
            this._sheetId = sheetId;
            await this.genericSearch();
        }
    }

    async handleReply() {
        this._sheetId = this._message;
        await this.genericSearch();
    }

    async genericSearch() {
        const { rows, err } = await GoogleSheetHelper.getInventory(
            this._sheetId
        );

        if (err) {
            this.sendMessage(
                RecommendBasedonIngredients.Questions.ingredientsSheetError,
                {
                    parse_mode: 'Markdown',
                    reply_to_message_id: this._messageId,
                }
            );
        } else {
            const ingredients = [];
            rows.forEach((r) => {
                const i = Service.parseToIngredientObj(
                    r._rawData[0],
                    r._rawData[1]
                );
                ingredients.push(i);
            });
            this._ingredients = ingredients;
            this._recipes = await this.searchRecipes();
            const r = this.buildResponse();
            this.sendMessage(r, {
                parse_mode: 'Markdown',
                reply_to_message_id: this._messageId,
            });
        }
    }

    static get Questions() {
        return {
            askForIngredientsLink: 'Please give us the ingredient sheet id',
            ingredientsSheetError:
                'Sorry, we are not able to access the sheet please give us another sheet',
        };
    }

    async searchRecipes() {
        const eshelper = new ESHelper();
        const result = await eshelper.searchRecipesByPreferences(
            process.env.RECIPE_INDEX,
            this._ingredients,
            null,
            10
        );
        return result.hits.hits;
    }

    buildResponse() {
        let t = '';
        if (this._ingredients.length > 0) {
            t += `*Ingredients you have*\n`;
            for (let i = 0; i < this._ingredients.length; i += 1) {
                t += `- ${this._ingredients[i].name}`;
                if (this._ingredients[i].value) {
                    t += ` (${this._ingredients[i].value}g)`;
                }
                t += '\n';
            }
        }

        if (this._recipes.length > 0) {
            t += `\n*Recipes*\n`;
            for (let i = 0; i < this._recipes.length; i += 1) {
                const r = this._recipes[i];
                t += `[${i + 1}. ${r._source.title} (${parseInt(
                    r._source.sum_cal,
                    10
                )} kcal)](${r._source.source_url})\n`;
            }
        } else {
            t += `\n*Sorry we can't find any recipe in our database*`;
        }
        return t;
    }
}

module.exports = RecommendBasedonIngredients;
