const { GoogleSpreadsheet } = require('google-spreadsheet');
const { logger } = require('../../shared/services/utils');

class GoogleSheetHelper {
    static async getInventory(sheetId) {
        // check link here
        const doc = new GoogleSpreadsheet(sheetId);
        await doc.useApiKey(process.env.GOOGLE_TOKEN);
        try {
            await doc.loadInfo();
        } catch (err) {
            logger.error(err);
            return {
                rows: [],
                err,
            };
        }
        // console.log(doc.sheetsByIndex[0]);
        const sheet = doc.sheetsByTitle.inventory;
        const rows = await sheet.getRows(); // can pass in { limit, offset }
        return { rows };
    }
}

module.exports = GoogleSheetHelper;
