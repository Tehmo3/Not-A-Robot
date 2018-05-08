module.exports = function userToID(username, guild) {
  return guild.members.find(member => checkForID(member, username) ).id;
}

function checkForID(member, username) {
  console.log(username);
  const nickMatch = member.nickname == username;
  const userMatch = member.user.username == username;
  return nickMatch || userMatch;
}
