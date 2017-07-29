function main() {
  $('#addServer').click(function () {
    window.location.href = "https://discordapp.com/api/oauth2/authorize?client_id=337942390608232448&scope=bot&permissions=68608";
  });
  $('#viewGithub').click(function () {
    window.location.href = "https://github.com/Tehmo3/Not-A-Robot";
  });
}


$(document).ready(main);
