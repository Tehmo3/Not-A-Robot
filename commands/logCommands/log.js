const { Command } = require('discord.js-commando');
const Message = require('../../models/message.js');
const Channel = require('./models/channel.js');

module.exports = class LogCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'log',
      group: 'logcommands',
      memberName: 'log',
      description: 'Logs the messages in the current channel',
      examples: ['log']
    });
  }

  async run(msg) {
    const query = {
      guildID : msg.guild.id,
      channelName: msg.channel.name
    }
    const lastMessageLoggedID = Channel.findOne(query).select('lastMessageLoggedID');
    msg.channel.send('Logging Messages! This my take a while.');
    if (lastMessageLoggedID) {
      fetchNewMessages(msg.channel, lastMessageLoggedID, loggingComplete);
    }
    else {
      fetchMessages(msg.channel, null, loggingComplete);
    }
  }
}

async function fetchMessages(channel, lastMessage, callback) {
  // console.log(lastMessage);
  const messages = await channel.fetchMessages({ limit: 100, before: lastMessage});
  if (messages.size) {
    await saveMessages(messages);
    fetchMessages(channel, messages.last().id, callback);
  }
  else {
    callback(channel);
  }
}

async function fetchNewMessages(channel, recentMessage, callback) {
  const messages = await channel.fetchMessages({ limit: 100, after: recentMessage});
  if (messages.size) {
    await saveMessages(messages);
    fetchMessages(channel, messages.last().id, callback);
  }
  else {
    callback(channel);
  }
}

async function loggingComplete(channel) {
  return channel.send("All Messages logged!");
}

async function saveMessages(messages) {
  const messagesToInsert = []
  messages.forEach(msg => {
    const newMsg = new Message();
    newMsg.guildID = msg.channel.guild.id;
    newMsg.channelName = msg.channel.name;
    newMsg.content = msg.content;
    newMsg.authorID = msg.author.id;
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
