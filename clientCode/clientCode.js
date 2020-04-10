var socket = io();
let initiator = false;
let options = document.getElementById("options");
let textArea = document.getElementById("textArea");
let playerInfo = {};

socket.on('first-player-joined', function() {
  AddButtonIfNecessary("Start Game", "start-game");
  textArea.innerHTML = "Welcome to Say No More! Click the start button when your friends have joined!";
  console.log("first player");
});

socket.on('player-joined', function(numPlayers) {
	console.log(numPlayers);
  textArea.innerHTML = textArea.innerHTML + " " + numPlayers + " are in";
});

socket.on('get-info', function(info) {
	playerInfo = info;
	console.log("got player info");
	console.log(info);
});

socket.on('new-round', function(args) {
	ClearButtons();
	textArea.innerHTML = args.scenario;
	for(let i = 0; i < args.hand.length; i++) {
		let responseArgs = {response: args.hand[i], playerId: playerInfo.id}
		AddButtonIfNecessary(args.hand[i], "response", responseArgs);
	}
});

socket.on('selection', function(args) {
	ClearButtons();
	textArea.innerHTML = "Pick a winner for this scenario: \n" + args.scenario;
	for(let i = 0; i < args.responses.length; i++) {
		AddButtonIfNecessary(args.responses[i].response, "pick-winner", args.responses[i].playerId);
	}
});

socket.on('round-win', function() {
	textArea.innerHTML = "You won the round! Great Job!";
});

socket.on('round-lose', function() {
	textArea.innerHTML = "You didn't win this one but you'll get it next time!";
});

function AddButtonIfNecessary(buttonText, eventName, args) {
  let newButton = document.createElement("button");
  newButton.innerHTML = buttonText;
  options.appendChild(newButton);
  newButton.addEventListener("click", function() {
	  socket.emit(eventName, args);
	  ClearButtons();
	  textArea.innerHTML = "Wait for a winner to be picked.";
  });
}

function ClearButtons(){
	Array.from(options.children).forEach((button) => {
		options.removeChild(button);
	});
}
