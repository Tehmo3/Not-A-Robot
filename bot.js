const	Discord = require("discord.js"),
  express = require("express"),
  path = require("path"),
	fs = require("fs"),
  mongoose = require('mongoose'),
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
var channelSchema = require('./schemas/channel.js');
var Channel = mongoose.model("Channel", channelSchema);


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

function getIfAdmin(userID, guild) {
  const members = guild.members.find(member => member.id === userID)
  return members.hasPermission('MANAGE_MESSAGES');
}

client.on('guildCreate', guild => {
  guild.defaultChannel.sendMessage(newServerMessage())
});

client.on('message', message => {
	const messageArray = message.content.split(" ");
	if (messageArray[0][0] == '!') {
    const query = {channelID: message.guild.id}
    Channel.findOne(query, function(err, channel) {
      if (err) { throw err }
      if (!channel) {
        var newChannel = new Channel({
          channelID: message.guild.id,
          channels: [message.channel.name],
          blacklist: ['Normies'],
          messages: null,
          refreshRate: 600000000,
          lastRefresh: null
        });
        newChannel.save(function (err) {
          if (err) throw err;
          console.log("data saved for channel", message.guild.id);
          message.channel.send("```Sorry about that.. Call !log now please!```");
        })
      }
      else {
        if (message.member.roles.find(role => channel.blacklist.indexOf(role.name) !== -1)) {
          message.channel.sendMessage("```Sorry. You don't have permission to do that. ```");
          console.log("That user does not have permission for that");
          return;
        }
        else if(channel.channels.indexOf(message.channel.name) === -1) {
          message.channel.sendMessage("```Sorry, this channel does not have permission to use the bot!```");
          console.log("not a valid channel")
          return;
        }
        if (messageArray[0] === '!log') {
          if (!getIfAdmin(message.author.id, message.guild)) {
            message.channel.sendMessage("```Sorry. You don't have permission to do that. ```");
            console.log("That user does not have permission for that")
            return;
          }
          let now = new Date();
          if (!channel.lastRefresh || Math.abs(now.getTime() - channel.lastRefresh.getTime()) > channel.refreshRate) {
            message.channel.sendMessage("```Logging messages, this may take a while. ```");
            logMessages(message)
          }
          else {
            var time = msToTime(Math.abs(now.getTime() - channel.lastRefresh.getTime()));
            message.channel.sendMessage(`````Sorry. It hasn't been one week since your last !log. You can log again in ${time}. `````);
            console.log("Cant log too quick!")
          }
        }
        if (messageArray[0] === "!text") {
          sendText(client, message.channel, messageArray.slice(1).join(" "), channel.messages[message.channel.id].messageObject);
        }
        if (messageArray[0] === "!link") {
          sendLink(client, message.channel, messageArray.slice(1).join(" "), channel.messages[message.channel.id].linkObject);
        }
        if (messageArray[0] === "!song") {
          sendSong(message.channel, channel.messages[message.channel.id].songObject);
        }
        if (messageArray[0] === "!advice") {
          sendAdvice(message.channel);
        }
        if (messageArray[0] === "!help") {
          message.author.sendMessage(helpMessage());
        }
        if (messageArray[0] === "!adminCommands") {
          message.author.sendMessage(adminHelp());
        }
        if (messageArray[0] === "!disallowRole") {
          adminCommands.disallowRole(message, messageArray.slice(1));
        }
        if (messageArray[0] === "!allowRole") {
          adminCommands.allowRole(message, messageArray.slice(1));
        }
        if (messageArray[0] === "!allowChannel") {
          if (!getIfAdmin(message.author.id, message.guild)) {
            message.channel.sendMessage("```Sorry. You don't have permission to do that. ```");
            console.log("That user does not have permission for that")
            return;
          }
          adminCommands.allowChannel(message, messageArray.slice(1));
        }
        if (messageArray[0] === "!disallowChannel") {
          if (!getIfAdmin(message.author.id, message.guild)) {
            message.channel.sendMessage("```Sorry. You don't have permission to do that. ```");
            console.log("That user does not have permission for that")
            return;
          }
          adminCommands.disallowChannel(message, messageArray.slice(1));
        }
        if (messageArray[0] === "!whosaidthat") {
          startQuiz(client, 'text', channel.messages[message.channel.id], message.guild.id, message.channel);
        }
        if(messageArray[0] === "!wholinkedthat") {
          startQuiz(client, 'link', channel.messages[message.channel.id],message.guild.id, message.channel);
        }
        else if (messageArray[0] === '!answer'){
          let sliced = messageArray.slice(1)
          checkAnswer(client, sliced.join(" "), message.channel, message.guild.id, message.member.displayName)
        }
      }
    })
  }
})

function msToTime(ms) {
  var x = ms/1000;
  var seconds = Math.floor(x%60);
  x /= 60;
  var minutes = Math.floor(x%60);
  x /=60;
  var hours = Math.floor(x%24)
  x /=24;
  var days = Math.floor(x);
  return days + " Days, " + hours + " Hours, " + minutes + " Minutes."
}

function newServerMessage() {
  return 'Hmmm, somewhere new!\n' + helpMessage()
}

function helpMessage() {
return " ```!text <username/nickname> - randomly generate a sentence that <username> would say\n!link <username/nickname> - Sends a link that user has sent in the past\n!song links a song from spotify or soundcloud that was previously sent in the discord!\n!whosaidthat - Starts a quiz! The bot will send a message and you have to try and guess who sent it!\n!wholinkedthat - Starts a quiz! The bot will send a link and you have to try and guess who sent it! \n!answer <username/nickname> guesses an answer to the ongoing quiz! This will count towards both quizzes if both are going! \n!advice - Sends a piece of worthwile life advice! Generated via http://inspirobot.me \n!adminCommands - Are you an admin? Have a look at what you can do using this command! \n```Want this bot on your server? Check out http://www.not-a-bot.com/"
}

function adminHelp() {
  return "```!log - to log the messages from the chat (REQUIRED BEFORE ANY OTHER COMMANDS). Note: this command can only be used once per week \n!disallowRole <role> - Disallow all users with the role <role> from using the bot\n!allowRole <role> - Allows all users with the role <role> to use the bot. (Note this will only doing anything if the role has previously been excluded via !disallowRole)\n!allowChannel <channel> - allow <channel> to call the bot.\n!disallowChannel <channel> - disallow <channel> to call the bot.```"
}
