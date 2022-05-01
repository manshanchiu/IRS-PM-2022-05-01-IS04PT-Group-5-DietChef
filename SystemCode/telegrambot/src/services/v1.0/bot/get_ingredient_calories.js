const Base = require('./base');
const ESHelper = require('../eshelper');
const { Lambda } = require('../../../shared/services/aws');
const Service = require('./service');

class GetIngredientCalories extends Base {
    constructor(ctx) {
        super(ctx);
        this._processedInput = '';
        this._input = '';
        this._ingredients = [];
        this._ingredientsResult = [];
    }

    static get command() {
        return 'get_ingredients_calories';
    }

    static get description() {
        return 'to get ingredients caloris';
    }

    async _handle(input) {
        console.log(input);
        if (!input) {
            this.sendMessage(GetIngredientCalories.Questions.askForIngredient, {
                reply_markup: {
                    force_reply: true,
                },
            });
        } else {
            this._input = input;
            await this.genericSearch();
        }
    }

    async handleReply() {
        this._input = this._message;
        await this.genericSearch();
    }

    async genericSearch() {
        // process user input first
        try {
            // 'i have 25000 g pork and 35000g chicken want to make a meal with less than 350000 cal'
            const lambdaR = await Lambda().invoke({
                FunctionName: 'issrecipepyactions-process-userinput',
                Payload: JSON.stringify({
                    body: this._input,
                }),
            });
            const p = JSON.parse(lambdaR.Payload);
            if (p.body.length === 0) {
                this.sendMessage("*Sorry we can't find any ingredient*", {
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
            this._ingredientsResult = await this.searchIngredients();
            const r = this.buildResponse();
            this.sendMessage(r, {
                parse_mode: 'Markdown',
                reply_to_message_id: this._messageId,
            });
        } catch (err) {
            console.log(err);
            this.sendMessage("*Sorry we can't find any ingredient*", {
                parse_mode: 'Markdown',
                reply_to_message_id: this._messageId,
            });
        }
    }

    async searchIngredients() {
        const eshelper = new ESHelper();
        const result = await eshelper.searchIngredients(
            process.env.INGREDIENT_INDEX,
            this._ingredients,
            10
        );
        return result.hits.hits;
    }

    static get Questions() {
        return {
            askForIngredient: 'Please give us the ingredient',
        };
    }

    buildResponse() {
        let t = '';

        if (this._ingredientsResult.length > 0) {
            t += `\n*Ingredients*\n`;
            for (let i = 0; i < this._ingredientsResult.length; i += 1) {
                const ingredient = this._ingredientsResult[i];
                t += `- 1g of *${ingredient._source.ingredient}* is ${ingredient._source.cal}cal`;

                const specfiedValue = this._ingredients.find(
                    (ii) => ii.name === ingredient._source.ingredient
                ).value;
                if (specfiedValue && specfiedValue > 0) {
                    t += ` => ${parseFloat(
                        specfiedValue * ingredient._source.cal
                    ).toFixed(1)}cal (${specfiedValue}g)`;
                }
                t += '\n';
            }
        } else {
            t += `\n*Sorry we can't find any ingredient in our database*`;
        }
        return t;
    }
}

module.exports = GetIngredientCalories;
