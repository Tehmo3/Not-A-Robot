const { Command } = require('discord.js-commando');
const Message = require('../../models/message.js');
// const userToID = require('../../helpers/userToID.js');

module.exports = class LinkCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'link',
            group: 'impersonatecommands',
            memberName: 'link',
            description: 'Sends a link that the user has sent in the past',
            examples: ['link'],
            args: [
              {
                key: 'user',
                prompt: 'Which user is the bot emulating?',
                type: 'user'
              }
            ]
        });
    }

    async run(msg, { user }) {
      //Implemented the running here
      // const userID = userToID(user, msg.guild);

      const query = {
        'authorID': user.id,
        'channelName': msg.channel.name,
        'messageType': 'LINK'
      }

      //Doesn't work if these two lines are made into one??
      const linkQuery = Message.find(query);

      let links = await linkQuery.exec();

      links = links.map(e => e.content);

      const link = links[Math.floor(Math.random()*links.length)];

      msg.channel.send(`${link} - ${user}`);

    }
};
