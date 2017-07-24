const fs = require("fs"),
    Text = require('markov-chains-text').default,
    makeChain = require('./!text.js').makeChain,
    getID = require('./!text.js').getID;
const mongoose = require("mongoose");
const guildSchema = require('../schemas/guild.js');
const Guild = mongoose.model("Guild", guildSchema);

function startQuiz(client, type, obj, id, textChannel) {
  let quiz = null;
  if (type === 'text') {
    quiz = textQuiz(client, obj.messageObject);
    const query = {guildID: id};
    Guild.findOne(query, {"guildID":1}, function(err, guild) {
      if (err) { throw err };
      if (!guild) {}
      else {
        guild.textQuiz = quiz;
        guild.save(function(err) {
          if (err) throw err;
          console.log("quiz updated");
          console.log(quiz);
          textChannel.send(quiz.question);
        })
      }
    })
  }
  else if (type === 'link') {
    quiz = linkQuiz(client, obj.linkObject);
    const query = {guildID: id};
    Guild.findOne(query, {"guildID":1}, function(err, guild) {
      if (err) { throw err };
      if (!guild) { return }
      else {
        guild.linkQuiz = quiz;
        guild.save(function(err) {
          if (err) throw err;
          console.log("quiz updated");
          console.log(quiz);
          textChannel.send(quiz.question);
        })
      }
    })
  }
}

function textQuiz(client, obj) {
  let userID = fetchRandom(obj).slice(2,-1);
  let user = client.users.find(user => user.id === userID);
  while (!user) {
    userID = fetchRandom(obj).slice(2,-1);
    user = client.users.find(user => user.id === userID);
  }
  let text = makeChain(userID, obj);
  while (text instanceof Error) {
    userID = fetchRandom(obj).slice(2,-1);
    user = client.users.find(user => user.id === userID);
    while (!user) {
      userID = fetchRandom(obj).slice(2,-1);
      user = client.users.find(user => user.id === userID);
    }
    text = makeChain(userID, obj);
  }
  return {answer: user.id, question: text, solved: false};
}

function linkQuiz(client, obj) {
  let userID = fetchRandom(obj);
  let user = client.users.find(user => user.id === userID.slice(2,-1));
  while (!user) {
    userID = fetchRandom(obj);
    user = client.users.find(user => user.id === userID.slice(2,-1));
  }
  const newObj = obj[userID];
  let text = newObj[Math.floor(Math.random() * newObj.length)];
  while (text === undefined || text === null) {
    userID = fetchRandom(obj);
    user = client.users.find(user => user.id === userID.slice(2,-1));
    while (!user) {
      userID = fetchRandom(obj);
      console.log(userID, userID.slice(2,-1));
      user = client.users.find(user => user.id === userID.slice(2,-1));
    }
    text = newObj[Math.floor(Math.random() * newObj.length)];
  }
  return {answer: user.id, question: text, solved: false};
}

function checkAnswer(client, guess, channel, id, author) {
  const query = {guildID: id};
  let guessID = getID(client, channel, guess);
  if (guessID === null) {
    return;
  }
  Guild.findOne(query, {'textQuiz': 1, 'linkQuiz': 1}, function(err, guild) {
    if (err) { throw err }
    if (!guild) { return }
    else {
      if (guild.textQuiz && guessID === guild.textQuiz.answer) {
        channel.send(`CORRECT! Congratulations ${author}`);
        guild.textQuiz = null;
      }
      else if (guild.linkQuiz && guessID === guild.linkQuiz.answer) {
        channel.send(`CORRECT! Congratulations ${author}`);
        guild.songQuiz = null;
      }
      guild.save(function(err) {
        if (err) throw err;
        console.log("Quiz updated");
      })
    }
  })
}


function fetchRandom(obj) {
    let temp_key = '',
        keys = [];
    for(temp_key in obj) {
       if(obj.hasOwnProperty(temp_key)) {
           keys.push(temp_key);
       }
    }
    return keys[Math.floor(Math.random() * keys.length)];
}

module.exports = {
  startQuiz,
  checkAnswer,
}
