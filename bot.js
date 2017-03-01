var	Discord = require("discord.js"),
	config = require("./config.json"),
	fs = require("fs"),
	Text = require('markov-chains-text').default;

var client = new Discord.Client();
var date = new Date();
var num_messages = 0;

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
	var validChannels = config.channel.split(" ");
	var messageArray = message.content.split(" ");
	if (validChannels.indexOf(message.channel.name) === -1) {
		console.log("not a valid channel")
		return;
	}
	if (messageArray[0] === '!log') {
		if (message.author === client.user) {
			console.log("WOOPS DONT TRIGGER YOURSELF!")
			return;
		}
    	message.channel.fetchMessages({limit: 100})
		.then(messages => logMessages(messages, message))
		.catch(console.error)
	}
	else if (messageArray[0] === "!text") {
		var obj = JSON.parse(fs.readFileSync('textLogs.json', 'utf8'));
		var username = messageArray[1]
		client.users.forEach(user => findID(username, user, userID, obj));
		if (message.author === client.user || userID === client.user ) {
			console.log("WOOPS DONT TRIGGER YOURSELF!")
			return;
		}
		message.channel.sendMessage(randomSentence+ "- " + username + " "+ date.getFullYear())
		.then(message => console.log(`Sent message: ${message.content}`))
 	.catch(console.error);
	}
	else if (messageArray[0] === "!help") {
		console.log("SOMEONE NEEDS MY HELP!");
		message.channel.sendMessage(helpMessage())
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
		const fakeSentenceGenerator = new Text(text);
		randomSentence = fakeSentenceGenerator.makeSentence();
	}
}

var messageObject = {};
var last;

var logMessages = function(messages, message) {
	console.log("reading messages");
	messages.forEach(messageLog => insertMessages(messageLog))
	fetchMoreMessages(message, last);
}

var fetchMoreMessages = function(message, messageLast) {
	if (messageLast && num_messages<config.max_messages) {
		message.channel.fetchMessages({limit: 100, before:messageLast.id})
		.then(messages => logMessages(messages, message))
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
	num_messages++;
	console.log(num_messages);
	if (messageObject[message.author]) {
		if (!message.content.startsWith("!")) {
					var messageArray = message.content.split(" ");
					messageArray.forEach(function(element) {
						messageObject[message.author].push([element])
					})
		}
	}
	else {
		messageObject[message.author] = [];
	}
	last = message;
}

var helpMessage = function() {
	return " ```!log - to log the messages from the chat (REQUIRED BEFORE ANY OTHER COMMANDS) \n!text <username> - randomly generate a sentence that <username> would say ```"
}
