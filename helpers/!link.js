const	fs = require("fs");

function sendLink(client, channel, username, obj) {
    const date = new Date(),
    userID = 0;

    if (!username) {
        channel.sendMessage("```Please specify a user. ```");
        return;
    }

    let id = client.users.find(user => user.username === username);

    if (!id) {
        channel.sendMessage("```User not found.```")
        return;
    } else { id = id.id}

    const randomLink = getLink(id, obj)

    channel.sendMessage(randomLink+ " - " + username + " "+ date.getFullYear())
    .then(message => console.log(`Sent message: ${message.content}`))
    .catch(console.error);
}

function getLink(userID, data) {
	user = '<@' + userID + '>'
	randomLink = data[user][Math.floor(Math.random()*data[user].length)]
    return randomLink;
}

module.exports = sendLink;
