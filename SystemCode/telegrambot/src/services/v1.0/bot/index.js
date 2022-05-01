const EstimateCalories = require('./estimate_calories');
const RecommendBasedonIngredients = require('./recommend_basedon_ingredients');
const RecommendBasedonPreferences = require('./recommend_basedon_preferences');
const RecommendSimilarRecipes = require('./recommend_similar_recipes');
const GetIngredientCalories = require('./get_ingredient_calories');
const RecommendBasedonImage = require('./recommend_basedon_image');
const Service = require('./service');

module.exports = {
    Commands: {
        EstimateCalories,
        RecommendBasedonIngredients,
        RecommendBasedonPreferences,
        GetIngredientCalories,
        RecommendSimilarRecipes,
        RecommendBasedonImage,
    },
    Service,
};
