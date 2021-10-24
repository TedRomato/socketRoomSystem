# socketRoomSystem
# example:
## main.js:
``` js 
// initialize express and socket.io servers
const express = require('express')
const {Server} = require('socket.io')
const { createServer } = require('http')
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

// import socket-room-system module
const startRoomSystem = require('socket-room-system')
// import custom app constructor from game.js file (sample below)
const gameConstructor = require('./game.js')
// begin room system with arguments: custom app-contructor, io-server, express-app
startRoomSystem(gameConstructor, io, app)

//more express set-up
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('index.ejs')
})


httpServer.listen(5000 || process.env.PORT, () => {
    console.log('Server has started.')
})

```

## game.js:
``` js 
// app has to implement recieveData and onConnect function
// app has a function broadcast, which is added in room system layer
// be sure not to overrride it
module.exports = () => {
    return {
        leader: undefined,
        running: false,
        counter:0,
        interval:undefined,

        // gets called when new client joins room
        // client id is a uuid4 string
        onConnect: function(clientId){
            // if noone is connected make new client a leader
            if(this.leader) return
            this.leader = clientId
        },
        
        // gets called when room recieves data
        // clientId is sender uuid
        // in this example I differentiate between requests using data.type, but you can use any keyword (emit, message, command)
        recieveData: function(clientId, data){
            // on data.type 'startAutoAdd', if client issuing this command is a leader, and interval is not yet running
            // start interval, that adds one to counter and broadcasts new value
            if(data.type === 'startAutoAdd' && clientId === this.leader && !this.running){
                this.running = true
                this.interval = setInterval(() => {
                    this.counter += 1
                    // broadcasting message to everyone in room
                    this.broadcast({type: "counterChange", counter: this.counter})
                }, 1000)
            }
            // leader can stop interval
            if(data.type === 'stopAutoAdd' && clientId === this.leader && this.running){
                this.running = false
                clearInterval(this.interval)
            }
            // add one to counter and broadcast
            if(data.type === "add"){
                this.counter += 1
                this.broadcast({type: "counterChange", counter: this.counter})
            }
        }
    }
}
```

## index.js:
``` js 
import { client } from "/socketRoomSystem-Client/client.js"


$("#CreateRoom").on('click', () => {
    // client creates room, and joins it automatically
    client.createRoom()
})

client.on("room_created",(roomId) => {
    // createRoom callback -> roomId is uuid string of a new room 
    console.log("Created room with id: " + roomId)
})

$("#JoinRoom").on('click', () => {
    // client joins a room -> argument is a uuid of existing room
    client.joinRoom($("#JoinRoomId").val())
})

client.on("room_joined", (roomId) => {
    // joinRoom callback
    console.log("Joined room with id: " + roomId)
})

$("#GetRoomOptions").on('click', () => {
    console.log("room opt")
    // request room options
    client.getRoomOptions()
})

client.on("room_options", (data)=>{
    // getRoomOptions callback
    // data -> roomObject
    console.log(data)
})

client.on("room_state_changed", (data) => {
    // is triggered when room changes it's configuration 
    // data contain option, that was changed and new val ->  {option: "members", newVal: ["socketA","socketB","socketC"]}
    // triggered for example when someone joins a room
    console.log(data)
})

client.on('room_doesnt_exist', (room) => {
    console.log(`room with id ${room} doesn't exist`)
})





$("#AutoAdd").on('click', () => {
    // sendAppData passes data to your app on a server
    client.sendAppData({type: 'startAutoAdd'})
})

$("#StopAutoAdd").on('click', () => {
    client.sendAppData({type: 'stopAutoAdd'})
})

$("#Add").on('click', () => {
    client.sendAppData({type: 'add'})
})

// gets called on a broadcast from your app
client.on("app_data", (data) => {
    if(data.type === 'counterChange'){
        $("#Counter").text(JSON.stringify(data.counter))
    }
})


```
index.ejs:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js" defer></script>
    <!-- 
      Be sure to import "/socket.io/socket.io.js" and "/socketRoomSystem-Client/client.js",
      otherwise import {client} won't work. Also don't forget to change type to type="module".
     -->
    <script type="module" src="/socket.io/socket.io.js" defer></script>
    <script type="module" src="/socketRoomSystem-Client/client.js" defer></script>
    <script type="module" src="/index.js" defer></script> 
    <title>Document</title>
    
</head>
<body>
    <h1>Index</h1>
    <button id="CreateRoom">Create room</button>
    <br>
    <button id="JoinRoom">Join room</button>
    <input id="JoinRoomId"type="text">
    <br>
    <button id="GetRoomOptions">get room options</button>

    <br>
    <br>
    <br>
    <br>

    <button id="AutoAdd">auto add</button>
    <button id="StopAutoAdd">auto add</button>
    <button id="Add">add</button>
    <h1 id="Counter">0</h1>
</body>
</html>

```
