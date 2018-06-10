module.exports = class NameGenerator {
  //Words: [String], seed words for the template
  constructor(words) {
    this.seedWords = words;
  }

  //template: A concrete implementation of Template
  generate(template, num = 1) {
    return template.fill(this.seedWords, num);
  }
}
