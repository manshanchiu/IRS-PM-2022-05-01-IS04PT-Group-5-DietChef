/* eslint-disable no-await-in-loop */
const { Telegraf } = require('telegraf');
const Base = require('../../base');
const BotService = require('../../../services/v1.0/bot');
const { logger } = require('../../../shared/services/utils');
// const bot = new Telegraf(process.env.BOT_TOKEN);
class Handler extends Base {
    static get schema() {
        return {
            properties: {
                sample: {
                    type: 'string',
                },
            },
            required: [],
        };
    }

    // eslint-disable-next-line class-methods-use-this
    async handler() {
        // bot.handleUpdate(this.params);
        const bot = new Telegraf(process.env.BOT_TOKEN);
        // const bot = new TelegramBot(process.env.BOT_TOKEN);

        // get all registered commend
        // Object.keys(BotService.Commends).forEach((key) => {
        //     const { commend } = BotService.Commends[key];
        //     logger.info(`registering commend ${commend}`);
        //     // listen to commend
        //     bot.command(commend, async (ctx) => {
        //         const S = BotService.Commends[key];
        //         await new S(ctx).handleCommand();
        //     });
        // });

        await bot.on('text', async (ctx) => {
            const t = ctx.message.text;
            const replyText =
                ctx.message.reply_to_message &&
                ctx.message.reply_to_message.text;
            let replied = false;

            for (const [, S] of Object.entries(BotService.Commands)) {
                const { command } = S;
                // const S = BotService.Commends[key];
                if (t.startsWith(`/${command}`)) {
                    replied = true;
                    await new S(ctx).handleCommand();
                } else if (
                    replyText &&
                    S.Questions &&
                    Object.values(S.Questions).indexOf(replyText) !== -1
                ) {
                    replied = true;
                    await new S(ctx).handleReply();
                }
            }
            if (!replied) {
                const greetingMessage = BotService.Service.buildGreeting(
                    ctx.from.first_name + ctx.from.last_name,
                    BotService.Commands
                );

                ctx.telegram.sendMessage(ctx.message.chat.id, greetingMessage);
            }
        });

        bot.on('callback_query', (ctx) => {
            // Explicit usage
            // ctx.telegram.answerCbQuery(ctx.callbackQuery.id);
            // ctx.telegram
            if (ctx.callbackQuery.data === 'next_receipe') {
                // TODO: find next query based on the search
                ctx.editMessageText(BotService.Service.receipe(2), {
                    parse_mode: 'Markdown',
                    // reply_markup: {
                    //     inline_keyboard: [
                    //         [{ text: 'Next', callback_data: 'next_receipe' }],
                    //     ],
                    // },
                });
            }
        });

        bot.launch();
        // await bot.handleUpdate(this.params);
        return { data: { b: 'cc' } };
    }
}

module.exports = Handler.build();
