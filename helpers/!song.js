const fs = require("fs");

sendSong = function (channel, obj) {
	const song = obj[Math.floor(Math.random()*obj.length)]
	channel.sendMessage(song)
	.then(message => console.log(`Sent message: ${message.content}`))
	.catch(console.error);
}

module.exports = sendSong;
