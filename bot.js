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
let currQuiz = null;

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
  console.log(members);
  return members.hasPermission('MANAGE_MESSAGES');
}


client.on('message', message => {
	const validChannels = [process.env.channel];
	const messageArray = message.content.split(" ");
	if (messageArray[0][0] == '!') {
    const query = {channelID: message.channel.id}
    Channel.findOne(query, function(err, channel) {
      if (err) { throw err }
      if (!channel) {
        var newChannel = new Channel({
          channelID: message.channel.id,
          channels: ['general'],
          blacklist: ['Normies'],
          messages: null
        });
        newChannel.save(function (err) {
          if (err) throw err;
          console.log("data saved for channel", message.channel.id);
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
          console.log("not a valid channel")
          return;
        }
        if (messageArray[0] === '!log') {
          if (!getIfAdmin(message.author.id, message.guild)) {
            message.channel.sendMessage("```Sorry. You don't have permission to do that. ```");
            console.log("That user does not have permission for that")
            return;
          }
          message.channel.sendMessage("```Logging messages, this may take a while. ```");
          logMessages(message)
        }
        if (messageArray[0] === "!text") {
          sendText(client, message.channel, messageArray.slice(1).join(" "), channel.messages.messageObject);
        }
        if (messageArray[0] === "!link") {
          sendLink(client, message.channel, messageArray.slice(1).join(" "), channel.messages.linkObject);
        }
        if (messageArray[0] === "!song") {
          sendSong(message.channel, channel.messages.songObject);
        }
        if (messageArray[0] === "!advice") {
          sendAdvice(message.channel);
        }
        if (messageArray[0] === "!help") {
          console.log("SOMEONE NEEDS MY HELP!");
          message.channel.sendMessage(helpMessage())
        }
        if (messageArray[0] === "!disallowRole") {
          adminCommands.disallowRole(message.channel, messageArray.slice(1));
        }
        if (messageArray[0] === "!allowRole") {
          adminCommands.allowRole(message.channel, messageArray.slice(1));
        }
        if (messageArray[0] === "!whosaidthat") {
          currQuiz = startQuiz(client, 'text', channel.messages);
          console.log(currQuiz);
          message.channel.sendMessage(currQuiz.question);
        }
        if(messageArray[0] === "!wholinkedthat") {
          currQuiz = startQuiz(client, 'link', channel.messages);
          console.log(currQuiz);
          message.channel.sendMessage(currQuiz.question);
        }
        else if (currQuiz !== null && messageArray[0] === '!answer'){
          let sliced = messageArray.slice(1)
          currQuiz = checkAnswer(currQuiz, sliced.join(" "), message.channel);
        }
      }
    })
  }
})


function helpMessage() {
	return " ```!log - to log the messages from the chat (REQUIRED BEFORE ANY OTHER COMMANDS) \n!text <username> - randomly generate a sentence that <username> would say\n!link <username> - Sends a link that user has sent in the past\n!song links a song from spotify or soundcloud that was previously sent in the discord!\n!whosaidthat - Starts a quiz! The bot will send a message and you have to try and guess who sent it!\n!wholinkedthat - Starts a quiz! The bot will send a link and you have to try and guess who sent it! \n!advice - Sends a piece of worthwile life advice! Generated via http://inspirobot.me ```"
}
