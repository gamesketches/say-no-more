const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const contentManager = require('./contentManager');


let numPlayers = 0;
let participants = [];
let curScenario = "";
let responses = [];

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
	} else {
		console.log(numPlayers);
		socket.broadcast.emit('player-joined', numPlayers);
	}
});

function AddEventHandlers(socket) {
	socket.on('disconnect', function() {
		console.log('user disconnected');
		numPlayers--;
	});
	socket.on('start-game', function() {
		console.log("Got start game event");
		NewEventPrompt();
	});
	socket.on('response', function(args) {
		console.log("received response: ");
		console.log(args);
		responses.push(args);
		let selectionPrompt = {scenario: curScenario, responses:responses};
		if(responses.length == numPlayers) {
			participants[0].socket.emit('selection', selectionPrompt);
		} else {
			console.log(responses.length);
			console.log(numPlayers);
			console.log("waiting on someone");
		}
	});	
	socket.on('pick-winner', function(args) {
		console.log("picked winner " + args);
	});
}

function AddNewParticipant(newPlayerSocket) {
	let newHand = DrawHand();
	participants.push({id:numPlayers - 1, hand: newHand, responded: false, score:0, socket:newPlayerSocket});
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
	curScenario = contentManager.DrawScenarioCard(0);
	participants.forEach(function(player) {
		let args = {scenario:curScenario, hand:DrawHand()};
		player.socket.emit('new-round',args);
	});
}
