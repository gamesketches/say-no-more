const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const contentManager = require('./contentManager');


let gameStatus = "idle";
let numPlayers = 0;
let participants = [];
let curScenario = "";
let responses = [];
let picker = 0;
let winThreshold = 2;

app.get('/', function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

app.use(express.static('clientCode'));

io.on('connection', function(socket) {
	AddEventHandlers(socket);
	numPlayers++;
	console.log('a user connected, making ' + numPlayers);
	AddNewParticipant(socket);
	if(numPlayers == 1) {
		socket.emit('first-player-joined');
		picker = participants[0].id;
	} else {
		console.log(numPlayers);
		io.emit('player-joined', numPlayers);
	}
});

function AddEventHandlers(socket) {
	socket.on('disconnect', function() {
		console.log('user disconnected');
		numPlayers--;
		for(let i = 0; i < participants.length; i++) {
			if(participants[i].socket == socket){
				console.log("found my guy");
				if(participants[i].id == picker) {
					PickNewPicker()
					if(gameStatus == "idle") {
						GetPlayerById(picker).socket.emit('first-player-joined');
					}
				}
				participants.splice(i,1);
			}
		};
		if(numPlayers == 0) {
			participants = [];
			responses = [];
			picker = 0;
		}
	});
	socket.on('start-game', function() {
		console.log("Got start game event");
		gameStatus = "playing";
		if(numPlayers > 1) {
			NewEventPrompt();
		}
	});
	socket.on('response', function(args) {
		console.log("received response: ");
		responses.push(args);
		let selectionPrompt = {scenario: curScenario, responses:responses};
		GetPlayerById(args.playerId).responded = true;
		if(CheckAllResponded()) {
			GetPlayerById(picker).socket.emit('selection', selectionPrompt);
		} 
	});	
	socket.on('pick-winner', function(args) {
		console.log("picked winner " + args);
		for(let i = 0; i < participants.length; i++) {
			if(participants[i].id == args) {
				participants[i].score += 1;
				if(participants[i].score >= winThreshold) {
					participants[i].socket.emit('game-win');
					participants[i].socket.broadcast.emit('game-lose');
					return;
				} else {
					participants[i].socket.emit('round-win');
					participants[i].socket.broadcast.emit('round-lose');
				}
			}
			participants[i].response = "";
			participants[i].responded = false;
		}
		responses = [];
	});
	socket.on('next-round', function() {
		NewEventPrompt();
	});
}

function AddNewParticipant(newPlayerSocket) {
	let newHand = DrawHand();
	let newParticipant = {id:GenerateNewID(), hand: newHand, responded: false, score:0,
																 socket:newPlayerSocket};
	participants.push(newParticipant);
	newPlayerSocket.emit('get-info', {id:newParticipant.id});
}

function DrawHand() {
	let newHand = [];
	for(let i = 0; i < 5; i++) {
		let newCard = contentManager.DrawReactionCard();
		while(newHand.indexOf(newCard) > -1) {
			newCard = contentManager.DrawReactionCard();
		}
		newHand.push(newCard);
	}
	return newHand;
}

http.listen(3000, function() {
	console.log("listening on port 3000");
});

function NewEventPrompt(){
	PickNewPicker();
	curScenario = contentManager.DrawScenarioCard(0);
	participants.forEach(function(player) {
		if(player.id != picker) {
			let args = {scenario:curScenario, hand:DrawHand()};
			player.socket.emit('new-round',args);
		}
	});
}

function CheckAllResponded(){
     for(let i = 0; i < participants.length; i++) {
         if(participants[i].id != picker && !participants[i].responded) {
             console.log("someone hasn't responded!");
			 console.log(participants[i].id);
			 return false;
         }
     }
	return true;
}

function PickNewPicker() {
	console.log("In PickNewPicker");
	if(participants.length == 1) return;
	console.log("Participant length check is throwing??");
	for(let i = 0; i < participants.length; i++) {
         if(participants[i].id == picker) {
             if(i + 1 == participants.length) {
                 picker = participants[0].id;
				console.log("picker is player number: " + picker);
             } else {
                 picker = participants[i+1].id;
			 	 console.log("picker is player number: " + picker);
                 return;
             }
         }
     }
 }

function GetPlayerById(playerId) {
	for(let i = 0; i < participants.length; i++) {
		if(participants[i].id === playerId) {
			return participants[i];
		}
	}
}

function GenerateNewID() {
	let baseNumber = Math.random() * 10000;
	console.log("Generated playerID: " + Math.floor(baseNumber));
	return Math.floor(baseNumber);
}
	
