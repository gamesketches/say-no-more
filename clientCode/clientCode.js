var socket = io();
let options = document.getElementById("options");
let textArea = document.getElementById("textArea");

socket.on('first-player-joined', function() {
  AddButtonIfNecessary("Start Game", "start-game");
  textArea.innerHTML = "Wait for your friends to join then we can start!";
  console.log("first player");
});

function AddButtonIfNecessary(buttonText, eventName) {
  let newButton = document.createElement("button");
  newButton.innerHTML = buttonText;
  options.appendChild(newButton);
  newButton.id = eventName;
  newButton.addEventListener("click", function() {
	  socket.emit(newButton.id);
  });
}
