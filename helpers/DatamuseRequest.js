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

  selectWords(num = 1, shuffle = false, syllables = 1) {
    let output = [];
    if (syllables) {
      // https://codegolf.stackexchange.com/questions/47322/how-to-count-the-syllables-in-a-word
      output = this.response.filter(word => {
        return this.countSyllables(word.word) === syllables;
      })
    }
    if (output.length < 1) {
      return null;
    }
    if (shuffle) {
      output = shuffleArray(this.response);
    }
    if (num = 1) {
      return output[0].word;
    }
    return output.slice(0, num).map(e => e.word);
  }

//https://stackoverflow.com/questions/13895373/javascript-equivalent-of-rubys-stringscan
  countSyllables(s, re = /[aiouy]+e*|e(?!d$|ly).|[td]ed|le$/gi ) {
    if (!re.global) throw "ducks";
    var m, r = [];
    while (m = re.exec(s)) {
        m.shift();
        r.push(m);
    }
    return r.length;
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
