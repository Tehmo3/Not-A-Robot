module.exports = class NameGenerator {
  constructor(words) {
    this.seedWords = words;
  }

  generate(template, num = 1) {
    return template.fill(this.seedWords, num);
  }
}
