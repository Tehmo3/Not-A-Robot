const fs = require("fs"),
    Text = require('markov-chains-text').default;

function sendText(client, channel, username) {
    const date = new Date(),
    userID = 0,
    obj = JSON.parse(fs.readFileSync('data.json', 'utf8'))['messageObject'];

    if (!username) {
        channel.sendMessage("```Please specify a user. ```");
        return;
    }

    let id = client.users.find(user => user.username === username);

    if (!id) {
        channel.sendMessage("```User not found.```")
        return;
    } else { id = id.id}

    const randomSentence = makeChain(id, obj)

    channel.sendMessage(randomSentence+ " - " + username + " "+ date.getFullYear())
    .then(message => console.log(`Sent message: ${message.content}`))
    .catch(console.error);
}

function makeChain(user, obj) {
  const settings = {
    tries: 200,
    maxOverlapRatio: 1,
    maxOverlapTotal: 150000
  }
  let randomSentence = '';
	if (user && obj) {
		user = '<@' + user + '>'
		const text = obj[user].join(" ");
		const fakeSentenceGenerator = new Text(text);
		randomSentence = fakeSentenceGenerator.makeSentence(null, settings);
	}
    return randomSentence
}

module.exports = {
  sendText,
  makeChain,
}
