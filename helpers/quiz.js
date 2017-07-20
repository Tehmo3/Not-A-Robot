const fs = require("fs"),
    Text = require('markov-chains-text').default,
    makeChain = require('./!text.js').makeChain;
const mongoose = require("mongoose");
const channelSchema = require('../schemas/channel.js');
const Channel = mongoose.model("Channel", channelSchema);

function startQuiz(client, type, obj, id, textChannel) {
  let quiz = null;
  if (type === 'text') {
    quiz = textQuiz(client, obj.messageObject);
    const query = {channelID: id};
    Channel.findOne(query, function(err, channel) {
      if (err) { throw err };
      if (!channel) {}
      else {
        channel.textQuiz = quiz;
        channel.save(function(err) {
          if (err) throw err;
          console.log("quiz updated");
          console.log(quiz);
          textChannel.sendMessage(quiz.question);
        })
      }
    })
  }
  else if (type === 'link') {
    quiz = linkQuiz(client, obj.linkObject);
    const query = {channelID: id};
    Channel.findOne(query, function(err, channel) {
      if (err) { throw err };
      if (!channel) { return }
      else {
        channel.linkQuiz = quiz;
        channel.save(function(err) {
          if (err) throw err;
          console.log("quiz updated");
          console.log(quiz);
          textChannel.sendMessage(quiz.question);
        })
      }
    })
  }
}

function textQuiz(client, obj) {
  const userID = fetchRandom(obj).slice(2,-1);
  const user = client.users.find(user => user.id == userID);
  let text = makeChain(userID, obj);
  if (text instanceof Error) {
    textQuiz(client, obj);
  }
  try {
    return {answer: user.username, question: text, solved: false};
  }
  catch (e) {
    return textQuiz(client, obj);
  }
}

function linkQuiz(client, obj) {
  const userID = fetchRandom(obj);
  const user = client.users.find(user => user.id == userID.slice(2,-1))
  const newObj = obj[userID];
  const text = newObj[Math.floor(Math.random() * newObj.length)];
  if (!text) {
    linkQuiz(client, obj);
  }
  try {
    return {answer: user.username, question: text, solved: false};
  }
  catch (e) {
    return textQuiz(client, obj);
  }
}

function checkAnswer(currQuiz, guess, channel, id) {
  const query = {channelID: id};
  Channel.findOne(query, function(err, databaseChannel) {
    if (err) { throw err }
    if (!databaseChannel) { return }
    else {
      if (databaseChannel.textQuiz.answer && guess === databaseChannel.textQuiz.answer) {
        channel.sendMessage("```CORRECT! (who said that)```");
        databaseChannel.textQuiz = null;
      }
      else if (databaseChannel.linkQuiz.answer && guess === databaseChannel.linkQuiz.answer) {
        channel.sendMessage("```CORRECT! (who linked that)```");
        databaseChannel.songQuiz = null;
      }
      databaseChannel.save(function(err) {
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
