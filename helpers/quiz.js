var fs = require("fs");
var Text = require('markov-chains-text').default;
var makeChain = require('./!text.js').makeChain;

function startQuiz(client, type) {
  var currentQuiz;
  if (type === 'text') {
    currentQuiz = textQuiz(client);
  }
  return currentQuiz;
}

function textQuiz(client) {
  var obj =  JSON.parse(fs.readFileSync('data.json', 'utf8'))['messageObject'];
  var userID = fetchRandom(obj).slice(2,-1);
  var user = client.users.find(user => user.id == userID);
  var text = makeChain(userID, obj);
  try {
    return {username: user.username, question: text, solved: false};
  }
  catch (e) {
    return textQuiz(client);
  }
}

function checkAnswer(currQuiz, guess, channel) {
  if (guess === currQuiz.username && currQuiz !== null) {
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
