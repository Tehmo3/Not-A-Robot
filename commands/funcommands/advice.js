const { Command } = require('discord.js-commando');
const request = require('request-promise-native');

module.exports = class Advice extends Command {
    constructor(client) {
        super(client, {
            name: 'advice',
            group: 'funcommands',
            memberName: 'advice',
            description: 'Gives some helpful advice',
            examples: ['advice']
        });
    }

    async run(msg) {
      const response = await request('http://inspirobot.me/api?generate=true');
      msg.channel.send(response);
    }



};
