const { Command } = require('discord.js-commando');
const Quiz = require('../../models/quiz.js');
const Message = require('../../models/message.js');
const Text = require('markov-chains-text').default;

module.exports = class TextQuiz extends Command {
    constructor(client) {
        super(client, {
            name: 'whosaidthat',
            group: 'quizcommands',
            memberName: 'textquiz',
            description: 'Starts a text quiz',
            examples: ['whosaidthat']
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
        'messageType': 'TEXT'
      }
      const messageQuery = Message.find(query);
      let messages = await messageQuery.exec();
      messages = messages.map(e => e.content).join(' ');
      const messageGenerator = new Text(messages);
      const settings = {
        maxOverlapRatio: 1,
        maxOverlapTotal: 150000,
        tries: 200
      }
      const quizQuery = Quiz.findOne({
        'guildID': msg.guild.id,
        'channelName': msg.channel.name,
        'quizType': 'TEXT'
      })

      let quiz = await quizQuery.exec();

      const sentence = messageGenerator.makeSentence(null, settings)
      console.log(quiz);
      if (!quiz) {
        quiz = new Quiz();
        quiz.guildID = msg.guild.id;
        quiz.channelName = msg.channel.name;
        quiz.quizType = 'TEXT';
        quiz.answer = keyToUse;
        quiz.solved = false;
        quiz.content = sentence;
        await quiz.save();
      }

      quiz.answer = keyToUse;
      quiz.solved = false;
      quiz.content = sentence;

      await quiz.save();

      msg.channel.send(`${sentence}`);
    }



};
