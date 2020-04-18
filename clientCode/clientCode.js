var socket = io();
let initiator = false;
let options = document.getElementById("options");
let textArea = document.getElementById("textArea");
let playerInfo = {};
let host = false;

socket.on('first-player-joined', function() {
  ClearButtons();
  host = true;
  AddButton("Start Game", "start-game", null, function() { 
			textArea.innerHTML = "Ensure there are enough players";
		    socket.emit("start-game");
			});
  textArea.innerHTML = "Welcome to Say No More! Click the start button when your friends have joined!";
});

socket.on('player-joined', function(numPlayers) {
	console.log(numPlayers);
	if(host) {
    	textArea.innerHTML = textArea.innerHTML + "\n" + numPlayers + " have joined";
	} else {
		textArea.innerHTML = "There are currently " + numPlayers + " in the game. We'll start soon!";
	}
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
		AddButton(args.hand[i], "response", responseArgs);
	}
});

socket.on('selection', function(args) {
	ClearButtons();
	textArea.innerHTML = "Pick a winner for this scenario: \n" + args.scenario;
	for(let i = 0; i < args.responses.length; i++) {
		AddButton(args.responses[i].response, "pick-winner", args.responses[i].playerId);
	}
});

socket.on('round-win', function() {
	textArea.innerHTML = "You won the round! Great Job!";
	AddButton("Start next round", "next-round");
});

socket.on('round-lose', function() {
	textArea.innerHTML = "You didn't win this one but you'll get it next time!";
});

function AddButton(buttonText, eventName, args, callBack) {
  let newButton = document.createElement("button");
  newButton.innerHTML = buttonText;
  options.appendChild(newButton);
  if(callBack == null) {
	  newButton.addEventListener("click", function() {
		  socket.emit(eventName, args);
		  ClearButtons();
		  textArea.innerHTML = "Wait for a winner to be picked.";
	  });
	} else {
	  newButton.addEventListener("click",callBack);
	} 
}

function ClearButtons(){
	Array.from(options.children).forEach((button) => {
		options.removeChild(button);
	});
}
