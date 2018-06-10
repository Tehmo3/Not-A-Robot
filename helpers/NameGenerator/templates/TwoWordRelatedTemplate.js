const Template = require('../Template.js');
const DataMuseRequest = require('../../DatamuseRequest.js');

//A concrete 'Template'

module.exports = class TwoAdjTemplate extends Template {
  constructor() {
    super("{0} and {1}", ["adj"], ["adj"]);
  }

  async generateWords(words) {
    let seedWord = words[0].description;
    let req = new DataMuseRequest().describe(seedWord);
    await req.send();
    return [req.response, req.response];
  }
}
