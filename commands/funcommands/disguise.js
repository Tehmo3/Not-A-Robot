const { Command } = require('discord.js-commando');
const vision = require('@google-cloud/vision');
const fs = require('fs');
const DatamuseRequest = require('../../helpers/DatamuseRequest.js');
const shuffle = require('../../helpers/shuffle.js');


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
        if (tags[0].error.code === 7) {
          msg.channel.send(`Not-A-Robot is not allowed to access the URL on your behalf. Please try another url`);
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
  console.log(randomNum);
  if (randomNum < 1) { //Certain for now
    //2 word rhyme
    if (randomNum < 0.25) {
      //No context
      let w1 = tags[0].description;
      let req = new DatamuseRequest().rhyme(w1);
      let w2 = await processRequest(req, 1);
      return `${w1} ${w2}`;
    }
    else if (randomNum < 1) {
      //Left context
      if (randomNum < 0.50) {
        let word1 = tags[0].description;
        let req = new DatamuseRequest().rhyme(w1).leftContext(w1);
        let w2 = await processRequest(req, 1);
        return `${w1} ${w2}`;
      }
      else if (randomNum < 0.75) {
        let w1 = tags[0].description;
        let w2, w3;
        let req = new DatamuseRequest().rhyme(w1).leftContext(w1)
        [w2, w3] = await processRequest(req, 2);
        return `${w1} ${w2} ${w3}`;
      }
      else if (randomNum < 1) {
        let w1 = tags[0].description;
        let w2, w3, w4;
        let req = new DatamuseRequest().rhyme(w1).leftContext(w1)
        [w2, w3, w4] = await processRequest(req, 3);
        return `${w1} ${w2} ${w3} ${w4}`;
      }
    }
  }
  return ``;
}


async function processRequest(req, numWords = 1) {

  await req.send();

  let syl = 1;

  words = req.selectWords(numWords, true, syl);

  while (words === null) {
    syl++;
    words = req.selectWords(numWords, true, syl);
  }
  return words;
}
