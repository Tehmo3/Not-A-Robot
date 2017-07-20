const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema({
  channelID: String,
  admins: [String],
  channels: [String],
  blacklist: String,
  messages: Schema.Types.Mixed
});
