var config = require("../config.json"),
	fs = require("fs"),
	linkObject = {},
	songObject = [],
	messageObject = {},
 	last,
 	num_messages = 0;

var exports = module.exports = {}

exports.logMessages = function(messages, message) {
	console.log("reading messages");
	messages.forEach(messageLog => insertMessages(messageLog))
	fetchMoreMessages(message, last);
}

logMessages = exports.logMessages;

var fetchMoreMessages = function(message, messageLast) {
	if (num_messages<config.max_messages) {
		message.channel.fetchMessages({limit: 100, before:messageLast.id})
		.then(messages => logMessages(messages, message))
		.catch(console.error)
	}
	else {
		message.channel.sendMessage("```MESSAGES LOGGED ```");
		console.log("All messages found!")
        var totalobj = {links: linkObject, songs: songObject, messages: messageObject}
		var json = JSON.stringify(totalobj);
		fs.writeFile('data.json', json, 'utf8', function(err) {
			if (err) {
				console.log("Error!:", err);
			}
			else {
				console.log("File Written!");
			}
		})
	}
}

var insertMessages = function(message) {
	var pattern = /^((http|https|ftp):\/\/)/;
	num_messages++;
	console.log(num_messages);
	if (!messageObject[message.author]) {
		messageObject[message.author] = []
	}
	if (!linkObject[message.author]) {
		linkObject[message.author] = []
	}
	if (!message.content.startsWith("!")) {
		var messageArray = message.content.split(" ");
		messageArray.forEach(function(element) {
			if (!pattern.test(element)) {
				messageObject[message.author].push([element])
			}
			else if (element.indexOf("spotify.com") > -1 || element.indexOf("soundcloud.com") > -1) {
				songObject.push([element])
			}
			else {
				linkObject[message.author].push([element])
			}
		})
	}
	last = message;
}
