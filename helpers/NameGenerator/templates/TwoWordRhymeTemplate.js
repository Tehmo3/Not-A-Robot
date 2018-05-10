const Template = require('../Template.js');
const DataMuseRequest = require('../../DatamuseRequest.js');

module.exports = class TwoWordRhymeTemplate extends Template {
  constructor() {
    super("{0} {1}", ["adj", "v", "adv"], ["any"]);
  }

  async generateWords(words) {
    let word2 = words[0].description;
    let req = new DataMuseRequest().rhyme(word2);
    await req.send()
    return [req.response, [{word: word2}]];
  }
}
