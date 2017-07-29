const request = require('request');



function sendAdvice(channel) {
  request('http://inspirobot.me/api?generate=true', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // send Payload
      channel.send(response.body)
      .then(message => console.log(`Sent message: ${message.content}`))
      .catch(console.error);
    }
    else {
      channel.send("```ERROR```")
      .then(message => console.log(`Sent message: ${message.content}`))
      .catch(console.error);
    }
  });
}

module.exports = sendAdvice;
