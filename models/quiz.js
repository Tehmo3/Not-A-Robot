const mongoose = require('mongoose');

const dataSchema = require('./data.js').dataSchema;

const quizSchema = mongoose.Schema({
    quizID: String,          //The id of the quiz
    guildID: String,         //The id of the guild
    channelName: String,     //The name of the channel the quiz is in
    quizType: : {            //The type of quiz (enum)
      type: String,
      enum: ['TEXT', 'LINK']
    },
    answer: {                //The user who is the answer to the quiz
      id: String,
      username: String,
      nickname: String
    },
    solved: Boolean          //A boolean representing whether the quiz has already
                             //Been solved or not
});

module.exports = mongoose.model('Quiz', quizSchema);
