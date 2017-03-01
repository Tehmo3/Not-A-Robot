var	Discord = require("discord.js"),
	config = require("./config.json"),
	fs = require("fs");

var client = new Discord.Client();


client.login(config.token, output);

function output(error, token) {
	if (error) {
		console.log("There was an error!");
		return;
	}
	else {
		console.log("Logged in!");
	}
}

client.on('message', message => {
  if (message.content === 'get chat logs') {
    message.channel.fetchMessages({limit: 100})
	.then(messages => logMessages(messages, message))
	.catch(console.error)
	}
})

var messageObject = {};
var last;

var logMessages = function(messages, message) {
	messages.forEach(message => insertMessages(message))
	fetchMoreMessages(message, last);
}

var fetchMoreMessages = function(message, messageLast) {
	if (message) {
		message.channel.fetchMessages({limit: 100, before:messageLast.id})
		.then(messages => logMessages(messages))
		.catch(console.error)
	}
	else {
		console.log("All messages found!")
		var json = JSON.stringify(messageObject);
		fs.writeFile('textLogs.json', json, 'utf8', function(err) {
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
	if (messageObject[message.author]) {
		messageObject[message.author].push({content: message.content, id: message.id})
	}
	else {
		messageObject[message.author] = [];
	}
	last = message;
}
