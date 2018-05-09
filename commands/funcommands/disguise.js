const { Command } = require('discord.js-commando');
const vision = require('@google-cloud/vision');
const fs = require('fs');
const DatamuseRequest = require('../../helpers/DatamuseRequest.js');
const shuffle = require('../../helpers/shuffle.js');
const randomInt = require('../../helpers/randomInt.js');


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
      if (tags[0].error) {
        console.log(tags[0].error);
        if (tags[0].error.code === 7) {
          msg.channel.send(`Not-A-Robot is not allowed to access the URL on your behalf. Please try another url.`);
          return;
        }
        //The other errors will be handled by Commando, if any become issues
        //we can add them here
      }
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
        image = __dirname + '/srcImages/' + items[Math.floor(Math.random() * items.length)]
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
  let randomNum = Math.random();
  if (randomNum < 1) { //Certain for now
    //Returns a name that rhymes, with somewhere between 2 and 3 words.
    let w1 = tags[0].description;
    let req = new DatamuseRequest().rhyme(w1).meansLike(w1);
    console.log('processing request');
    let words = await processRequest(req, randomInt(1, 2));
    let output = `${w1} `;
    words.forEach(word => {
      output += `${word} `
    });
    console.log(output);
    return output;
  }

  return ``;
}


async function processRequest(req, numWords = 1) {
  await req.send();
  let maxSyl = 1;
  let words = req.selectWords(numWords, true, maxSyl);
  console.log(numWords);
  console.log(req.responseSize);
  if (req.responseSize < numWords) {
    return req.selectWords(req.responseSize, true);
  }
  while (words === null || words.length < numWords) {
    if (maxSyl < 10) {
      console.log('Finding words');
    }
    maxSyl++;
    words = req.selectWords(numWords, true, maxSyl);
  }



  return words;
}
