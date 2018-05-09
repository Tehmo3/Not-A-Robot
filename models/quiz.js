const mongoose = require('mongoose');


const quizSchema = mongoose.Schema({
    guildID: String,         //The id of the guild
    channelName: String,     //The name of the channel the quiz is in
    quizType: {              //The type of quiz (enum)
      type: String,
      enum: ['TEXT', 'LINK']
    },
    answer: String,          //The ID of the user who is the answer to the quiz
    solved: Boolean,         //A boolean representing whether the quiz has already been solved or not
    content: String          //The actual string the users are using to guess
});

module.exports = mongoose.model('Quiz', quizSchema);
