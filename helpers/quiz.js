const fs = require("fs"),
    Text = require('markov-chains-text').default,
    makeChain = require('./!text.js').makeChain;

function startQuiz(client, type) {
  let currentQuiz = null;
  if (type === 'text') {
    currentQuiz = textQuiz(client);
  }
  else if (type === 'link') {
    currentQuiz = linkQuiz(client);
  }
  return currentQuiz;
}

function textQuiz(client) {
  const obj =  JSON.parse(fs.readFileSync('data.json', 'utf8'))['messageObject'];
  const userID = fetchRandom(obj).slice(2,-1);
  const user = client.users.find(user => user.id == userID);
  const text = makeChain(userID, obj);
  try {
    return {answer: user.username, question: text, solved: false};
  }
  catch (e) {
    return textQuiz(client);
  }
}

function linkQuiz(client) {
  const obj =  JSON.parse(fs.readFileSync('data.json', 'utf8'))['linkObject'];
  const userID = fetchRandom(obj);
  const user = client.users.find(user => user.id == userID.slice(2,-1))
  const newObj = obj[userID];
  const text = newObj[Math.floor(Math.random() * newObj.length)];
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
