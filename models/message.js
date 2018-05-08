const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  guildID: String,
  channelName: String,
  content: String,
  authorID: String,
  messageID: String,
  messageType: {
    type: string,
    enum: ['TEXT', 'LINK']
  }
})

module.exports = mongoose.model('Message', messageSchema);
