const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema({
  guildID: String,
  channelID: String,
  messages: Schema.Types.Mixed,
  channelIndex: Number
});
