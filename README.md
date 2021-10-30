# Socket room system, serves as a middleware, for easy room(lobby) managment of socket(socket.io) connections. Uses Express and socket.io.

# Walkthrough
# Server side
## Server file set up. 
Here we set up our server (express and socket.io): \n(Right now you have to use express, but I'm planning on implementing other options)
``` js
// initialize express and socket.io servers
const express = require('express')
const {Server} = require('socket.io')
const { createServer } = require('http')
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

//more express set-up
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('index.html')
})


httpServer.listen(5000 || process.env.PORT, () => {
    console.log('Server has started.')
})
```

## Custom app
Next we have to configure our custom app constructor, to give rooms some functionality.
``` js 
const myVerySimpleAppConstructor = () => {

}
module.exports = myVerySimpleAppConstructor
```

Every room instance automaticaly adds broadcast function, that sends "app_data" emit with profvided data to all room members.
Every custom app has to implement following functions to allow for communications.
### App minimal requirements: 
Now let's configure our simple app construtor to meet the minimal requirements.
``` js
const myVerySimpleAppConstructor = () => {
    /**
     * This function is called when new user connects to the room. 
     * Is used to keep track of room members. 
     * @param {string} clientId - The id of client, that connected.
     */
    onConnect: (clientId){

    },
    /**
     * This function is called when new user connects to the room. 
     * Is used to keep track of room members. 
     * @param {string} clientId - The id of client, that sent the data.
     * @param {*} data - Data sent.
     */
    recieveData: (clientId, data){

    }
    //NOTE: I'm planning on adding onLeave as well + clientId might change into an object, with additional properties in the future.
}
module.exports = myVerySimpleAppConstructor
``` 
### Adding functionality
Now when we have the essentials out of the way, it's time to add our functionality.
We will make a really simple all chat app.
``` js
const myVerySimpleAppConstructor = () => {
    /**
     * This function is called when new user connects to the room. 
     * Is used to keep track of room members. 
     * @param {string} clientId - The id of client, that connected.
     */
    onConnect: (clientId){
        //we don't need to do anything here
    },
    /**
     * This function is called when new user connects to the room. 
     * Is used to keep track of room members. 
     * @param {string} clientId - The id of client, that sent the data.
     * @param {*} data - Data sent.
     */
    recieveData: (clientId, data){
        // When someone sends a message, we want to broadcast it to all users.
        // We are using the broadcast method, that is mentioned above.
        this.broadcast("new_message", {from:clientId, message:data})
    }
    //NOTE: I'm planning on adding onLeave as well + clientId might change into an object, with additional properties in the future.
}
module.exports = myVerySimpleAppConstructor
``` 

## Putting it together
``` js
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
const appConstructor = require('./path/to/your/constructor')
// begin room system with arguments: RoomOptions: {}, io-server, express-app
const socketRoomSystem = new SocketRoomSystem(system, io, app)
socketRoomSystem.start();


//more express set-up
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('index.html')
})


httpServer.listen(5000 || process.env.PORT, () => {
    console.log('Server has started.')
})
```
# Client side
I won't go in extremely in-depth on how to configure html and js files. So our app will only log all the messages into console.
### Src files.
Client is exposed at "/socketRoomSystem-Client/client.js".
Be sure to load socket.io as well.
``` html
<script type="module" src="/socket.io/socket.io.js" defer></script>
<script type="module" src="/socketRoomSystem-Client/client.js" defer></script>
<script type="module" src="/index.js" defer></script> 
```

First we import our client
``` js
import { client } from "/socketRoomSystem-Client/client.js"
```

We will need these functions: 
``` js
/**
 * Create new room. Triggers "room_created" event on success.
 * TODO: Possible only when not already connected.
 */
createRoom: function() {
    socket.emit("create_room")
},
/**
 * Create new room. Triggers "room_joined"|"room_not_found"|"already_member"|"room_is_full" events.
 * TODO: Possible only when not already connected.
 * @param {string} roomId - ID of room to connect to.
 */
joinRoom: function(roomId) {
    socket.emit("join_room", roomId)
},

/**
 * Send data to app.
 * @param {Object} data - App data. 
 */
sendAppData: function(data) {
    socket.emit("app_data", data)
},

/**
 * Listener function.
 * Full list of events can be found in the docs.
 * @param {string} event
 * @param {function} callback 
 */
on: function(event, callback) {
    socket.off(event)
    socket.on(event, data => callback(data))
}

```

Let's add that funtionality to index.js now.
``` js
import { client } from "/socketRoomSystem-Client/client.js"

//We will call this function when we want to create new rooms 
//(user presses createRoom button etc.) 
const createRoom = () => {
    client.createRoom()
}
// When room is created, this event fires
// Id of a new room is passed as an argument, provide it to other users to join this room.
client.on("room_created", (newRoomUuid) => console.log(newRoomUuid))

// We will call this function when we want to join room
// Id of a new room we want to join is passed as an argument.
const joinRoom = (roomId) => {
    client.joinRoom(roomId)
}
// When room is created, this event fires
// Id of joined is passed as an argument, provide it to other users to join this room.
client.on("room_joined", (newRoomUuid) => console.log(newRoomUuid))

//we eill call this function when we want to send message
const sendMessage = (message) => {
    client.sendAppData(message)
}

client.on("app_data", ({client, message}) => console.log(`User &{client} sent ${message}`))
```


You can check out demo project, if you want to see other socket room system in action.

