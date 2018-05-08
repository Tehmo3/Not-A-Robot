const { Command } = require('discord.js-commando');
const Message = require('../../models/message.js');
const Channel = require('../../models/channel.js');

module.exports = class LogCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'log',
      group: 'logcommands',
      memberName: 'log',
      description: 'Logs the messages in the current channel',
      examples: ['log'],
      clientPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run(msg) {
    const query = {
      guildID : msg.guild.id,
      channelName: msg.channel.name
    }
    let dbChannelQuery = Channel.findOne(query);
    let dbChannel = await dbChannelQuery.exec();
    const firstLog = dbChannel ? 0 : 1;
    // console.log(await dbChannel.exec());

    if (!dbChannel) {
      dbChannel = new Channel();
      dbChannel.guildID = msg.guild.id
      dbChannel.channelName = msg.channel.name
      dbChannel.lastMessageLoggedID = null
    }

    msg.channel.send('Logging Messages! This my take a while.');

    const channelAggregate = {
      db: dbChannel,
      dc: msg.channel
    }

    if (!firstLog) {
      fetchNewMessages(channelAggregate, dbChannel.lastMessageLoggedID, loggingComplete);
    }
    else {
      fetchMessages(channelAggregate, null, loggingComplete);
    }
  }

}

//This function saves all messages in the channel.
async function fetchMessages(channel, lastMessage, callback) {
  // console.log(lastMessage);
  const messages = await channel.dc.fetchMessages({ limit: 100, before: lastMessage});
  if (messages.size) {
    await saveMessages(messages);

    if (lastMessage === null) {
      console.log("Saving channel!");
      channel.db.lastMessageLoggedID = messages.first().id;
      await channel.db.save();
      console.log("Channel Saved!")
    }

    fetchMessages(channel, messages.last().id, callback);
  }
  else {
    callback(channel);
  }
}

//This function only reads new messages since the last call.
//Will error if fetchMessages has not been run before (I think)
async function fetchNewMessages(channel, recentMessage, callback) {
  const messages = await channel.dc.fetchMessages({ limit: 100, after: recentMessage});
  if (messages.size) {
    await saveMessages(messages);
    channel.db.lastMessageLoggedID = messages.first().id;
    fetchNewMessages(channel, messages.first().id, callback);
  }
  else {
    await channel.db.save();
    console.log('Updated last logged in channel!');
    callback(channel);
  }
}

async function loggingComplete(channel) {
  return channel.dc.send("All Messages logged!");
}

async function saveMessages(messages) {
  const messagesToInsert = []
  messages.forEach(msg => {
    const newMsg = new Message();
    newMsg.guildID = msg.channel.guild.id;
    newMsg.channelName = msg.channel.name;
    newMsg.content = msg.content;
    newMsg.authorID = msg.author.id;
    newMsg.messageID = msg.id;
    messagesToInsert.push(newMsg);
  });
  if (messagesToInsert.length) {
    await Message.collection.insert(messagesToInsert)
    return true;
  }
  else {
    return false;
  }
}
