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