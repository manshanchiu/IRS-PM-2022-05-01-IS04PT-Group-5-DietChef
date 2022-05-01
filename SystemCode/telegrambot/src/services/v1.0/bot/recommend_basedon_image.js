const { logger } = require('../../../shared/services/utils');
const GoogleSheetHelper = require('../googlesheet');
const Base = require('./base');
const Service = require('./service');
const ESHelper = require('../eshelper');

class RecommendBasedonImage extends Base {
    constructor(ctx) {
        super(ctx);
        this._sheetId = '';
        this._ingredients = [];
        this._recipes = [];
    }

    static get command() {
        return 'recommend_basedon_image';
    }

    static get description() {
        return 'to get ingredients from image then recommend you recipes';
    }

    async _handle() {
        this.sendMessage(RecommendBasedonImage.Questions.askForImage, {
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
        });
    }

    async handleReply() {
        if (!this.ctx.message.photo || this.ctx.message.photo.length === 0) {
            this.sendMessage('*Sorry please send us an image*', {
                parse_mode: 'Markdown',
                reply_to_message_id: this._messageId,
            });
            return;
        }
        await this.genericSearch();
    }

    async genericSearch() {
        this._ingredients = [
            Service.parseToIngredientObj('broccoli'),
            Service.parseToIngredientObj('apple'),
            Service.parseToIngredientObj('orange'),
        ];
        this._recipes = await this.searchRecipes();
        const r = this.buildResponse();
        this.sendMessage(r, {
            parse_mode: 'Markdown',
            reply_to_message_id: this._messageId,
        });
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

    static get Questions() {
        return {
            askForImage: 'Please send us an image',
        };
    }
}

module.exports = RecommendBasedonImage;
