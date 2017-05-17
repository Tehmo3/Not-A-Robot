var fs = require("fs"),
	exports = module.exports = {},
    Text = require('markov-chains-text').default;

exports.sendText = function (client, channel, username) {
    var date = new Date(),
    userID = 0,
    obj = JSON.parse(fs.readFileSync('data.json', 'utf8'))['messageObject'];

    if (!username) {
        channel.sendMessage("```Please specify a user. ```");
        return;
    }

    var id = client.users.find(user => user.username === username);

    if (!id) {
        channel.sendMessage("```User not found.```")
        return;
    } else { id = id.id}

    var randomSentence = makeChain(id, obj)

    channel.sendMessage(randomSentence+ " - " + username + " "+ date.getFullYear())
    .then(message => console.log(`Sent message: ${message.content}`))
    .catch(console.error);
}

var makeChain = function(user, obj) {
    var randomSentence
	if (user && obj) {
		user = '<@' + user + '>'
		const text = obj[user].join(" ");
		const fakeSentenceGenerator = new Text(text);
		randomSentence = fakeSentenceGenerator.makeSentence();
	}
    return randomSentence
}
