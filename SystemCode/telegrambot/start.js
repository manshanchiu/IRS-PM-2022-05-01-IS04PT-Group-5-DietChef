require('dotenv').config();
const { handler } = require('./src/controllers/v1_0/bot/handler');
const { logger } = require('./src/shared/services/utils');

const ESHelper = require('./src/services/v1.0/eshelper');
const BotService = require('./src/services/v1.0/bot');

const eshelper = new ESHelper();

// (async () => {
//     const a = await eshelper.searchRecipe(
//         'test_recipe_detail',
//         'blue cheese chicken',
//         5
//     );

//     const b = await eshelper.searchRecipeUsingNaiveBayes(
//         'test_recipe_detail',
//         'chicken',
//         5
//     );

//     console.log(a.hits.hits[1]);
//     // console.log(b.hits.hits[0]);
// })();

// Object.keys(BotService.Commends).forEach((key) => {
//     BotService.Commends[key].handle();
// });
handler();
