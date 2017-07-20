const fs = require("fs");
const mongoose = require("mongoose")
const channelSchema = require('../schemas/channel.js');
const Channel = mongoose.model("Channel", channelSchema);

logMessages = function(message) {
  let overallData = {};
	console.log("reading messages");
  message.guild.channels.forEach(function(channel) {
  let data = {linkObject: {}, messageObject: {}, songObject: [], num_messages: 0}
  data = fetchMoreMessages(message, null, data, true); //Lets read some messages!
  overallData[message.channel.id] = data;
  });
  saveFile(overallData, message.guild.id);
}


function fetchMoreMessages(message, messageLast, data, cont) {
	if (cont) {
		message.channel.fetchMessages({limit: 100, before:messageLast}) //Read the next 100
		.then(messages => insertMessages(messages, data, message.guild.id))
		.then(array => fetchMoreMessages(message, array[0].id, array[2], array[1]))
		.catch(console.error)
	}
	else {
		// message.channel.sendMessage("```MESSAGES LOGGED ```");
		// console.log("All messages read")
		return data;
	}
}

function saveFile(data, id) {
  const query = {channelID: id};
  Channel.findOne(query, function (err, channel) {
    if (err) { throw err }
    if (!channel) {
      var newChannel = new Channel({
        channelID: id,
        channels: ['general'],
        blacklist: ['Normies'],
        messages: data
      });
      newChannel.save(function (err) {
        if (err) throw err;
        console.log("data saved for channel", channel.id);
      })
    }
    else {
      channel.messages = data;
      channel.save(function(err) {
        if (err) throw err;
        console.log("Messages updated");
      })
    }
  })
}

function insertMessages(messages, data,channel) {
	const pattern = /^((http|https|ftp):\/\/)/;
	let messageArray = [];
  let last = '';
	messages.forEach(function (message) {
		data.num_messages++;
		console.log(data.num_messages);
		if (!data.messageObject[message.author]) { data.messageObject[message.author] = [] }
		if (!data.linkObject[message.author]) { data.linkObject[message.author] = [] }
		if (!message.content.startsWith("!")) {
			messageArray = message.content.split(" ");
			messageArray.forEach(function(element) {
                if (element.startsWith('<@') || element.startsWith('@') ) {}
				else if (!pattern.test(element)) {
					data.messageObject[message.author].push([element])
				}
				else if (element.indexOf("spotify.com") > -1 || element.indexOf("soundcloud.com") > -1) {
					data.songObject.push([element])
				}
				else {
					data.linkObject[message.author].push([element])
				}
			})
		}
		last = message;
	});
	if (messages.array().length == 0) {
		return [last, false, data];
	}
	return [last, true, data];
}

module.exports = logMessages;
