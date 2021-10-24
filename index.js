const express =  require("express")
const createRoomSystem = require('./roomSystem.js')

module.exports = (appConstructor, io, app) => {
    const path = __dirname + "/socketRoomSystem-Client"
    app.use(express.static(path))
    const roomSystem = createRoomSystem(appConstructor)
    
    io.on("connection", (socket) => {
        //connection stage
        socket.on("create_room", (roomSize = 2) => {
            const status = roomSystem.createRoom(socket, roomSize)
            socket.emit(status.message, status?.data)
        })

        socket.on("join_room", (roomId) => {
            const room = roomSystem.getRoom(roomId)
            if(!room) return socket.emit("room_doesnt_exist", roomId)
            const status = room.connect(socket)
            socket.emit(status.message, status?.data)
            if(status.message === "room_joined_succesfully"){
                room.broadcast(
                    "room_state_changed", 
                    {option: "members", newVal: room.members.map(socket => socket.id)}
                )
            }
        })


        //room stage
        socket.on("get_room_options", () => {
            const room = roomSystem.getRoom(socket.data.roomId)
            if(!room) return socket.emit("room_doesnt_exist")
            const options = room.getRoomOptions(socket)
            socket.emit("room_options", options)
        })

        socket.on("leave_room", () => {
            const room = roomSystem.getRoom(socket.roomId)
            if(!room) return socket.emit("room_options")
            const status = room.leave(socket, () => {
                 room.broadcast(
                    "room_state_change",
                    {option: "members", newVal: room.members.map(socket => socket.id)}
                )
            })
            socket.emit(status.message, status?.data)
            room.broadcast("room_state_change", {option: members, newVal: room.members.map(socket => socket.id)})
        })

        socket.on("change_room_option", (proprety, value) => {
            roomSystem.changeRoomOption(socket, value, proprety)
            
        })

        socket.on("kick", (id) => {
            roomSystem.kick(socket, id)
        })


        //run stage
        socket.on("app_data", (data) => {
            const room = roomSystem.getRoom(socket.data.roomId)
            if(!room) return socket.emit("app_data")
            room.recieveData(socket, data)
        })
    })
}