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
    	textArea.innerHTML = "Click the start button when your friends have joined!" + "\n" + numPlayers + " have joined";
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

socket.on('new-round-picker', function() {
	ClearButtons();
	textArea.innerHTML = "You'll be picking the response this round, hang tight!"
});

socket.on('selection', function(args) {
	ClearButtons();
	textArea.innerHTML = "Pick a winner for this scenario: \n" + args.scenario;
	for(let i = 0; i < args.responses.length; i++) {
		AddButton(args.responses[i].response, "pick-winner", args.responses[i].playerId);
	}
});

socket.on('custom-scenario', function() {
	ClearButtons();
	/*let textInput = document.createElement("INPUT");
	textInput.setAttribute("type", "text");
	textInput.setAttribute("placeholder", "Write about your experience here...");*/
	AddTextInput("Write about your experience here...");
	textArea.innerHTML = "You won the last round, nice job! Think describe a dating scenario you struggled with in the past";
	//options.appendChild(textInput);
	AddButton("Submit", "custom-scenario-entered", null, function() {
		socket.emit("custom-scenario-entered", options.childNodes[0].value);
		ClearButtons();
		textArea.innerHTML = "Let's see what everyone thinks";
	});
});

socket.on('custom-response', function(args) {
	ClearButtons();
	textArea.innerHTML = "How would you say NO to the following scenario?" + args.scenario;
	AddTextInput("Write how you would say no");
	AddButton("Submit", "custom-scenario-entered", null, function() {
		let responseArgs = {response: options.childNodes[0].value, playerId: playerInfo.id}
		socket.emit("response", responseArgs);
		ClearButtons();
		textArea.innerHTML = "Let's see what everyone thinks";
	});
});
	
socket.on('round-win', function() {
	textArea.innerHTML = "You won the round! Great Job!";
	AddButton("Start next round", "next-round");
});

socket.on('round-lose', function() {
	textArea.innerHTML = "You didn't win this one but you'll get it next time!";
});

socket.on('game-win', function() {
	console.log("Won the game");
	textArea.innerHTML = "You won the game, congratulations!!!" + "<br>" + "Thanks for playing Say No More!";
});

socket.on('game-lose', function() {
	textArea.innerHTML = "The game is over!" + "<br>" + "Thanks for playing Say No More!";
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

function AddTextInput(placeholder) {
	let textInput = document.createElement("INPUT");
	textInput.setAttribute("type", "text");
	textInput.setAttribute("placeholder", placeholder);
	options.appendChild(textInput);
	return textInput;
}

function ClearButtons(){
	document.getElementById("rulesArea").innerHTML = "";
	Array.from(options.children).forEach((button) => {
		options.removeChild(button);
	});
}
