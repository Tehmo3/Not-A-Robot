const { Command } = require('discord.js-commando');
const Message = require('../../models/message.js');
const userToID = require('../../helpers/userToID.js');
module.exports = class TextCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'text',
      group: 'textcommands',
      memberName: 'text',
      description: 'Sends text as if it were sent by user',
      examples: ['text'],
      args: [
        {
          key: 'user',
          prompt: 'What user should the bot emulate?',
          type: 'string'
        }
      ]
    });
  }

  async run(msg, { user }) {
    const userID = userToID(user, msg.guild);

    const messages = await Message.find({'authorID': userID}).exec();

    console.log(messages);
  }

}
