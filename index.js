const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const contentManager = require('./contentManager');


let numPlayers = 0;
let participants = [];

app.get('/', function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

io.on('connection', function(socket) {
	AddEventHandlers(socket);
	numPlayers++;
	console.log('a user connected, making ' + numPlayers);
	AddNewParticipant(socket);
	if(numPlayers == 1) {
		socket.emit('first-player-joined');
	} else {
		socket.broadcast.emit('player-joined');
	}
});

function AddEventHandlers(socket) {
	socket.on('disconnect', function() {
		console.log('user disconnected');
		numPlayers--;
	});
	socket.on('start-game', function() {
		console.log("Got start game event");
	});
		
}

function AddNewParticipant(newPlayerSocket) {
	let newHand = DrawHand();
	participants.push({id:numPlayers - 1, hand: newHand, responded: false, score:0, socket:newPlayerSocket});
}

function DrawHand() {
}

http.listen(3000, function() {
	console.log("listening on port 3000");
});
