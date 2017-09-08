const throng = require('throng');

const WORKERS = process.env.WEB_CONCURRENCY || 1;

function start() {
  const Discord = require('discord.js');
  const express = require('express');
  const path = require('path');
  const mongoose = require('mongoose');
  const merge = require('lodash.merge');
  const logMessages = require('./helpers/log.js');
  const sendText = require('./helpers/text.js').sendText;
  const sendSong = require('./helpers/song.js');
  const sendLink = require('./helpers/link.js');
  const sendAdvice = require('./helpers/advice.js');
  const startQuiz = require('./helpers/quiz.js').startQuiz;
  const checkAnswer = require('./helpers/quiz.js').checkAnswer;
  const sendLeaderboards = require('./helpers/quiz.js').sendLeaderboards;
  const adminCommands = require('./helpers/adminCommands.js');
  const port = process.env.PORT || 5000;


  // Routes/Express stuff
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

  // MongoDB/Mongoose stuff
  mongoose.connect(process.env.MONGODB_URI);
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error: %s', err);
  });

  // Helper Functions

  function getIfAdmin(userID, guild) {
    const members = guild.members.find(member => member.id === userID);
    return members.hasPermission('MANAGE_MESSAGES');
  }

  function msToTime(ms) {
    let s = Math.floor(ms / 1000);
    let m = Math.floor(s / 60);
    s %= 60;
    let h = Math.floor(m / 60);
    m %= 60;
    const d = Math.floor(h / 24);
    h %= 24;
    return `${d} Days, ${h} Hours, ${m} Minutes.`;
  }


  function helpMessage() {
    return ' ```!text <username/nickname> - randomly generate a sentence that <username> would say\n!link <username/nickname> - Sends a link that user has sent in the past\n!song links a song from spotify or soundcloud that was previously sent in the discord!\n!whosaidthat - Starts a quiz! The bot will send a message and you have to try and guess who sent it!\n!wholinkedthat - Starts a quiz! The bot will send a link and you have to try and guess who sent it! \n!answer <username/nickname> guesses an answer to the ongoing quiz! This will count towards both quizzes if both are going! \n!leaderboards - Show the 5 people who have gotten the most quiz questions correct! \n!advice - Sends a piece of worthwile life advice! Generated via http://inspirobot.me \n!adminCommands - Are you an admin? Have a look at what you can do using this command! \n```Want this bot on your server? Check out http://www.not-a-bot.com/ \n(Wanna know something real cool? You can donate at that link too <3)';
  }

  function newServerMessage() {
    return `Hmmm, somewhere new!\n ${helpMessage}`;
  }

  function adminHelp() {
    return '```!log - to log the messages from the chat (REQUIRED BEFORE ANY OTHER COMMANDS). Note: this command can only be used once per week \n!disallowRole <role> - Disallow all users with the role <role> from using the bot\n!allowRole <role> - Allows all users with the role <role> to use the bot. (Note this will only doing anything if the role has previously been excluded via !disallowRole)\n!allowChannel <channel> - allow <channel> to call the bot.\n!disallowChannel <channel> - disallow <channel> to call the bot.```';
  }

  const guildSchema = require('./schemas/guild.js');
  const Guild = mongoose.model('Guild', guildSchema);

  const channelSchema = require('./schemas/channel.js');
  const Channel = mongoose.model('Channel', channelSchema);


  const client = new Discord.Client();
  client.login(process.env.token, (error) => {
    if (error) {
      console.log('There was an error!');
      return;
    }
    console.log('Logged in! (I hope this prints)');
  });

  client.on('guildCreate', (guild) => {
    guild.defaultChannel.send(newServerMessage());
  });

  client.on('message', (message) => {
    if (!message || !message.guild) {
      return;
    }
    const messageArray = message.content.split(' ');
    if (messageArray[0][0] === '!') {
      const query = { guildID: message.guild.id };
      Guild.findOne(query, (err, guild) => {
        if (err) { throw err; }
        if (!guild) {
          const newGuild = new Guild({
            guildID: message.guild.id,
            allowedChannels: [message.channel.name],
            channels: [null],
            blacklist: [null],
            refreshRate: 600000000,
            lastRefresh: null,
            leaderboards: {}
          });
          newGuild.save((error) => {
            if (error) throw error;
            console.log('data saved for Guild', message.guild.id);
            message.channel.send('```Sorry about that.. Call !log now please!```');
          });
        }
        else if (!guild.leaderboards) {
          guild.leaderboards = {};
          guild.save((error) => {
            if (error) throw error;
            console.log('leaderboards');
          });
          return;
        }
        else {
          // Check if user has a blacklisted role
          if (message.member.roles.find(role => guild.blacklist.indexOf(role.name) !== -1)) {
            message.channel.send('```Sorry. You don\'t have permission to do that. ```');
            console.log('That user does not have permission for that');
            return;
          }
          // Check if the channel is allowed
          else if (guild.allowedChannels.indexOf(message.channel.name) === -1) {
            message.channel.send('```Sorry, this channel does not have permission to use the bot!```');
            console.log('not a valid channel');
            return;
          }
          else if (messageArray[0] === '!log') {
            if (!getIfAdmin(message.author.id, message.guild)) {
              message.channel.send('```Sorry. You don\'t have permission to do that. ```');
              console.log('That user does not have permission for that');
              return;
            }
            const now = new Date();
            const timeDiff = guild.lastRefresh ? Math.abs(now.getTime() - guild.lastRefresh.getTime()) : null;
            if (!guild.lastRefresh || timeDiff > guild.refreshRate) {
              message.channel.send('```Logging messages, this may take a while. ```');
              logMessages(message, client);
            }
            else {
              console.log(guild.refreshRate, timeDiff);
              const time = msToTime(guild.refreshRate - timeDiff);
              message.channel.send(`Sorry. It hasn't been one week since your last !log. You can log again in ${time}.`);
              console.log('Cant log too quick!');
              return;
            }
          }
          else if (messageArray[0] === '!advice') {
            sendAdvice(message.channel);
            return;
          }
          else if (messageArray[0] === '!help') {
            message.author.send(helpMessage());
            return;
          }
          else if (messageArray[0] === '!adminCommands') {
            message.author.send(adminHelp());
            return;
          }
          else if (messageArray[0] === '!disallowRole') {
            adminCommands.disallowRole(message, messageArray.slice(1));
            return;
          }
          else if (messageArray[0] === '!allowRole') {
            adminCommands.allowRole(message, messageArray.slice(1));
            return;
          }
          else if (messageArray[0] === '!allowChannel') {
            if (!getIfAdmin(message.author.id, message.guild)) {
              message.channel.send('```Sorry. You don\'t have permission to do that. ```');
              console.log('That user does not have permission for that');
              return;
            }
            adminCommands.allowChannel(message, messageArray.slice(1));
            return;
          }
          else if (messageArray[0] === '!disallowChannel') {
            if (!getIfAdmin(message.author.id, message.guild)) {
              message.channel.send('```Sorry. You don\'t have permission to do that. ```');
              console.log('That user does not have permission for that');
              return;
            }
            adminCommands.disallowChannel(message, messageArray.slice(1));
            return;
          }
          else if (messageArray[0] === '!answer') {
            const sliced = messageArray.slice(1);
            checkAnswer(client, sliced.join(' '), message.channel, message.guild.id, message.member.displayName);
            return;
          }
          else if (messageArray[0] === "!leaderboards") {
            sendLeaderboards(client, message.channel, guild.leaderboards);
            return;
          }
          else {
            const channelQuery = { guildID: message.guild.id, channelID: message.channel.id };
            Channel.find(channelQuery, (error, channels) => {
              if (error) throw error;
              if (typeof channels === 'undefined' || channels.length === 0) {
                message.channel.send('There\'s no data for this channel!');
                return;
              }
              const channel = merge(channels[0], channels.shift());
              if (messageArray[0] === '!text') {
                sendText(client, message.channel, messageArray.slice(1).join(' '), channel.messages.messageObject);
                return;
              }
              else if (messageArray[0] === '!link') {
                sendLink(client, message.channel, messageArray.slice(1).join(' '), channel.messages.linkObject);
                return;
              }
              else if (messageArray[0] === '!song') {
                sendSong(message.channel, channel.messages.songObject);
                return;
              }
              else if (messageArray[0] === '!whosaidthat') {
                startQuiz(client, 'text', channel.messages, message.guild.id, message.channel);
                return;
              }
              else if (messageArray[0] === '!wholinkedthat') {
                startQuiz(client, 'link', channel.messages, message.guild.id, message.channel);
                return;
              }
            });
          }
        }
      });
    }
  });
}


throng({
  workers: WORKERS,
  lifetime: Infinity,
}, start);
