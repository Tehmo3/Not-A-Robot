const fs = require("fs");
const mongoose = require("mongoose")
const channelSchema = require('../schemas/channel.js');
const Channel = mongoose.model("Channel", channelSchema);

logMessages = function(message) {
	console.log("reading messages");
	let data = {linkObject: {}, messageObject: {}, songObject: [], num_messages: 0}
	fetchMoreMessages(message.channel, message.id, data); //Lets read some messages!
}


function fetchMoreMessages(channel, messageLast, data) {
	if (data) {
		channel.fetchMessages({limit: 100, before:messageLast}) //Read the next 100
		.then(messages => insertMessages(messages, data, channel))
		.then(array => fetchMoreMessages(channel, array[0].id, array[1]))
		.catch(console.error)
	}
	else {
		channel.sendMessage("```MESSAGES LOGGED ```");
		console.log("All messages read")
		return
	}
}

function saveFile(data, channel) {
  var newChannel = new Channel({
    channelID: channel.id,
    admins: [process.env.admin],
    channels: ['general'],
    blacklist: 'Normies',
    messages: data
  });
  newChannel.save(function (err) {
    if (err) throw err;
    console.log("data saved for channel", channel.id);
  })
}

function insertMessages(messages, data,channel) {
	const pattern = /^((http|https|ftp):\/\/)/;
	let messageArray = [];
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
		saveFile(data, channel)
		return [last, null];
	}
	return [last, data];
}

module.exports = logMessages;
