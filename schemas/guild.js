const mongoose = require('mongoose');

const Schema = mongoose.Schema;

module.exports = new Schema({
  guildID: String,
  allowedChannels: [String],
  channels: [String],
  blacklist: [String],
  textQuiz: Schema.Types.Mixed,
  linkQuiz: Schema.Types.Mixed,
  refreshRate: Number,
  lastRefresh: Schema.Types.Mixed,
  leaderboards: Schema.Types.Mixed
});
