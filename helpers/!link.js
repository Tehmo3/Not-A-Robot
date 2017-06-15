var	fs = require("fs");

sendLink = function(client, channel, username) {
    var date = new Date(),
    userID = 0,
    obj = JSON.parse(fs.readFileSync('data.json', 'utf8'))['linkObject'];

    if (!username) {
        channel.sendMessage("```Please specify a user. ```");
        return;
    }

    var id = client.users.find(user => user.username === username);

    if (!id) {
        channel.sendMessage("```User not found.```")
        return;
    } else { id = id.id}

    var randomLink = getLink(id, obj)

    channel.sendMessage(randomLink+ " - " + username + " "+ date.getFullYear())
    .then(message => console.log(`Sent message: ${message.content}`))
    .catch(console.error);
}

var getLink = function (userID, data) {
	user = '<@' + userID + '>'
	randomLink = data[user][Math.floor(Math.random()*data[user].length)]
    return randomLink;
}

module.exports = sendLink;
