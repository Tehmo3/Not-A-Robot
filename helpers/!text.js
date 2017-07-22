const fs = require("fs"),
    Text = require('markov-chains-text').default;

function sendText(client, channel, username, obj) {
    const date = new Date(),
    userID = 0;

    if (!username) {
        channel.send("```Please specify a user. ```");
        return;
    }

    const id = getID(client, channel, username);
    if (id === null) {
      return;
    }

    const randomSentence = makeChain(id, obj)

    channel.send(randomSentence+ " - " + username + " "+ date.getFullYear())
    .then(message => console.log(`Sent message: ${message.content}`))
    .catch(console.error);
}

function getID(client, channel, username) {
  let id = client.users.find(user => user.username === username);
  if (!id) {
    id = channel.guild.members.find(member => member.displayName === username);
    if (!id) {
      channel.send("```User not found.```");
      return null;
    }
    else {
      id = id.id;
    }
  }
  else {
    id = id.id;
  }
  return id;
}

function makeChain(user, obj) {
  const settings = {
    tries: 200,
    maxOverlapRatio: 1,
    maxOverlapTotal: 150000,
    maxChars: 1999
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
  getID,
}
