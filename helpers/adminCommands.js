const mongoose = require("mongoose");
const channelSchema = require('../schemas/channel.js');
const Channel = mongoose.model("Channel", channelSchema);

function disallowRole(guildChannel, roleName) {
  const query = {channelID: guildChannel.id};
  Channel.findOne(query, function (err, channel) {
    if (err) { throw err }
    if (!channel) {
      guildChannel.sendMessage("```Please !log first```");
    }
    else {
      if (channel.blacklist.indexOf(roleName) === -1) {
        channel.blacklist.push(roleName);
      }
      channel.save(function(err) {
        if (err) throw err;
        guildChannel.sendMessage("```Role does not have permission to use bot.```");
        console.log("Role denied!");
      })
    }
  })
}

function allowRole(guildChannel, roleName) {
  const query = {channelID: guildChannel.id};
  Channel.findOne(query, function (err, channel) {
    if (err) { throw err }
    if (!channel) {
      guildChannel.sendMessage("```Please !log first```");
    }
    else {
      const index = channel.blacklist.indexOf(roleName);
      if (index > -1) {
        channel.blacklist.splice(index, 1);
      }
      channel.save(function(err) {
        if (err) throw err;
        guildChannel.sendMessage("```Role has permission to use bot.```");
        console.log("Role allowed!!");
      })
    }
  })
}

function allowChannel(guildChannel, roleName) {
  const query = {channelID: guildChannel.id};
  Channel.findOne(query, function (err, channel) {
    if (err) { throw err }
    if (!channel) {
      guildChannel.sendMessage("```Please !log first```");
    }
    else {
      if (channel.channels.indexOf(roleName) === -1) {
        channel.channels.push(roleName);
      }
      channel.save(function(err) {
        if (err) throw err;
        guildChannel.sendMessage("```The channel now has permission to use the bot.```");
        console.log("Channel Allowed!");
      })
    }
  })
}

function disallowChannel(guildChannel, roleName) {
  const query = {channelID: guildChannel.id};
  Channel.findOne(query, function (err, channel) {
    if (err) { throw err }
    if (!channel) {
      guildChannel.sendMessage("```Please !log first```");
    }
    else {
      const index = channel.channels.indexOf(roleName);
      if (index > -1) {
        channel.channels.splice(index, 1);
      }
      channel.save(function(err) {
        if (err) throw err;
        guildChannel.sendMessage("```The channel does not have permission to use the bot.```");
        console.log("Channel denied!!");
      })
    }
  })
}

module.exports = {
  allowRole,
  disallowRole,
}
