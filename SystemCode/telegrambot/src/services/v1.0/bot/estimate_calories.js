const Base = require('./base');
const ESHelper = require('../eshelper');

class EstimateCalories extends Base {
    static get command() {
        return 'estimate_calories';
    }

    static get description() {
        return 'to estimate calories';
    }

    async _handle(foodname) {
        if (!foodname) {
            this.sendMessage(EstimateCalories.Questions.askForFoodName, {
                reply_markup: {
                    force_reply: true,
                },
            });
        } else {
            this._foodname = foodname;
            await this._genericEstimate();
        }
    }

    async handleReply() {
        this._foodname = this._message;
        await this._genericEstimate();
    }

    async _genericEstimate() {
        const { total, avg, hits } = await this.getEstimatedCalories();
        if (total === 0) {
            this.sendMessage("Sorry the food doesn't exist in our database.");
        } else {
            this.sendMessage(
                EstimateCalories.buildEstimatedCaloriesMessage(
                    this._foodname,
                    total,
                    avg,
                    hits
                ),
                {
                    parse_mode: 'Markdown',
                    reply_to_message_id: this._messageId,
                }
            );
        }
    }

    async getEstimatedCalories() {
        const eshelper = new ESHelper();
        try {
            const result = await eshelper.getAverageCalories(
                process.env.RECIPE_INDEX,
                this._foodname
            );
            const { value: total } = result.hits.total;
            const avg = result.aggregations['avg-cal'].value;
            return {
                total,
                avg,
                hits: result.hits.hits,
            };
        } catch (err) {
            return { total: 0, avg: 0, hits: [] };
        }
    }

    static get Questions() {
        return {
            askForFoodName: 'Please give us the food name',
        };
    }

    static buildEstimatedCaloriesMessage(name, total, avg, recipes) {
        let t = `${name} is *${parseInt(
            avg,
            10
        )}cal* based on *${total}* recipes in our databases\n`;
        for (let i = 0; i < recipes.length; i += 1) {
            const r = recipes[i];
            t += `[${i + 1}. ${r._source.title} (${parseInt(
                r._source.sum_cal,
                10
            )} cal)](${r._source.source_url})\n`;
        }
        return t;
    }
}

module.exports = EstimateCalories;
