const mongoose = require("mongoose");
const guildSchema = require('../schemas/guild.js');
const Guild = mongoose.model("Guild", guildSchema);

function disallowRole(guildChannel, roleName) {
  const query = {guildID: guildChannel.guild.id};
  Guild.findOne(query, {'blacklist': 1} ,function (err, guild) {
    if (err) { throw err }
    if (!guild) {
      guildChannel.channel.send("```Please !log first```");
    }
    else {
      if (guild.blacklist.indexOf(roleName) === -1) {
        guild.blacklist.push(roleName);
      }
      guild.save(function(err) {
        if (err) throw err;
        guildChannel.channel.send("```Role does not have permission to use bot.```");
        console.log("Role denied!");
      })
    }
  })
}

function allowRole(guildChannel, roleName) {
  const query = {guildID: guildChannel.guild.id};
  Guild.findOne(query, {'blacklist': 1}, function (err, guild) {
    if (err) { throw err }
    if (!guild) {
      guildChannel.channel.send("```Please !log first```");
    }
    else {
      const index = guild.blacklist.indexOf(roleName);
      if (index > -1) {
        guild.blacklist.splice(index, 1);
      }
      guild.save(function(err) {
        if (err) throw err;
        guildChannel.channel.send("```Role has permission to use bot.```");
        console.log("Role allowed!!");
      })
    }
  })
}

function allowChannel(guildChannel, roleName) {
  const query = {guildID: guildChannel.guild.id};
  Guild.findOne(query, {'allowedChannels': 1}, function (err, guild) {
    if (err) { throw err }
    if (!guild) {
      guildChannel.channel.send("```Please !log first```");
    }
    else {
      if (guild.allowedChannels.indexOf(roleName) === -1) {
        guild.allowedChannels.push(roleName);
      }
      guild.save(function(err) {
        if (err) throw err;
        guildChannel.channel.send("```Channel may now use the bot!```");
        console.log("Channel allowed");
      })
    }
  })
}

function disallowChannel(guildChannel, roleName) {
  const query = {guildID: guildChannel.guild.id};
  Guild.findOne(query, {'allowedChannels': 1}, function (err, guild) {
    if (err) { throw err }
    if (!guild) {
      guildChannel.channel.send("```Please !log first```");
    }
    else {
      const index = guild.allowedChannels.indexOf(roleName);
      if (index > -1 && guild.allowedChannels.length > 1) {
        guild.allowedChannels.splice(index, 1);
      }
      guild.save(function(err) {
        if (err) throw err;
        guildChannel.channel.send("```Channel may no longer use the bot!```");
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
