var throng = require('throng');
const WORKERS = process.env.WEB_CONCURRENCY || 1;

throng({
  workers: WORKERS,
  lifetime: Infinity
}, start);

function start() {

  const	Discord = require("discord.js"),
  express = require("express"),
  path = require("path"),
  fs = require("fs"),
  mongoose = require('mongoose'),
  merge = require("lodash.merge"),
  logMessages = require("./helpers/!log.js"),
  sendText = require("./helpers/!text.js").sendText,
  sendSong = require("./helpers/!song.js"),
  sendLink = require("./helpers/!link.js"),
  sendAdvice = require("./helpers/!advice.js"),
  startQuiz = require('./helpers/quiz.js').startQuiz,
  checkAnswer = require('./helpers/quiz.js').checkAnswer,
  adminCommands = require('./helpers/adminCommands.js'),
  port = process.env.PORT || 5000;


  // Routes/Express stuff
  let app = express();
  app.use(express.static(__dirname + '/public'));
  app.get("/", function(req, res) {
    res.sendFile( path.join( __dirname, "public" , '/home.html' ));
  });
  app.listen(port);

  //MongoDB/Mongoose stuff
  mongoose.connect(process.env.MONGODB_URI);
  mongoose.connection.on('error', function(err) {
    console.error('MongoDB error: %s', err);
  });

  const guildSchema = require('./schemas/guild.js');
  const Guild = mongoose.model("Guild", guildSchema);

  const channelSchema = require('./schemas/channel.js');
  const Channel = mongoose.model("Channel", channelSchema);


  const client = new Discord.Client();
  client.login(process.env.token, output);

  function output(error, token) {
    if (error) {
      console.log("There was an error!");
      return;
    }
    else {
      console.log("Logged in!");
    }
  }

  client.on('guildCreate', guild => {
    guild.defaultChannel.send(newServerMessage())
  });

  client.on('message', message => {
    if (!message || !message.guild) {
      return;
    }
    const messageArray = message.content.split(" ");
    if (messageArray[0][0] == '!') {
      const query = {guildID: message.guild.id}
      const messagesString = "messages."+message.channel.id
      let whatFields = {"guildID":1, "allowedChannels":1,"blacklist":1,textQuiz:1,linkQuiz:1,lastRefresh:1,refreshRate:1}
      whatFields[messagesString] = 1;
      Guild.findOne(query, whatFields, function(err, guild) {
        if (err) { throw err }
        if (!guild) {
          var newGuild = new Guild({
            guildID: message.guild.id,
            allowedChannels: [message.channel.name],
            channels: [null],
            blacklist: [null],
            refreshRate: 600000000,
            lastRefresh: null
          });
          newGuild.save(function (err) {
            if (err) throw err;
            console.log("data saved for Guild", message.guild.id);
            message.channel.send("```Sorry about that.. Call !log now please!```");
          })
        }
        else {
          if (message.member.roles.find(role => guild.blacklist.indexOf(role.name) !== -1)) { //Check if user has a blacklisted role
            message.channel.send("```Sorry. You don't have permission to do that. ```");
            console.log("That user does not have permission for that");
            return;
          }
          else if(guild.allowedChannels.indexOf(message.channel.name) === -1) { //Check if the channel is allowed
            message.channel.send("```Sorry, this channel does not have permission to use the bot!```");
            console.log("not a valid channel")
            return;
          }
          else if (messageArray[0] === '!log') {
            if (!getIfAdmin(message.author.id, message.guild)) {
              message.channel.send("```Sorry. You don't have permission to do that. ```");
              console.log("That user does not have permission for that")
              return;
            }
            let now = new Date();
            if (!guild.lastRefresh || Math.abs(now.getTime() - guild.lastRefresh.getTime()) > guild.refreshRate) {
              message.channel.send("```Logging messages, this may take a while. ```");
              logMessages(message, client)
            }
            else {
              console.log(guild.refreshRate, Math.abs(now.getTime() - guild.lastRefresh.getTime()))
              var time = msToTime(guild.refreshRate - Math.abs(now.getTime() - guild.lastRefresh.getTime()));
              message.channel.send(`Sorry. It hasn't been one week since your last !log. You can log again in ${time}.`);
              console.log("Cant log too quick!")
            }
          }
          else if (messageArray[0] === "!advice") {
            sendAdvice(message.channel);
          }
          else if (messageArray[0] === "!help") {
            message.author.send(helpMessage());
          }
          else if (messageArray[0] === "!adminCommands") {
            message.author.send(adminHelp());
          }
          else if (messageArray[0] === "!disallowRole") {
            adminCommands.disallowRole(message, messageArray.slice(1));
          }
          else if (messageArray[0] === "!allowRole") {
            adminCommands.allowRole(message, messageArray.slice(1));
          }
          else if (messageArray[0] === "!allowChannel") {
            if (!getIfAdmin(message.author.id, message.guild)) {
              message.channel.send("```Sorry. You don't have permission to do that. ```");
              console.log("That user does not have permission for that")
              return;
            }
            adminCommands.allowChannel(message, messageArray.slice(1));
          }
          else if (messageArray[0] === "!disallowChannel") {
            if (!getIfAdmin(message.author.id, message.guild)) {
              message.channel.send("```Sorry. You don't have permission to do that. ```");
              console.log("That user does not have permission for that")
              return;
            }
            adminCommands.disallowChannel(message, messageArray.slice(1));
          }
          else if (messageArray[0] === '!answer') {
            let sliced = messageArray.slice(1)
            checkAnswer(client, sliced.join(" "), message.channel, message.guild.id, message.member.displayName)
          }
          else {
            Channel.find({guildID: message.guild.id, channelID: message.channel.id}, function(err, channels) {
              if (err) throw err;
              console.log(channels);
              if (!channels || channels.length === 0) {
                message.channel.send(`There's no data for this channel!`);
              }
              let channel = merge(channels[0], channels.shift());
              if (messageArray[0] === "!text") {
                sendText(client, message.channel, messageArray.slice(1).join(" "), channel.messages.messageObject);
              }
              else if (messageArray[0] === "!link") {
                sendLink(client, message.channel, messageArray.slice(1).join(" "), channel.messages.linkObject);
              }
              else if (messageArray[0] === "!song") {
                sendSong(message.channel, channel.messages.songObject);
              }
              else if (messageArray[0] === "!whosaidthat") {
                startQuiz(client, 'text', channel.messages, message.guild.id, message.channel);
              }
              else if(messageArray[0] === "!wholinkedthat") {
                startQuiz(client, 'link', channel.messages, message.guild.id, message.channel);
              }
            })
          }
        }
      })
    }
  })

  function getIfAdmin(userID, guild) {
    const members = guild.members.find(member => member.id === userID)
    return members.hasPermission('MANAGE_MESSAGES');
  }

  function msToTime(ms) {
    var d, h, m, s;
    s = Math.floor(ms / 1000);
    m = Math.floor(s / 60);
    s = s % 60;
    h = Math.floor(m / 60);
    m = m % 60;
    d = Math.floor(h / 24);
    h = h % 24;
    return d + " Days, " + h + " Hours, " + m + " Minutes."
  }

  function newServerMessage() {
    return 'Hmmm, somewhere new!\n' + helpMessage()
  }

  function helpMessage() {
    return " ```!text <username/nickname> - randomly generate a sentence that <username> would say\n!link <username/nickname> - Sends a link that user has sent in the past\n!song links a song from spotify or soundcloud that was previously sent in the discord!\n!whosaidthat - Starts a quiz! The bot will send a message and you have to try and guess who sent it!\n!wholinkedthat - Starts a quiz! The bot will send a link and you have to try and guess who sent it! \n!answer <username/nickname> guesses an answer to the ongoing quiz! This will count towards both quizzes if both are going! \n!advice - Sends a piece of worthwile life advice! Generated via http://inspirobot.me \n!adminCommands - Are you an admin? Have a look at what you can do using this command! \n```Want this bot on your server? Check out http://www.not-a-bot.com/ \n(Wanna know something real cool? You can donate at that link too <3)"
  }

  function adminHelp() {
    return "```!log - to log the messages from the chat (REQUIRED BEFORE ANY OTHER COMMANDS). Note: this command can only be used once per week \n!disallowRole <role> - Disallow all users with the role <role> from using the bot\n!allowRole <role> - Allows all users with the role <role> to use the bot. (Note this will only doing anything if the role has previously been excluded via !disallowRole)\n!allowChannel <channel> - allow <channel> to call the bot.\n!disallowChannel <channel> - disallow <channel> to call the bot.```"
  }
}
