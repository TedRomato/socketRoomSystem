// initialize express and socket.io servers
const express = require('express')
const {Server} = require('socket.io')
const { createServer } = require('http')
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

// import socket-room-system module
const {SocketRoomSystem} = require('socket-room-system')
// import custom app constructor from game.js file (sample below)
const gameConstructor = require('./game.js')
// begin room system with arguments: RoomOptions: {}, io-server, express-app
const socketRoomSystem = new SocketRoomSystem(gameConstructor, io, app)

//more express set-up
app.use(express.static('public'))
socketRoomSystem.start();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})


httpServer.listen(5000 || process.env.PORT, () => {
    console.log('Server has started.')
})