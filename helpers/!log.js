const fs = require("fs");
const mongoose = require("mongoose")
const channelSchema = require('../schemas/channel.js');
const Channel = mongoose.model("Channel", channelSchema);

logMessages = function(message) {
  let overallData = {};
	console.log("reading messages");
  let processed = 0;
  const total = message.guild.channels.array().length;
  message.guild.channels.forEach(function(channel) {
    if (channel.type !== "text") {
      processed++;
      return ;
    }
    console.log("New Channel");
    let data = {linkObject: {}, messageObject: {}, songObject: [], num_messages: 0}
    fetchMoreMessages(channel, null, data, true, function(outputData) {
      overallData[channel.id] = outputData;
      processed++;
      if (processed === total) {
        saveFile(overallData, message.guild.id);
        message.channel.sendMessage("```MESSAGES LOGGED ```");
        console.log("All messages read")
      }
    }); //Lets read some messages!
  });
}


function fetchMoreMessages(channel, messageLast, data, cont, callback) {
	if (cont) {
		channel.fetchMessages({limit: 100, before:messageLast}) //Read the next 100
		.then(messages => insertMessages(messages, data, channel.guild.id))
		.then(array => fetchMoreMessages(channel, array[0].id, array[2], array[1], callback))
		.catch(console.error)
	}
	else {
		callback(data);
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
