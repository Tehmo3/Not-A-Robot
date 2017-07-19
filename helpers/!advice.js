const request = require('request');



function sendAdvice(channel) {
  request('http://inspirobot.me/api?generate=true', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      botPayload.text = "@" + req.body.user_name + ": " + req.body.command + " " + body;
      // send Payload
      channel.sendMessage(response)
      .then(message => console.log(`Sent message: ${message.content}`))
      .catch(console.error);
    }
    else {
      channel.sendMessage("```ERROR```")
      .then(message => console.log(`Sent message: ${message.content}`))
      .catch(console.error);
    }
  });
}

module.exports = sendAdvice;
