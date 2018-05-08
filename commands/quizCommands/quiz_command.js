const { Command } = require('discord.js-commando');

module.exports = class QuizCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'quiz',
            group: 'quizcommands',
            memberName: 'quiz',
            description: 'Starts a quiz',
            examples: ['quiz'],
            args: [
              {
                key: 'type',
                prompt: 'What type of quiz do you want to start?',
                type: 'String',
                validate: text => {
                  valid = [
                    "link",
                    "l",
                    "t",
                    "text"
                  ]
                  if (valid.indexOf(text.toLowerCase()) > -1){
                    return true;
                  }
                  return 'Please specify what type of quiz.'
                }
              }
            ]
        });
    }

    run(msg, { type }) {
      //Implemented the running here
    }
};
