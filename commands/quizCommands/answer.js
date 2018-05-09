const { Command } = require('discord.js-commando');
const Quiz = require('../../models/quiz.js');
const Message = require('../../models/message.js');
const Text = require('markov-chains-text').default;
const Leaderboard = require('../../models/leaderboard.js');

module.exports = class QuizAnswer extends Command {
    constructor(client) {
        super(client, {
            name: 'answer',
            group: 'quizcommands',
            memberName: 'answercommand',
            description: 'Answers a text or link quiz',
            examples: ['answer'],
            args: [
              {
                key: 'user',
                prompt: 'Which user is the bot emulating?',
                type: 'user'
              }
            ]
        });
    }

    async run(msg, { user }) {

      const quizQuery = Quiz.find({
        'guildID': msg.guild.id,
        'channelName': msg.channel.name,
        solved: false
      })
      //Array of size 0, 1 or 2
      let quizzes = await quizQuery.exec();

      const leaderboardQuery = Leaderboard.findOne({'guildID': msg.guild.id});
      let leaderboard = await leaderboardQuery.exec();

      if (!leaderboard) {
        leaderboard = new Leaderboard();
        leaderboard.guildID = msg.guild.id;
        leaderboard.leaderboard = [];
      }

      if (quizzes.length === 0) { return; }
      quizzes.forEach(async (quiz) => {
        if (!quiz.solved && quiz.answer === user.id) {
          //Correct!
          const userName = msg.member.nickname ? msg.member.nickname : msg.author.username;
          let printName = user.username;
          quiz.solved = true;

          let thisUser = leaderboard.leaderboard.find(e => e.id === msg.author.id);
          if (!thisUser) {
            thisUser = {
              id: msg.author.id,
              nickname: userName,
              score: 1
            }
            leaderboard.leaderboard.push(thisUser);
          }
          thisUser.score++;
          thisUser.nickname = userName;

          await leaderboard.save();

          msg.channel.send(`CORRECT! ${userName} was correct with ${printName}`);
          await quiz.save();
        }
      });
    }

};
