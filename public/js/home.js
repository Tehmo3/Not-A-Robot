
function main() {
  $('#addServer').click(function() {
    window.location.href = "https://discordapp.com/api/oauth2/authorize?client_id=286465720701943819&scope=bot&permissions=8";
  })
  $('#viewGithub').click(function() {
    window.location.href = "https://github.com/Tehmo3/Not-A-Robot";
  })
}


$(document).ready(main)
