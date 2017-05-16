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
```

# How to use
1. Navigate [here](https://discordapp.com/developers/applications/me) and create a new app, make sure to name it and give it a basic description!.
2. Create a bot user by pressing 'Create a bot user', make sure to copy your client ID.
3. Go to https://discordapp.com/oauth2/authorize?client_id=CLIENT_ID_GOES_HERE&scope=bot&permissions=0 and insert your client ID into the url.
4. Select your server and press authorize.
5. Next navigate to where you downloaded the bot in cmd/terminal and run the command `npm install` (make sure you have [node](https://nodejs.org/en/) installed!).
6. Edit the config.js file to set the bot up according to your settings, make sure you include your app bot user token or the bot wont work at all.
7. Go into /node_modules/markov-chain-text/src/index.js and change DEFAULT_MAX_OVERLAP_RATIO to 1 and DEFAULT_MAX_OVERLAP_TOTAL to some large number, I have mine on 150000.
8. Then go into /node_modules/markov-chain-text and run `npm install` and then `npm run build`
9. Run the command `npm bot.js` and that's it! The bot should now work in your server!


### Sample config.js
```
{
    "token": "DISCORD_TOKEN_HERE", //Your discord app bot user token
    "channel": "general other_channel_here", //Channels to accept calls from
    "max_messages": 8160, //Maximum number of messages to read in
    "admins": "YOUR_USERNAME OTHER_ADMINS_USERNAME", //Usernames of users allowed to use !log command
    "blacklist": "Normies" //A role that will not be allowed to use the bot
}
```
