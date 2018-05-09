const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const SECRETS = require('./secrets.js');
const mongoose = require('mongoose');
const express = require('express');

const client = new CommandoClient({
  commandPrefix: '$',
  owner: "124827035838316544",
  disableEveryone: true
})

const app = express();
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '/home.html'), null, (err) => {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent homepage');
    }
  });
});
app.listen(port);

mongoose.connect(SECRETS.mongodbURI);

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error: %s', err);
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['setupcommands', 'A set of commands to handle the set up of the bot'],
    ['impersonatecommands', 'A set of commands based on impersonating your friends'],
    ['quizcommands', 'A set of commands for running and answering quizzes']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands()
  .registerCommandsIn(path.join(__dirname, 'commands'));


client.on('ready', () => {
  console.log('Logged in!');
  client.user.setActivity('game');
});

// client.on('guildCreate', (guild) => {
//   guild.defaultChannel.send(newServerMessage());
// });

client.login(SECRETS.appBotUserToken);
