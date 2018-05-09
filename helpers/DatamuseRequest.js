const shuffleArray = require('./shuffle.js');
const request = require('request-promise-native');

module.exports = class DatamuseRequest {
  //Initiates a request with no parameters
  constructor() {
    this.url = `https://api.datamuse.com/words?`
    this.response = null;
  }

  async send() {
    if (this.url[this.url.length - 1] == '&') {
      this.url = this.url.slice(0, -1);
    }
    let response = await request(this.url);
    response = JSON.parse(response);
    if (response.length === 0 || !response) {
      console.log(this.url);
      throw new Error(`Empty response from datamuse`);
    }
    this.response = response;
    return response;
  }

  selectWords(num = 1, shuffle = false, maxSyllables = null) {
    let output = [];
    if (shuffle) {
      output = shuffleArray(this.response);
    }
    if (maxSyllables) {
      output = this.response.filter(word => {
        return word.numSyllables <= maxSyllables;
      })
    }
    if (output.length < 1) {
      return null;
    }
    return output.slice(0, num).map(e => e.word);
  }



  meansLike(...words) {
    words.forEach(w => {
      this.url += `ml=${w}&`
    });
    return this;
  }

  soundsLike(...words) {
    words.forEach(w => {
      this.url += `sl=${w}&`
    });
    return this;
  }

  spelledLike(...words) {
    words.forEach(w => {
      this.url += `sp=${w}&`
    });
    return this;
  }

  rhyme(...words) {
    words.forEach(w => {
      this.url += `rel_rhy=${w}&`
    });
    return this;
  }

  leftContext(...words) {
    words.forEach(w => {
      this.url += `lc=${w}&`
    });
    return this;
  }

  describe(...words) {
    words.forEach(w => {
      this.url += `rel_jjb=${w}&`
    });
    return this;
  }


}
