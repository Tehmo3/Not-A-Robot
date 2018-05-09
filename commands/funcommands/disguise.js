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
  if (randomNum < 0.5) {
    if (randomNum < 0.25) {
      const w1 = await singleWordProcessor1(tags[0].description);
      const w2 = await singleWordProcessor2(tags[1].description);
      return `${w1} ${w2}`;
    }
    else if (randomNum < 0.5) {
      let word1 = tags[0].description;
      let w1, w2;
      [w2, w1] = await singleWordProcessor2(word1);
      return `${w1} ${w2}`;
    }
  }
  else {
    let word1 = tags[0].description;
    let word2 = tags[1].description;
    let w1, w2, w3, w4;
    [w1, w2, w3, w4] = await doubleWordProcessor1(word1, word2);
    return `${w1} ${w2} ${w3} ${w4}`;
  }
  return ``;
}

async function singleWordProcessor1(word) {
  let req = new DatamuseRequest();
  if (Math.random() < 0.25) {
    req.rhyme(word);
  }
  else if (Math.random() < 0.5) {
    req.soundsLike(word);
  }
  else if (Math.random() < 0.75) {
    req.meansLike(word);
  }
  else if (Math.random() < 1) {
    req.describe(word);
  }
  await req.send();
  return req.selectWords(1, true);
}

async function singleWordProcessor2(word) {
  let req = new DatamuseRequest().describe(word);

  await req.send();
  let syl = 1;
  w2 = req.selectWords(1, true, syl);
  while (w2 === null) {
    syl++;
    w2 = req.selectWords(1, true, syl);
  }

  return [word, w2]

}

async function doubleWordProcessor1(w1, w2) {
  //Option 1: Word Rhyme Word Rhyme or Word Word Rhyme Rhyme

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
    if (w1Syl > 4|| w2Syl > 4) {
      throw new Error("No words match those conditions");
    }
  }

  //Word Word Rhyme Rhyme or Word Rhyme Word Rhyme
  let finalName = Math.random() < 0.5 ? [w1, w2, w3, w4] : [w1, w3, w2, w4];
  return finalName;
}
