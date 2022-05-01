/* eslint-disable max-classes-per-file */
class Ingredient {
    constructor(name, value) {
        this._name = name;
        this._value = parseInt(value, 10) || undefined;
    }

    get name() {
        return this._name;
    }

    get value() {
        return this._value;
    }
}
class Bot {
    static greeting(username) {
        const t = `Hello ${username} What can i help you?\n1. Use /estimate_calories to estimate calories\n2. Use /recommend_basedon_ingredients to get recipes r based on the ingredients\n3. Use /recommend_basedon_preferences to get recipes recommendation based on preferences`;
        return t;
    }

    static buildGreeting(username, commands) {
        console.log(commands);
        let count = 1;
        let t = `Hello ${username} What can i help you?\n`;
        for (const [, S] of Object.entries(commands)) {
            const { command, description } = S;
            console.log(command);
            t += `${count}. Use /${command} ${description}\n`;
            count += 1;
        }
        return t;
    }

    static receipeOptions(messageID) {
        return {
            parse_mode: 'Markdown',
            reply_to_message_id: messageID,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Next',
                            callback_data: 'next_receipe',
                        },
                    ],
                ],
            },
        };
    }

    static parseToIngredientObj(name, value) {
        return new Ingredient(name, value);
    }
}

module.exports = Bot;
