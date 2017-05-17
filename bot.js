var	Discord = require("discord.js"),
	config = require("./config.json"),
	fs = require("fs"),
	logMessages = require("./helpers/log.js").logMessages,
	sendText = require("./helpers/!text.js").sendText,
	sendSong = require("./helpers/!song.js").sendSong,
	sendLink = require("./helpers/!link.js").sendLink;

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
	var validChannels = config.channel.split(" ");
	var messageArray = message.content.split(" ");
	if (validChannels.indexOf(message.channel.name) === -1) {
		console.log("not a valid channel")
		return;
	}
	if (messageArray[0][0] == '!' && message.member.roles.exists("name",config.blacklist)) {
		message.channel.sendMessage("```Sorry. You don't have permission to do that. ```");
		console.log("That user does not have permission for that")
		return;
	}
	if (messageArray[0] === '!log') {
		var admins = config.admins.split(" ")
		if (admins.indexOf(message.author.username) === -1) {
			message.channel.sendMessage("```Sorry. You don't have permission to do that. ```");
			console.log("That user does not have permission for that")
			return;
		}
		message.channel.sendMessage("```Logging messages, this may take a while. ```");
    	logMessages(message)
	}
	if (messageArray[0] === "!text") {
		sendText(client, message.channel, messageArray[1]);
	}
	if (messageArray[0] === "!link") {
		sendLink(client, message.channel, messageArray[1]);
	}
	if (messageArray[0] === "!song") {
		sendSong(message.channel);
	}
	if (messageArray[0] === "!help") {
		console.log("SOMEONE NEEDS MY HELP!");
		message.channel.sendMessage(helpMessage())
	}
})


var helpMessage = function() {
	return " ```!log - to log the messages from the chat (REQUIRED BEFORE ANY OTHER COMMANDS) \n!text <username> - randomly generate a sentence that <username> would say\n!link <username> - Sends a link that user has sent in the past\n!song links a song from spotify or soundcloud that was previously sent in the discord! ```"
}