var socket = io();
let initiator = false;
let options = document.getElementById("options");
let textArea = document.getElementById("textArea");

socket.on('first-player-joined', function() {
  AddButtonIfNecessary("Start Game", "start-game");
  textArea.innerHTML = "Welcome to Say No More! Click the start button when your friends have joined!";
  console.log("first player");
});

socket.on('player-joined', function(numPlayers) {
	console.log(numPlayers);
  textArea.innerHTML = textArea.innerHTML + " " + numPlayers + " are in";
});

socket.on('new-round', function(args) {
	ClearButtons();
	textArea.innerHTML = args.scenario;
	for(let i = 0; i < args.hand.length; i++) {
		AddButtonIfNecessary(args.hand[i], "response", args.hand[i]);
	}
});

function AddButtonIfNecessary(buttonText, eventName, args) {
  let newButton = document.createElement("button");
  newButton.innerHTML = buttonText;
  options.appendChild(newButton);
  newButton.id = eventName;
  newButton.addEventListener("click", function() {
	  socket.emit(newButton.id);
  });
}

function ClearButtons(){
	Array.from(options.children).forEach((button) => {
		options.removeChild(button);
	});
}
