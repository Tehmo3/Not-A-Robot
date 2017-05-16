# pick-one-by-weight
pick-one-by-weight chooses a key string from an `Object` based on the weight of its value against all other values in the `Object`

`Object` is what the type is called in javascript, but most commonly the structure we are looking into is called a HashMap or HashTable.

[![Build Status](https://travis-ci.org/swang/pick-one-by-weight.png?branch=master)](https://travis-ci.org/swang/pick-one-by-weight)

# install

```
npm install pick-one-by-weight
```

# examples

```js
var pickOneByWeight = require('pick-one-by-weight')
var p = { a: 2, b: 3, c: 5 }
console.log(pickOneByWeight(p))
// output is a 20% of the time, b 30% of the time, and c 50% of the time.
```

# development
First clone by doing: git clone
`git clone https://github.com/swang/pick-one-by-weight.git`

Then npm install with devDependencies.
`npm install --dev`

Then run babel-watch
`npm run babel-watch`

Note: If you want to use GitHub, you must fork this repo over to your account,
then change the git url from my repo to yours. You can then make commits to your
version, push the changes, and then make a Pull Request.

# license
ISC

# author
Shuan Wang (shuanwang@gmail.com)
