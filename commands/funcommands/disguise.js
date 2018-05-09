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
  if (randomNum < 0.5) {
    const word1 = await wordsProcessingPipeline(tags[0].description);
    const word2 = await wordsProcessingPipeline(tags[1].description);
    return `${word1} ${word2}`;
  }
  else {
    let word1 = tags[0].description;
    let word2 = tags[1].description;
    let w1, w2, w3, w4;
    [w1, w2, w3, w4] = await wordsProcessingPipeline(word1, word2);
    return `${w1} ${w2} ${w3} ${w4}`;

  }
  return ``;
}

async function wordsProcessingPipeline(...words) {
  switch(words.length) {
    case 1:
      return await singleWordProcessingPipeline(words[0]);
    case 2:
      return await doubleWordProcessingPipeline(words[0], words[1]);
    default:
      //Implement more here
      return;
  }
}

async function singleWordProcessingPipeline(word) {
  let numConditions = 0;
  if (Math.random() < 0.2) {
    return word;
  }
  let req = new DatamuseRequest();
  if (Math.random() < 0.3 && numConditions < 2) {
    req.rhyme(word);
    numConditions++;
  }
  if (Math.random() < 0.6 && numConditions < 2) {
    req.soundsLike(word);
    numConditions++;
  }
  if (Math.random() < 0.5 && numConditions < 2) {
    req.meansLike(word);
    numConditions++;
  }
  if (Math.random() < 0.5 && numConditions < 2) {
    req.describe(word);
    numConditions++;
  }
  await req.send();
  return req.selectWords(1, true);
}

async function doubleWordProcessingPipeline(w1, w2) {
  if (Math.random() < 1) { //Certain for now, will change with more options

    let w3Req = new DatamuseRequest().leftContext(w1).rhyme(w1);
    await w3Req.send();

    let w4Req = new DatamuseRequest().leftContext(w2).rhyme(w2);
    await w4Req.send();

    let w1Syl = 1;
    let w2Syl = 1;

    let w3 = w3Req.selectWords(1, true, w1Syl);
    let w4 = w4Req.selectWords(1, true, w2Syl);
    while (w3 === null || w4 === null) {
      w1Syl++;
      w2Syl++;
      w3 = w3Req.selectWords(1, true, w1Syl);
      w4 = w4Req.selectWords(1, true, w2Syl);
    }

    //Word Word Rhyme Rhyme or Word Rhyme Word Rhyme
    let finalName = Math.random() < 0.5 ? [w1, w2, w3, w4] : [w1, w3, w2, w4];
    return finalName;
  }
}
