const { logger } = require('../../../shared/services/utils');

class Base {
    constructor(ctx) {
        const _ctx = ctx;
        this.ctx = _ctx;
        this._message = String(this.ctx.message.text);
        this._chatId = this.ctx.message.chat.id;
        this._messageId = ctx.message.message_id;
        this._replyToMessage =
            ctx.message.reply_to_message && ctx.message.reply_to_message.text;
    }

    static get commend() {
        return null;
    }

    static get description() {
        return null;
    }

    static get Questions() {
        return {};
    }

    static getCommend() {
        return this._message.startsWith('/');
    }

    async handleCommand() {
        // split commend
        const t = this._message.split(`/${this.constructor.commend} `)[1];
        await this._handle(t);
    }

    sendMessage(text, extract) {
        this.ctx.telegram.sendMessage(this._chatId, text, extract);
    }
}

module.exports = Base;
