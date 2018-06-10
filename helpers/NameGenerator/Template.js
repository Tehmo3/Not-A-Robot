module.exports = class Template {
  //Arguments
  //Format: String. In form "{0} {1}"
  //details: [String]. e.g ["adj", "noun", "any"]
  constructor(format, ...details) {
    if (new.target === Template) {
      throw new TypeError("Cannot construct Template classes. Please construct a subclass.");
    }
    this.format = format;
    this.wordsNeeded = format.match(/{(\d+)}/g).length
    this.typesNeeded = details;
  }

  //words: [[String]], a list of words to fill the template from.
  //Words.length = details.length = num of words to fill in template
  //num = num of times to fill template
  async fill(words, num = 1) {
    //fill template here
    //TODO: Refactor
    let workingWords = words;
    workingWords = await this.generateWords(words);
    let output = [];
    let i = 0;
    for (i = 0; i < num; i++) {
      let j = 0;
      let wordOrder = []
      for (j = 0; j < workingWords.length; j++) {
        let currWords = shuffle(workingWords[j]);
        if (this.typesNeeded[j]) {
          let filteredWords = [];
          if (this.typesNeeded[j][0] == "any") {
            filteredWords = currWords;
          }
          else {
            filteredWords = currWords.filter((word) => {
              let intersection = this.typesNeeded[j].filter(n => {
                return word.tags && word.tags.indexOf(n) !== -1;
              });
              return intersection.length > 0;
            })
          }
          wordOrder.push(filteredWords);
        }
        else {
          wordOrder.push(currWords);
        }
      }
      let chosenWords = wordOrder.map((arr) => arr[Math.floor(Math.random() * arr.length)].word);
      output.push(format(this.format, chosenWords));
    }
    return output;
  }

  async generateWords(words) {
    //Perform some algorithm to get a new set of words here
    //Transforms input words into words that will fill template
    //Should return an array of arrays, outerarray.length = num of words to fill
    //Inner array are words that could fill that slot
    throw new Error('This method must be overwritten')

    // return words;
  }

}

function format(format, args) {
    return format.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
};

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
