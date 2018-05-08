const { Command } = require('discord.js-commando');
const Message = require('../../models/message.js');
// const userToID = require('../../helpers/userToID.js');
const Text = require('markov-chains-text').default;

module.exports = class TextCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'text',
      group: 'impersonatecommands',
      memberName: 'text',
      description: 'Sends text as if it were sent by user',
      examples: ['text'],
      args: [
        {
          key: 'user',
          prompt: 'What user is the bot emulating?',
          type: 'user'
        }
      ]
    });
  }

  async run(msg, { user }) {
    // const userID = userToID(user, msg.guild);
    const query = {
      'authorID': user.id,
      'channelName': msg.channel.name,
      'messageType': 'TEXT'
    }

    //Doesn't work if these two lines are made into one??
    const messagesQuery = Message.find(query);
    let messages = await messagesQuery.exec();

    messages = messages.map(e => e.content).join(' ');

    const messageGenerator = new Text(messages);

    const settings = {
      maxOverlapRatio: 1,
      maxOverlapTotal: 150000,
      tries: 200
    }

    msg.channel.send(`${messageGenerator.makeSentence(null, settings)} - ${user}`);

  }

}
