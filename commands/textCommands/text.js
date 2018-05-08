const { Command } = require('discord.js-commando');
const Message = require('../../models/message.js');
const userToID = require('../../helpers/userToID.js');
const Text = require('markov-chains-text').default;

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
    const query = {
      'authorID': userID,
      'channelName': msg.channel.name,
      'messageType': 'TEXT'
    }
    const messagesQuery = Message.find(query);
    let messages = await messagesQuery.exec();
    messages = messages.map(e => e.content).join(' ');
    console.log(messages);
    const messageGenerator = new Text(messages);
    const settings = {
      maxOverlapRatio: 1,
      maxOverlapTotal: 150000,
      tries: 200
    }
    msg.channel.send(`${messageGenerator.makeSentence(null, settings)} - ${user}`);

  }

}
