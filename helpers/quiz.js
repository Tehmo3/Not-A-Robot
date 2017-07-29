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
  const keys = [];
  const objKeys = Object.keys(obj);
  let i = 0;
  for (i = 0; i < objKeys.length; i += 1) {
    tempKey = objKeys[i];
    if (Object.protype.hasOwnProperty.call(obj, tempKey)) {
      keys.push(tempKey);
    }
  }
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

function linkQuiz(client, obj) {
  let userID = fetchRandom(obj);
  let user = findId(client, userID.slice(2, -1));
  while (!user) {
    userID = fetchRandom(obj);
    user = findId(client, userID.slice(2, -1));
  }
  let newObj = obj[userID];
  let text = newObj[Math.floor(Math.random() * newObj.length)];
  while (text === undefined || text === null) {
    userID = fetchRandom(obj);
    user = findId(client, userID.slice(2, -1));
    while (!user) {
      userID = fetchRandom(obj);
      console.log(userID, userID.slice(2, -1));
      user = findId(client, userID.slice(2, -1));
    }
    newObj = obj[userID];
    text = newObj[Math.floor(Math.random() * newObj.length)];
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
  if (guessID === null) {
    return;
  }
  Guild.findOne(query, { textQuiz: 1, linkQuiz: 1 }, (err, guild) => {
    if (err) { throw err; }
    if (!guild) { return; }
    if (guild.textQuiz && guessID === guild.textQuiz.answer) {
      channel.send(`CORRECT! Congratulations ${author}`);
      guild.textQuiz = null;
    }
    else if (guild.linkQuiz && guessID === guild.linkQuiz.answer) {
      channel.send(`CORRECT! Congratulations ${author}`);
      guild.songQuiz = null;
    }
    guild.save((error) => {
      if (error) throw error;
      console.log('Quiz updated');
    });
  });
}

module.exports = {
  startQuiz,
  checkAnswer,
};
