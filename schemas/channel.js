const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema({
  channelID: String,
  channels: [String],
  blacklist: String,
  messages: Schema.Types.Mixed
});
