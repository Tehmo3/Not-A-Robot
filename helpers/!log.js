const fs = require("fs");
const mongoose = require("mongoose")
const guildSchema = require('../schemas/guild.js');
const Guild = mongoose.model("Guild", guildSchema);

const channelSchema = require('../schemas/channel.js');
const Channel = mongoose.model("Channel", channelSchema);

logMessages = function(message, client) {
	console.log("reading messages");
  let processed = 0;
  const total = message.guild.channels.array().length;
  message.guild.channels.forEach(function(channel) {
    if (channel.type !== "text") {
      processed++;
      return;
    }
    if (channel.permissionsFor(client.user).has(['READ_MESSAGES', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES'])) {
      console.log("New Channel");
      let data = {linkObject: {}, messageObject: {}, songObject: [], num_messages: 0}
      fetchMoreMessages(channel, null, data, true, function(outputData, err) {
        processed++;
        console.log(processed, channel.id, channel.name);
        saveFile(outputData, message.guild.id, channel.id);
        if (processed === total) {
          message.channel.send("```MESSAGES LOGGED ```");
          console.log("All messages read")
        }
      }); //Lets read some messages!
    }
    else {
      console.log("No perms for", channel.id, channel.name)
      processed++;
      return;
    }
  });
}


function fetchMoreMessages(channel, messageLast, data, cont, callback) {
	if (cont) {
    if (roughSizeOfObject(data) > 15500000) {
      callback(data, 'messageLimit');
    }
		channel.fetchMessages({limit: 100, before:messageLast}) //Read the next 100
		.then(messages => insertMessages(messages, data, channel.guild.id))
		.then(array => fetchMoreMessages(channel, array[0].id, array[2], array[1], callback))
		.catch(console.error)
	}
	else {
		callback(data);
	}
}

function saveFile(data, guildID, channelID) {
  const query = {guildID, channelID};
  Channel.findOne(query, {"guildID":1}, function (err, channel) {
    if (err) throw err
    if (!channel) {
      let newChannel = new Channel({
        guildID,
        channelID,
        messages: data
      })
      newChannel.save(function(err) {
        if (err) throw err;
        Guild.findOne({guildID}, {"guildID":1,"channels":1}, function (err, guild) {
          if (err) throw err
          if (!guild) {
            throw new Error("No Guild!!!");
          }
          guild.channels.push(channelID);
          guild.lastRefresh = new Date();
          guild.save(function(err) {
            if (err) throw err
            console.log("Guild data updated");
          })
        })
        console.log("Data saved for channel", channelID);
      })
    }
    else {
      channel.messages = data;
      channel.save(function(err) {
        if (err) throw err;
        Guild.findOne({guildID}, {"guildID":1,"channels":1}, function (err, guild) {
          if (err) throw err
          if (!guild) {
            throw new Error("No Guild!!!");
          }
          guild.channels.push(channelID);
          guild.lastRefresh = new Date();
          guild.save(function(err) {
            if (err) throw err
            console.log("Guild data updated");
          })
        })
        console.log("Messages updated");
      })
    }
  })
}

function insertMessages(messages, data,channel) {
	const pattern = /^((http|https|ftp):\/\/)/;
	let messageArray = [];
  let last = '';
	messages.forEach(function (message) {
		data.num_messages++;
		// console.log(data.num_messages);
		if (!data.messageObject[message.author]) { data.messageObject[message.author] = [] }
		if (!data.linkObject[message.author]) { data.linkObject[message.author] = [] }
		if (!message.content.startsWith("!")) {
			messageArray = message.content.split(" ");
			messageArray.forEach(function(element) {
                if (element.startsWith('<@') || element.startsWith('@') ) {}
				else if (!pattern.test(element)) {
					data.messageObject[message.author].push([element])
				}
				else if (element.indexOf("spotify.com") > -1 || element.indexOf("soundcloud.com") > -1) {
					data.songObject.push([element])
				}
				else {
					data.linkObject[message.author].push([element])
				}
			})
		}
		last = message;
	});
	if (messages.array().length == 0) {
		return [last, false, data];
	}
	return [last, true, data];
}

function roughSizeOfObject( object ) {

    var objectList = [];
    var stack = [ object ];
    var bytes = 0;

    while ( stack.length ) {
        var value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList.push( value );

            for( var i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return bytes;
}

module.exports = logMessages;
