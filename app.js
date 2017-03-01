var	Discord = require("discord.js"),
	config = require("./config.json"),
	fs = require("fs"),
	Text = require('markov-chains-text').default;

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
var randomSentence;
client.on('message', message => {
	var messageArray = message.content.split(" ");
	if (messageArray[0] === '!log') {
    	message.channel.fetchMessages({limit: 100})
		.then(messages => logMessages(messages, message))
		.catch(console.error)
	}
	else if (messageArray[0] === "!text") {
		if (message.author === client.user) {
			console.log("WOOPS DONT TRIGGER YOURSELF!")
			return;
		}
		var obj = JSON.parse(fs.readFileSync('textLogs.json', 'utf8'));
		var username = messageArray[1];
		client.users.forEach(user => findID(username, user, userID, obj));
		console.log(randomSentence);
		message.channel.sendMessage(randomSentence)
		.then(message => console.log(`Sent message: ${message.content}`))
 	.catch(console.error);

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
		const text = obj[user].join(" ");
		console.log(text);
		const fakeSentenceGenerator = new Text(text);
		randomSentence = fakeSentenceGenerator.makeSentence();
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
		var content = message.content.split(" ");
		content.forEach(function(element) {
					messageObject[message.author].push([element])
		})
	}
	else {
		messageObject[message.author] = [];
	}
	last = message;
}
