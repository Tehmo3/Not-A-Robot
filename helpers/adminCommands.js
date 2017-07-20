const mongoose = require("mongoose");
const channelSchema = require('../schemas/channel.js');
const Channel = mongoose.model("Channel", channelSchema);

function disallowRole(guildChannel, roleName) {
  const query = {channelID: guildChannel.guild.id};
  Channel.findOne(query, function (err, channel) {
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
  Channel.findOne(query, function (err, channel) {
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

function switchChannel(guildChannel, roleName) {
  const query = {channelID: guildChannel.guild.id};
  Channel.findOne(query, function (err, channel) {
    if (err) { throw err }
    if (!channel) {
      guildChannel.channel.sendMessage("```Please !log first```");
    }
    else {
      channel.channels = [roleName];
      channel.save(function(err) {
        if (err) throw err;
        guildChannel.channel.sendMessage("```The channel now has permission to use the bot.```");
        console.log("Channel Allowed!");
      })
    }
  })
}


module.exports = {
  allowRole,
  disallowRole,
  switchChannel,
}
