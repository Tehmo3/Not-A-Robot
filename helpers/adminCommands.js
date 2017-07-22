const mongoose = require("mongoose");
const channelSchema = require('../schemas/channel.js');
const Channel = mongoose.model("Channel", channelSchema);

function disallowRole(guildChannel, roleName) {
  const query = {channelID: guildChannel.guild.id};
  Channel.findOne(query, {'blacklist': 1} ,function (err, channel) {
    if (err) { throw err }
    if (!channel) {
      guildChannel.channel.sendMessage("```Please !log first```");
    }
    else {
      if (channel.blacklist.indexOf(roleName) === -1) {
        channel.blacklist.push(roleName);
      }
      channel.save(function(err) {
        if (err) throw err;
        guildChannel.channel.sendMessage("```Role does not have permission to use bot.```");
        console.log("Role denied!");
      })
    }
  })
}

function allowRole(guildChannel, roleName) {
  const query = {channelID: guildChannel.guild.id};
  Channel.findOne(query, {'blacklist': 1}, function (err, channel) {
    if (err) { throw err }
    if (!channel) {
      guildChannel.channel.sendMessage("```Please !log first```");
    }
    else {
      const index = channel.blacklist.indexOf(roleName);
      if (index > -1) {
        channel.blacklist.splice(index, 1);
      }
      channel.save(function(err) {
        if (err) throw err;
        guildChannel.channel.sendMessage("```Role has permission to use bot.```");
        console.log("Role allowed!!");
      })
    }
  })
}

function allowChannel(guildChannel, roleName) {
  const query = {channelID: guildChannel.guild.id};
  Channel.findOne(query, {'channels': 1} function (err, channel) {
    if (err) { throw err }
    if (!channel) {
      guildChannel.channel.sendMessage("```Please !log first```");
    }
    else {
      if (channel.channels.indexOf(roleName) === -1) {
        channel.channels.push(roleName);
      }
      channel.save(function(err) {
        if (err) throw err;
        guildChannel.channel.sendMessage("```Channel may now use the bot!```");
        console.log("Channel allowed");
      })
    }
  })
}

function disallowChannel(guildChannel, roleName) {
  const query = {channelID: guildChannel.guild.id};
  Channel.findOne(query, {'channels': 1}, function (err, channel) {
    if (err) { throw err }
    if (!channel) {
      guildChannel.channel.sendMessage("```Please !log first```");
    }
    else {
      const index = channel.channels.indexOf(roleName);
      if (index > -1 && channel.channels.length > 1) {
        channel.channels.splice(index, 1);
      }
      channel.save(function(err) {
        if (err) throw err;
        guildChannel.channel.sendMessage("```Channel may no longer use the bot!```");
        console.log("Channel disallowed");
      })
    }
  })
}


module.exports = {
  allowRole,
  disallowRole,
  allowChannel,
  disallowChannel,
}
