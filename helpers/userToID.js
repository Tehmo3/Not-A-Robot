module.exports = function userToID(username, guild) {
  return guild.members.find(member => member.nickname === username ).id;
}
