const mongoose = require('mongoose');

const dataSchema = require('./data.js').dataSchema;

const leaderboardSchema = mongoose.Schema({
  guildID: String, //The guild this leaderboard describes
  leaderboard: [{  //An array of users and their score. (Sorted??)
    id: String,
    nickname: String,
    score: Number
  }]
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
