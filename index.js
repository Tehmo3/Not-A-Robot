const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const SECRETS = require('./secrets.js');
const mongoose = require('mongoose');

const client = new CommandoClient({
  commandPrefix: '$',
  owner: "124827035838316544",
  disableEveryone: true
})


mongoose.connect(SECRETS.mongodbURI);

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error: %s', err);
});

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['logcommands', 'A set of commands to handle the logging of messages'],
        ['textcommands', 'A set of commands based on markov chains around text']
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
