const { Command } = require('discord.js-commando');
const Quiz = require('../../models/quiz.js');
const Message = require('../../models/message.js');
const Text = require('markov-chains-text').default;

module.exports = class LinkQuiz extends Command {
    constructor(client) {
        super(client, {
            name: 'wholinkedthat',
            group: 'quizcommands',
            memberName: 'linkquiz',
            description: 'Starts a link quiz',
            examples: ['wholinkedthat']
        });
    }

    async run(msg) {
      //Implemented the running here
      const keysQuery = Message.find().distinct('authorID');
      const keys = await keysQuery.exec();
      const keyToUse = keys[Math.floor(Math.random()*keys.length)];

      const query = {
        'authorID': keyToUse,
        'channelName': msg.channel.name,
        'messageType': 'LINK'
      }

      const linkQuery = Message.find(query);
      let links = await linkQuery.exec();
      const link = links[Math.floor(Math.random()*links.length)].content;

      const settings = {
        maxOverlapRatio: 1,
        maxOverlapTotal: 150000,
        tries: 200
      }
      const quizQuery = Quiz.findOne({
        'guildID': msg.guild.id,
        'channelName': msg.channel.name,
        'quizType': 'LINK'
      })

      let quiz = await quizQuery.exec();

      if (!quiz) {
        quiz = new Quiz();
        quiz.guildID = msg.guild.id;
        quiz.channelName = msg.channel.name;
        quiz.quizType = 'LINK';
        quiz.answer = keyToUse;
        quiz.solved = false;
        quiz.content = link;
        await quiz.save();
      }

      quiz.answer = keyToUse;
      quiz.solved = false;
      quiz.content = link;

      await quiz.save();

      msg.channel.send(`${link}`);
    }

};
