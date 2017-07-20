const mongoose = require("mongoose"),
const channelSchema = require('../schemas/channel.js');
const Channel = mongoose.model("Channel", channelSchema);

function disallowRole(channel, roleName) {
  const query = {channelID: channel.id};
  Channel.findOne(query, function (err, channel) {
    if (err) { throw err }
    if (!channel) {
      channel.sendMessage("```Please !log first```");
    }
    else {
      if (channel.channels.indexOf(roleName) === -1) {
        channel.channels.push(roleName);
      }
      channel.save(function(err) {
        if (err) throw err;
        channel.sendMessage("```Role does not have permission to use bot.```");
        console.log("Role denied!");
      })
    }
  })
}

function allowRole(channel, roleName) {
  const query = {channelID: channel.id};
  Channel.findOne(query, function (err, channel) {
    if (err) { throw err }
    if (!channel) {
      channel.sendMessage("```Please !log first```");
    }
    else {
      const index = channel.channels.indexOf(roleName);
      if (index > -1) {
        channel.channels.splice(index, 1);
      }
      channel.save(function(err) {
        if (err) throw err;
        channel.sendMessage("```Role has permission to use bot.```");
        console.log("Role allowed!!");
      })
    }
  })
}

module.exports = {
  allowRole,
  disallowRole,
}
