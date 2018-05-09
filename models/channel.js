const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const channelSchema = new Schema({
  guildID: String,
  channelName: String,
  lastMessageLoggedID: String
})

module.exports = mongoose.model('Channel', channelSchema);
