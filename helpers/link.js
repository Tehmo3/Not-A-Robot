const	fs = require("fs");
const getID = require("./text.js").getID;

function sendLink(client, channel, username, obj) {
    const date = new Date(),
    userID = 0;

    if (!username) {
        channel.send("```Please specify a user. ```");
        return;
    }

    let id = getID(client, channel, username);
    if (id === null) {
      return;
    }

    const randomLink = getLink(id, obj)

    channel.send(randomLink+ " - " + username + " "+ date.getFullYear())
    .then(message => console.log(`Sent message: ${message.content}`))
    .catch(console.error);
}

function getLink(userID, data) {
	user = '<@' + userID + '>'
	randomLink = data[user][Math.floor(Math.random()*data[user].length)]
    return randomLink;
}

module.exports = sendLink;
