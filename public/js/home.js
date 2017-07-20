
function main() {
  $('#addServer').click(function() {
    window.open("https://discordapp.com/api/oauth2/authorize?client_id=286465720701943819&scope=bot&permissions=8");
  })
}


$(document).ready(main)
