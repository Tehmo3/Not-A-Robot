const { Command } = require('discord.js-commando');
const request = require('request-promise-native');
const vision = require('@google-cloud/vision');
const fs = require('fs');

module.exports = class Advice extends Command {
    constructor(client) {
        super(client, {
            name: 'disguise',
            group: 'funcommands',
            memberName: 'diguise',
            description: 'Generates a disguise for you',
            examples: ['disguise'],
            args: [
              {
                key: 'image',
                prompt: 'What should your profile picture be?',
                type: 'string',
                default: '' //If null, use a pre-determined image
              }
            ]
        });
    }

    async run(msg, { image }) {
      //Step 1, get image, turn into tags
      msg.channel.send(`Creating your new identity....`);
      image = await setImage(image);
      const tags = await getTags(image);
      const name = await generateName(tags[0].labelAnnotations);
      msg.channel.send(`Your new identity:\nName: ${name}`, {
        file: image
      });
    }


};

async function setImage(image){
  return new Promise((resolve, reject) => {
    if (image) {
      resolve(image);
    }
    else {
      fs.readdir(__dirname + '/srcImages', (err, items) => {
        if (err) { throw err; }
        image = __dirname + '\\srcImages\\' + items[Math.floor(Math.random() * items.length)]
        resolve(image);
      })
    }
  });
}

async function getTags(image) {
  const client = new vision.ImageAnnotatorClient({
    credentials: JSON.parse(process.env.googleKey)
  });
  const labels = await client.labelDetection(image);
  return labels;
}

async function generateName(tags) {
  const option = Math.random();
  tags = shuffle(tags);
  //Should come up with more format for names??
  const word1 = await wordProcessingPipeline(tags[0].description);
  const word2 = await wordProcessingPipeline(tags[1].description);
  return `${word1} ${word2}`
}

async function wordProcessingPipeline(word) {
  if (Math.random() < 0.2) {
    return word;
  }
  if (Math.random() < 0.5) {
    word = await rhyme(word);
  }
  if (Math.random() < 0.5) {
    word = await soundLike(word);
  }
  if (Math.random() < 0.5) {
    word = await synonym(word);
  }
  return word;
}

async function rhyme(word) {
  let response = await request(`https://api.datamuse.com/words?rel_rhy=${word}&max=10`);
  response = JSON.parse(response);
  if (response.length === 0) { return word; }
  return response[Math.floor(Math.random() * response.length)].word;
}

async function soundLike(word) {
  let response = await request(`https://api.datamuse.com/words?sl=${word}&max=10`);
  response = JSON.parse(response);
  if (response.length === 0) { return word; }
  return response[Math.floor(Math.random() * response.length)].word;
}

async function synonym(word) {
  let response = await request(`https://api.datamuse.com/words?ml=${word}&max=10`);
  response = JSON.parse(response);
  if (response.length === 0) { return word; }
  return response[Math.floor(Math.random() * response.length)].word;
}

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
