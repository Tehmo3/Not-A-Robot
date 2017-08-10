const mongoose = require('mongoose');
const clone = require('clone');
const guildSchema = require('../schemas/guild.js');
const channelSchema = require('../schemas/channel.js');

const Guild = mongoose.model('Guild', guildSchema);
const Channel = mongoose.model('Channel', channelSchema);

function logMessages(message, client) {
  console.log('reading messages');
  let processed = 0;
  const total = message.guild.channels.array().length;
  message.guild.channels.forEach((channel) => {
    if (channel.permissionsFor(client.user).has(['READ_MESSAGES', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES']) && channel.type === 'text') {
      console.log('New Channel');
      const data = { linkObject: {}, messageObject: {}, songObject: [], num_messages: 0 };
      const index = 0;
      fetchMoreMessages(channel, null, data, true, index, (outputData) => {
        processed += 1;
        console.log(processed, channel.id, channel.name);
        saveFile(outputData, message.guild.id, channel.id, index);
        if (processed === total) {
          message.channel.send('```MESSAGES LOGGED ```');
          console.log('All messages read');
        }
      }); // Lets read some messages!
    }
    else {
      console.log('No perms for', channel.id, channel.name);
      processed += 1;
    }
  });
}


function fetchMoreMessages(channel, messageLast, data, cont, index, callback) {
  if (cont) {
    if (data.num_messages > 20000) {
      const tempData = clone(data);
      saveFile(tempData, channel.guild.id, channel.id, index);
      index += 1;
      data = { linkObject: {}, messageObject: {}, songObject: [], num_messages: 0 };
    }
    channel.fetchMessages({ limit: 100, before: messageLast }) // Read the next 100
      .then(messages => insertMessages(messages, data))
      .then(array => fetchMoreMessages(channel, array[0].id, array[2], array[1], index, callback))
      .catch(console.error);
  }
  else {
    callback(data);
  }
}

function saveFile(data, guildID, channelID, channelIndex) {
  const query = { guildID, channelID, channelIndex };
  Channel.findOne(query, { guildID: 1 }, (err, channel) => {
    if (err) throw err;
    if (!channel) {
      const newChannel = new Channel({
        guildID,
        channelID,
        messages: data,
        channelIndex,
      });
      newChannel.save((err2) => {
        if (err2) throw err2;
        Guild.findOne({ guildID }, { guildID: 1, channels: 1 }, (err3, guild) => {
          if (err3) throw err3;
          if (!guild) {
            throw new Error('No Guild!!!');
          }
          guild.channels.push(channelID);
          guild.lastRefresh = new Date();
          guild.save((err4) => {
            if (err4) throw err4;
            console.log('Guild data updated');
          });
        });
        console.log('Data saved for channel', channelID);
      });
    }
    else {
      channel.messages = data;
      channel.save((error) => {
        if (error) throw error;
        Guild.findOne({ guildID }, { guildID: 1, channels: 1 }, (error2, guild) => {
          if (error2) throw error2;
          if (!guild) {
            throw new Error('No Guild!!!');
          }
          guild.channels.push(channelID);
          guild.lastRefresh = new Date();
          guild.save((error3) => {
            if (error3) throw error3;
            console.log('Guild data updated');
          });
        });
        console.log('Messages updated');
      });
    }
  });
}

function insertMessages(messages, data) {
  const pattern = /^((http|https|ftp):\/\/)/;
  let messageArray = [];
  let last = '';
  messages.forEach((message) => {
    data.num_messages += 1;
    // console.log(data.num_messages);
    if (!data.messageObject[message.author]) { data.messageObject[message.author] = []; }
    if (!data.linkObject[message.author]) { data.linkObject[message.author] = []; }
    if (!message.content.startsWith('!')) {
      messageArray = message.content.split(' ');
      messageArray.forEach((element) => {
        if (element.startsWith('<@') || element.startsWith('@')) {
          // console.log("skipping message");
        }
        else if (!pattern.test(element)) {
          data.messageObject[message.author].push([element]);
        }
        else if (element.indexOf('spotify.com') > -1 || element.indexOf('soundcloud.com') > -1) {
          data.songObject.push([element]);
        }
        else {
          data.linkObject[message.author].push([element]);
        }
      });
    }
    last = message;
  });
  if (messages.array().length === 0) {
    return [last, false, data];
  }
  return [last, true, data];
}

module.exports = logMessages;
