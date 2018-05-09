const { Command } = require('discord.js-commando');
const request = require('request-promise-native');

module.exports = class Advice extends Command {
    constructor(client) {
        super(client, {
            name: 'disguise',
            group: 'funcommands',
            memberName: 'diguise',
            description: 'Generates a disguise for you',
            examples: ['disguise'],
            args: [
              {
                key: 'image',
                prompt: 'What should your profile picture be?',
                type: 'string',
                default: null //If null, use a pre-determined image
              }
            ]
        });
    }

    async run(msg, { image }) {
      //Step 1, get image, turn into tags
    }



};
