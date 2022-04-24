// TODO: implement it
const Base = require('./base');
const ESHelper = require('../eshelper');

class RecommendSimilarRecipes extends Base {
    static get command() {
        return 'recommend_similar_recipes';
    }

    static get description() {
        return 'to get similar recipes';
    }

    async _handle(recipe_id) {}

    async handleReply() {
        this.recipe_id = this._message;
    }
}

module.exports = RecommendSimilarRecipes;
