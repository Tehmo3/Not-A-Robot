<p align="center">
  <img src=http://i.imgur.com/KAG6MVo.png/>
</p>


# What does it do?
Not A Robot is a discord bot that reads through your chat logs and then uses markov chains to generate sentences from messages sent prior in your server.
### What commands does it have?
```
!help - Sends a message in the chat explaining what the bot is and what commands you can call.
!text <username> - Sends a message using messages from <username>s past.
!link <username> - Sends a link that <username> has sent in the past.
!song - Links a song from Soundcloud or Spotify that was previously linked in the chat.
!whosaidthat - Starts a quiz! The bot will send a message and you have to try and guess who sent it!
!wholinkedthat - Starts a quiz! The bot will send a link and you have to try and guess who sent it!
!advice - Sends a piece of worthwile life advice! Generated via http://inspirobot.me
!adminCommands - Are you an admin? Have a look at what you can do using this command!
!log - to log the messages from the chat (REQUIRED BEFORE ANY OTHER COMMANDS)
!disallowRole <role> - Disallow all users with the role <role> from using the bot
!allowRole <role> - Allows all users with the role <role> to use the bot. (Note this will only doing anything if the role has previously been excluded via !disallowRole)
!switchChannel <channel> - move the bot to another text channel, where it can then be used to !log again and use the text from that channel
```

# How do I install the bot?
1. Go to https://not-a-robot-discord.herokuapp.com/
2. Press 'ADD YOUR SERVER', log in, select your server from the drop down and press 'Authorize'.
3. Thats it! Now the bot is in your Discord server!

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
