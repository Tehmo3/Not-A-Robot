var config = require("../config.json"),
	fs = require("fs"),
	exports = module.exports = {};


exports.logMessages = function(message) {
	console.log("reading messages");
	var data = {linkObject: {}, messageObject: {}, songObject: [], num_messages: 0}
	fetchMoreMessages(message.channel, message.id, data); //Lets read some messages!
}


var fetchMoreMessages = function(channel, messageLast, data) {
	if (data.num_messages<config.max_messages) { //More messages to be read!
		channel.fetchMessages({limit: 100, before:messageLast}) //Read the next 100
		.then(messages => insertMessages(messages, data))
		.then(array => fetchMoreMessages(channel, array[0].id, array[1]))
		.catch(console.error)
	}
	else {
		channel.sendMessage("```MESSAGES LOGGED ```");
		console.log("All messages found!")
		saveFile(data)
	}
}

var saveFile = function (data) {
	var json = JSON.stringify(data);
	fs.writeFile('data.json', json, 'utf8', function(err) {
		if (err) {
			console.log("Error!:", err);
		}
		else {
			console.log("File Written!");
		}
	})

}

var insertMessages = function(messages, data) {
	var pattern = /^((http|https|ftp):\/\/)/;
	var messageArray = [];
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
	return [last, data];
}
