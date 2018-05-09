const { Command } = require('discord.js-commando');
const request = require('request-promise-native');
const vision = require('@google-cloud/vision');
const fs = require('fs');
// const path = require('path');

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
      image = await setImage(image);
      const tags = await getTags(image);
      console.log(tags);
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
    keyFilename: 'Not-A-Robot-de14d9a0dccc.json'
  });
  const labels = await client.labelDetection(image);
  return labels;
}
