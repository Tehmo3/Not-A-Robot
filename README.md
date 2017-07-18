<p align="center">
  <img src=http://i.imgur.com/KAG6MVo.png/>
</p>


# What does it do?
Not A Robot is a discord bot that reads through your chat logs and then uses markov chains to generate sentences from messages sent prior in your server.
### What commands does it have?
```
!help - Sends a message in the chat explaining what the bot is and what commands you can call.
!log - Reads through your entire chat logs and saves a file called textLogs.json used to store the messages.
!text <username> - Sends a message using messages from <username>s past.
!link <username> - Sends a link that <username> has sent in the past.
!song - Links a song from Soundcloud or Spotify that was previously linked in the chat.
!whosaidthat - Starts a quiz! The bot will send a message and you have to try and guess who sent it!
!wholinkedthat - Starts a quiz! The bot will send a link and you have to try and guess who sent it!
```

# How do I install the bot?
1. Navigate [here](https://discordapp.com/developers/applications/me) and create a new app, make sure to name it and give it a basic description!.
2. Create a bot user by pressing 'Create a bot user', make sure to copy your client ID.
3. Go to https://discordapp.com/oauth2/authorize?client_id=CLIENT_ID_GOES_HERE&scope=bot&permissions=0 and insert your client ID into the url.
4. Select your server and press authorize.
5. Edit the config.js file to set the bot up according to your settings, make sure you include your app bot user token or the bot wont work at all. Make sure to keep the syntax the same!
6. Run the command `node bot.js` and that's it! (note: you must have [node](https://nodejs.org/en/) installed) The bot should now work in your server!

note: I chose to include node_modules due to a small change I made in the `markov-chains-text` npm package, therefore, running `npm install` will break the bot.

### Sample config.js
```
{
    "token": "DISCORD_TOKEN_HERE", //Your discord app bot user token
    "channel": "general other_channel_here", //Channels to accept calls from
    "admins": "admin1ID admin2ID", //ID's of users allowed to use !log command. For instructions see
    "blacklist": "Normies" //A role that will not be allowed to use the bot
}
```
note: to find User ID see [HERE](https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)
