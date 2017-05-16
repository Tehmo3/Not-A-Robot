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
var randomLink;


client.on('message', message => {
	var validChannels = config.channel.split(" ");
	var messageArray = message.content.split(" ");
	var admins = config.admins.split(" ")
	if (validChannels.indexOf(message.channel.name) === -1) {
		console.log("not a valid channel")
		return;
	}
	if (messageArray[0] === '!log') {
		if (message.author === client.user || admins.indexOf(message.author.username) === -1 || message.member.roles.exists("name",config.blacklist)) {
			message.channel.sendMessage("```Sorry. You don't have permission to do that. ```");
			console.log("Error")
			return;
		}
		message.channel.sendMessage("```Logging messages, this may take a while. ```");
    	message.channel.fetchMessages({limit: 100})
		.then(messages => logMessages(messages, message))
		.catch(console.error)
	}
	if (messageArray[0] === "!text" || messageArray[0] === '!link') {
		var obj = JSON.parse(fs.readFileSync('textLogs.json', 'utf8'));
		var username = messageArray[1]
		client.users.forEach(user => findID(username, user, userID, obj, messageArray[0]));
		if (message.author === client.user || userID === client.user || message.member.roles.exists("name",config.blacklist)) {
			message.channel.sendMessage("```Sorry. You don't have permission to do that. ```");
			console.log("Error!")
			return;
		}
		if (!username && messageArray[0] != '!song') {
			message.channel.sendMessage("```Please specify a user. ```");
		}
		else if (messageArray[0] === "!text") {
			if (typeof randomSentence == 'undefined') {
				message.channel.sendMessage("User not found")
				return;
			}
			message.channel.sendMessage(randomSentence+ " - " + username + " "+ date.getFullYear())
			.then(message => messageSent(message))
			.catch(console.error);
		}
		else if (messageArray[0] == '!link') {
			if (typeof randomLink == "undefined") {
				message.channel.sendMessage("User not found")
				return;
			}
			message.channel.sendMessage(randomLink+ " - " + username + " "+ date.getFullYear())
			.then(message => messageSent(message))
			.catch(console.error);
		}
	}
	if (messageArray[0] === "!song") {
		var song = getSong()
		message.channel.sendMessage(song)
		.then(message => messageSent(message))
		.catch(console.error);
	}
	else if (messageArray[0] === "!help") {
		console.log("SOMEONE NEEDS MY HELP!");
		message.channel.sendMessage(helpMessage())
	}
})

var getSong = function() {
	var obj = JSON.parse(fs.readFileSync('songLogs.json', 'utf8'));
	song = obj[Math.floor(Math.random()*obj.length)]
	return song
}
var messageSent = function(message) {
	console.log(`Sent message: ${message.content}`);
	randomSentence = "NULL";
	randomLink = "NULL";
}

var findID = function(username, user, userID, obj, type) {
	if (type == '!song') { return}
	if(user.username === username) {
		 userID = user.id;
		 if (type == '!text') { makeChain(userID, obj); }
		 if (type == '!link') { getLink(userID)}
		 return;
	}
}

var getLink = function (userID) {
	var obj = JSON.parse(fs.readFileSync('linkLogs.json', 'utf8'));
	user = '<@' + userID + '>'
	randomLink = obj[user][Math.floor(Math.random()*obj[user].length)]
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
var linkObject = {};
var songObject = [];
var last;

var logMessages = function(messages, message) {
	console.log("reading messages");
	messages.forEach(messageLog => insertMessages(messageLog))
	fetchMoreMessages(message, last);
}

var fetchMoreMessages = function(message, messageLast) {
	if (num_messages<config.max_messages) {
		message.channel.fetchMessages({limit: 100, before:messageLast.id})
		.then(messages => logMessages(messages, message))
		.catch(console.error)
	}
	else {
		message.channel.sendMessage("```MESSAGES LOGGED ```");
		console.log("All messages found!")
		var json = JSON.stringify(messageObject);
		var json2 = JSON.stringify(linkObject);
		var json3 = JSON.stringify(songObject);
		fs.writeFile('textLogs.json', json, 'utf8', function(err) {
			if (err) {
				console.log("Error!:", err);
			}
			else {
				console.log("File Written!");
			}
		})
		fs.writeFile('linkLogs.json', json2, 'utf8', function(err) {
			if (err) {
				console.log("Error!:", err);
			}
			else {
				console.log("File Written!");
			}
		})
		fs.writeFile('songLogs.json', json3, 'utf8', function(err) {
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

var helpMessage = function() {
	return " ```!log - to log the messages from the chat (REQUIRED BEFORE ANY OTHER COMMANDS) \n!text <username> - randomly generate a sentence that <username> would say\n!link <username> - Sends a link that user has sent in the past ```"
}
