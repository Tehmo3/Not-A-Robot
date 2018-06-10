const { Command } = require('discord.js-commando');
const vision = require('@google-cloud/vision');
const fs = require('fs');
const shuffle = require('../../helpers/shuffle.js');
const NameGenerator = require('../../helpers/NameGenerator/NameGenerator.js');
const TwoWordRhymeTemplate = require('../../helpers/NameGenerator/templates/TwoWordRhymeTemplate.js');


module.exports = class Advice extends Command {
    constructor(client) {
        super(client, {
            name: 'disguise',
            group: 'funcommands',
            memberName: 'diguise',
            description: 'Generates a disguise for you',
            examples: ['disguise'],
            throttling: { //Im not sure if this works on the Heroku server. Not tested.
              usages: 20,
              duration: 86400
            },
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
          msg.channel.send(`Not-A-Robot is not allowed to access the URL on your behalf. Please try another url.`);
          return;
        }
        if (tags[0].error.code === 3) {
          msg.channel.send(`404 Not Found error on image :(`);
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
  const generator = new NameGenerator(tags);
  let randomNum = Math.random();
  if (randomNum < 1) { //Certain for now
    const template = new TwoWordRhymeTemplate();
    name = generator.generate(template);
    return name;
  }

  return ``;
}
