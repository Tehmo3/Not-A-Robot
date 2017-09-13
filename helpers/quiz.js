const makeChain = require('./text.js').makeChain;
const getID = require('./text.js').getID;
const mongoose = require('mongoose');
const guildSchema = require('../schemas/guild.js');

const Guild = mongoose.model('Guild', guildSchema);

function findId(client, userID) {
  return client.users.find(user => user.id === userID);
}

function fetchRandom(obj) {
  let tempKey = '';
  const keys = Object.keys(obj);
  return keys[Math.floor(Math.random() * keys.length)];
}


function textQuiz(client, obj) {
  let userID = fetchRandom(obj).slice(2, -1);
  let user = findId(client, userID);
  while (!user) {
    userID = fetchRandom(obj).slice(2, -1);
    user = findId(client, userID);
  }
  let text = makeChain(userID, obj);
  while (text instanceof Error) {
    userID = fetchRandom(obj).slice(2, -1);
    user = findId(client, userID);
    while (!user) {
      userID = fetchRandom(obj).slice(2, -1);
      user = findId(client, userID);
    }
    text = makeChain(userID, obj);
  }
  return { answer: user.id, question: text, solved: false };
}

function linkQuiz(client, obj) { //Bug here! Infinite loop sometimes....
  let i = 0;
  let userID = fetchRandom(obj);
  let user = findId(client, userID.slice(2, -1));
  while (!user) {
    userID = fetchRandom(obj);
    user = findId(client, userID.slice(2, -1));
    i += 1;
    if (i > 100) {
      return { answer: null, question: 'Hmm... Something hasn\'t worked', solved: false }
    }
  }
  let newObj = obj[userID];
  let text = newObj[Math.floor(Math.random() * newObj.length)];
  while (text === undefined || text === null) {
    if (i > 100) {
      return { answer: null, question: 'Hmm... Something hasn\'t worked', solved: false }
    }
    userID = fetchRandom(obj);
    user = findId(client, userID.slice(2, -1));
    while (!user) {
      if (i > 100) {
        return { answer: null, question: 'Hmm... Something hasn\'t worked', solved: false }
      }
      userID = fetchRandom(obj);
      console.log(userID, userID.slice(2, -1));
      i += 1;
      user = findId(client, userID.slice(2, -1));
    }
    newObj = obj[userID];
    text = newObj[Math.floor(Math.random() * newObj.length)];
    i += 1;
  }
  return { answer: user.id, question: text, solved: false };
}

function startQuiz(client, type, obj, id, textChannel) {
  let quiz = null;
  if (type === 'text') {
    quiz = textQuiz(client, obj.messageObject);
    const query = { guildID: id };
    Guild.findOne(query, { guildID: 1 }, (err, guild) => {
      if (err) { throw err; }
      if (!guild) {
        return;
      }
      guild.textQuiz = quiz;
      guild.save((error) => {
        if (error) throw error;
        console.log('quiz updated');
        console.log(quiz);
        textChannel.send(quiz.question);
      });
    });
  }
  else if (type === 'link') {
    quiz = linkQuiz(client, obj.linkObject);
    const query = { guildID: id };
    Guild.findOne(query, { guildID: 1 }, (err, guild) => {
      if (err) { throw err; }
      if (!guild) { return; }
      guild.linkQuiz = quiz;
      guild.save((error) => {
        if (error) throw error;
        console.log('quiz updated');
        console.log(quiz);
        textChannel.send(quiz.question);
      });
    });
  }
}
function checkAnswer(client, guess, channel, id, author) {
  const query = { guildID: id };
  const guessID = getID(client, channel, guess);
  const authID = getID(client, channel, author);
  if (guessID === null) {
    return;
  }
  Guild.findOne(query, { textQuiz: 1, linkQuiz: 1 , leaderboards: 1}, (err, guild) => {
    if (err) { throw err; }
    if (!guild) { throw new Error("Guild does not exist"); }
    if (guild.textQuiz && guessID === guild.textQuiz.answer) {
      channel.send(`CORRECT! Congratulations ${author}`);
      guild.textQuiz = null;
      guild = updateLeaderboards(guild, authID, author);
      guild.markModified('leaderboards');
      guild.save((error) => {
        if (error) throw error;
        console.log('Quiz + leaderboards updated');
      })
    }
    else if (guild.linkQuiz && guessID === guild.linkQuiz.answer) {
      channel.send(`CORRECT! Congratulations ${author}`);
      guild.songQuiz = null;
      guild = updateLeaderboards(guild, authID, author);
      guild.markModified('leaderboards');
      guild.save((error) => {
        if (error) throw error;
        console.log('Quiz + leaderboards updated');
      })
    };
  });
}

function sendLeaderboards(client, channel, leaderboards) {
  for (var key in leaderboards) {
    if (leaderboards.hasOwnProperty(key)) {
      for (let i=5; i>0; i--) {
        if (leaderboards[key].pos === i) {
          channel.send(`${i}. ${leaderboards[key].username} - ${leaderboards[key].score} questions correct`);
        }
      }
    }
  }
  console.log("Leaderboards sent");
}

function updateLeaderboards(guild, userID, username) {
  if (!guild.leaderboards[userID]) {
    guild.leaderboards[userID] = {
      score: 1,
      pos: Object.keys(guild.leaderboards).length+1,
      username: username
    }
    return guild;
  }
  for (var key in guild.leaderboards) {
    if (guild.leaderboards.hasOwnProperty(key)) {
      if (key === userID) {
        guild.leaderboards[key].score += 1;
        guild.leaderboards[key].username = username;
        return guild;
      }
    }
  }
  for (key in guild.leaderboards) {
    if (guild.leaderboards.hasOwnProperty(key)) {
      if (guild.leaderboards[userID].score > guild.leaderboards[key].score) {
        guild.leaderboards[userID].pos += 1
        guild.leaderboards[key].pos -= 1
        return guild;
      }
    }
  }
  return guild;
}

module.exports = {
  startQuiz,
  checkAnswer,
  sendLeaderboards
};
