const { Command } = require('discord.js-commando');
const Leaderboard = require('../../models/leaderboard.js');
// const userToID = require('../../helpers/userToID.js');

module.exports = class LeaderboardCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'leaderboard',
            group: 'quizcommands',
            memberName: 'leaderboard',
            description: 'Displays the current leaderboard',
            examples: ['leaderboard'],
        });
    }

    async run(msg, { user }) {
      //Implemented the running here
      // const userID = userToID(user, msg.guild);


      //Doesn't work if these two lines are made into one??
      const leaderboardQuery = Leaderboard.findOne({'guildID': msg.guild.id});
      let leaderboard = await leaderboardQuery.exec();

      leaderboard.leaderboard.sort((a, b) => {
        return a.score - b.score;
      });
      
      let outputString = ``;
      for (let i = 0; i < 10 && i < leaderboard.leaderboard.length; i++) {
        outputString += `${i+1}. ${leaderboard.leaderboard[i].nickname} - ${leaderboard.leaderboard[i].score} points\n`;
      }

      msg.channel.send(outputString);
    }
};
