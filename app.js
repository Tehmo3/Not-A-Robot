var	Discord = require("discord.js"),
	config = require("./secrets.json");

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

var messageArray = [];

var logMessages = function(messages, message) {
	messages.forEach(message => messageArray.push({content: message.content, id: message.id}))
	for (var i = 0; i < messageArray.length; i++) {
		console.log(messageArray[i].content)
	}
	fetchMoreMessages(message, messageArray[i-1]);
}

var fetchMoreMessages = function(message, messageLast) {
	if (message) {
		console.log("LAST!", messageLast.content);
		message.channel.fetchMessages({limit: 100, before:messageLast.id})
		.then(messages => logMessages(messages))
		.catch(console.error)
	}
	else {
		console.log("All messages found!")
	}
}
