'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var pickOneByWeight = require('pick-one-by-weight');

var isType = function isType(t) {
  return Object.prototype.toString.call(t).slice(8, -1).toLowerCase();
};

var MarkovChain = (function () {
  function MarkovChain(contents) {
    var normFn = arguments.length <= 1 || arguments[1] === undefined ? function (word) {
      return word.replace(/\.$/ig, '');
    } : arguments[1];

    _classCallCheck(this, MarkovChain);

    this.wordBank = Object.create(null);
    this.sentence = '';
    this._normalizeFn = normFn;
    this.parseBy = /(?:\.|\?|\n)/ig;
    this.parse(contents);
  }

  _createClass(MarkovChain, [{
    key: 'startFn',
    value: function startFn(wordList) {
      var k = Object.keys(wordList);
      var l = k.length;
      return k[~ ~(Math.random() * l)];
    }
  }, {
    key: 'endFn',
    value: function endFn() {
      return this.sentence.split(' ').length > 7;
    }
  }, {
    key: 'process',
    value: function process() {
      var curWord = this.startFn(this.wordBank);
      this.sentence = curWord;
      while (this.wordBank[curWord] && !this.endFn()) {
        curWord = pickOneByWeight(this.wordBank[curWord]);
        this.sentence += ' ' + curWord;
      }
      return this.sentence;
    }
  }, {
    key: 'parse',
    value: function parse() {
      var _this = this;

      var text = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var parseBy = arguments.length <= 1 || arguments[1] === undefined ? this.parseBy : arguments[1];

      text.split(parseBy).forEach(function (lines) {
        var words = lines.split(' ').filter(function (w) {
          return w.trim() !== '';
        });
        for (var i = 0; i < words.length - 1; i++) {
          var curWord = _this._normalize(words[i]);
          var nextWord = _this._normalize(words[i + 1]);

          if (!_this.wordBank[curWord]) {
            _this.wordBank[curWord] = Object.create(null);
          }
          if (!_this.wordBank[curWord][nextWord]) {
            _this.wordBank[curWord][nextWord] = 1;
          } else {
            _this.wordBank[curWord][nextWord] += 1;
          }
        }
      });
      return this;
    }
  }, {
    key: 'start',
    value: function start(fnStr) {
      var startType = isType(fnStr);
      if (startType === 'string') {
        this.startFn = function () {
          return fnStr;
        };
      } else if (startType === 'function') {
        this.startFn = function (wordList) {
          return fnStr(wordList);
        };
      } else {
        throw new Error('Must pass a function, or string into start()');
      }
      return this;
    }
  }, {
    key: 'end',
    value: function end(fnStrOrNum) {
      var _this2 = this;

      var endType = isType(fnStrOrNum);
      var self = this;

      if (endType === 'function') {
        this.endFn = function () {
          return fnStrOrNum(_this2.sentence);
        };
      } else if (endType === 'string') {
        this.endFn = function () {
          return _this2.sentence.split(' ').slice(-1)[0] === fnStrOrNum;
        };
      } else if (endType === 'number' || fnStrOrNum === undefined) {
        fnStrOrNum = fnStrOrNum || Infinity;
        this.endFn = function () {
          return self.sentence.split(' ').length > fnStrOrNum;
        };
      } else {
        throw new Error('Must pass a function, string or number into end()');
      }
      return this;
    }
  }, {
    key: '_normalize',
    value: function _normalize(word) {
      return this._normalizeFn(word);
    }
  }, {
    key: 'normalize',
    value: function normalize(fn) {
      this._normalizeFn = fn;
      return this;
    }
  }], [{
    key: 'VERSION',
    get: function get() {
      return require('../package').version;
    }
  }, {
    key: 'MarkovChain',
    get: function get() {
      // load older MarkovChain
      return require('../older/index.js').MarkovChain;
    }
  }]);

  return MarkovChain;
})();

module.exports = MarkovChain;