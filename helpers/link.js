const getID = require('./text.js').getID;

function sendLink(client, channel, username, obj) {
  const date = new Date();

  if (!username) {
    channel.send('```Please specify a user. ```');
    return;
  }

  const id = getID(client, channel, username);
  if (id === null) {
    return;
  }

  const randomLink = getLink(id, obj);
  channel.send(`${randomLink} - ${username} ${date.getFullYear()}`)
    .then(message => console.log(`Sent message: ${message.content}`))
    .catch(console.error);
}

function getLink(userID, data) {
  const user = `<@${userID}>`;
  const randomLink = data[user][Math.floor(Math.random() * data[user].length)];
  return randomLink;
}

module.exports = sendLink;
