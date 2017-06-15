var fs = require("fs");
var Text = require('markov-chains-text').default;
var makeChain = require('./!text.js').makeChain;

function startQuiz(client, type) {
  var currentQuiz;
  if (type === 'text') {
    currentQuiz = textQuiz(client);
  }
  else if (type === 'link') {
    currentQuiz = linkQuiz(client);
  }
  return currentQuiz;
}

function textQuiz(client) {
  var obj =  JSON.parse(fs.readFileSync('data.json', 'utf8'))['messageObject'];
  var userID = fetchRandom(obj).slice(2,-1);
  var user = client.users.find(user => user.id == userID);
  var text = makeChain(userID, obj);
  try {
    return {answer: user.username, question: text, solved: false};
  }
  catch (e) {
    return textQuiz(client);
  }
}

function linkQuiz(client) {
  var obj =  JSON.parse(fs.readFileSync('data.json', 'utf8'))['linkObject'];
  var userID = fetchRandom(obj);
  var user = client.users.find(user => user.id == userID.slice(2,-1))
  var newObj = obj[userID];
  var text = newObj[Math.floor(Math.random() * newObj.length)];
  try {
    return {answer: user.username, question: text, solved: false};
  }
  catch (e) {
    return textQuiz(client);
  }
}

function checkAnswer(currQuiz, guess, channel) {
  if (guess === currQuiz.answer && currQuiz !== null) {
    channel.sendMessage("```CORRECT!```");
    return null;
  }
  else {
    return currQuiz;
  }
}


function fetchRandom(obj) {
    var temp_key, keys = [];
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
