var	Discord = require("discord.js"),
	config = require("./config.json"),
	fs = require("fs"),
	Chain = require('markov-chains').default;

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
var userID;
client.on('message', message => {
	var messageArray = message.content.split(" ");
	if (messageArray[0] === '!log') {
    	message.channel.fetchMessages({limit: 100})
		.then(messages => logMessages(messages, message))
		.catch(console.error)
	}
	else if (messageArray[0] === "!text") {
		var obj = JSON.parse(fs.readFileSync('textLogs.json', 'utf8'));
		var username = messageArray[1];
		client.users.forEach(user => findID(username, user, userID, obj));
	}


})

var findID = function(username, user, userID, obj) {
	if(user.username === username) {
		 userID = user.id;
		 makeChain(userID, obj);
		 return;
	}
}

var makeChain = function(user, obj) {
	if (user && obj) {
		user = '<@' + user + '>'
		const states = obj[user];
		const chain = new Chain(states);
		const sentence = chain.walk();
		console.log(sentence);
	}
}

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
		messageObject[message.author].push([message.content])
	}
	else {
		messageObject[message.author] = [];
	}
	last = message;
}
