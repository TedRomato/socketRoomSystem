import express from "express"
import createRoomSystem from './roomSystem.js'
import emits from './socketRoomSystem-Client/socketRoomSystem-Client/emits.js'
import path from 'path'


export default (appConstructor, io, app) => {
    const path = import.meta.url.replace("index.js", "").replace("file:///", "") + "socketRoomSystem-Client"
    app.use(express.static(path))
    const roomSystem = createRoomSystem(appConstructor)
    
    io.on("connection", (socket) => {
        //connection stage
        socket.on(emits.clientToServer.createRoom, (roomSize = 2) => {
            console.log("Creating room ...");
            const status = roomSystem.createRoom(socket, roomSize)
            socket.emit(status.message, status?.data)
            console.log(roomSystem);
        })

        socket.on(emits.clientToServer.joinRoom, (roomId) => {
            console.log("Joining room ...");
            const room = roomSystem.getRoom(roomId)
            if(!room) return socket.emit(emits.serverToClient.roomDoesntExist, roomId)
            const status = room.connect(socket)
            socket.emit(status.message, status?.data)
            if(status.message === emits.serverToClient.roomJoined){
                room.broadcast(
                    emits.serverToClient.roomStateChange, 
                    {option: "members", newVal: room.members.map(socket => socket.id)}
                )
            }
            console.log(room.members.map(socket => socket.id));
        })


        //room stage
        socket.on(emits.clientToServer.getRoomOptions, () => {
            const room = roomSystem.getRoom(socket.data.roomId)
            if(!room) return socket.emit(emits.serverToClient.roomDoesntExist)
            const options = room.getRoomOptions(socket)
            socket.emit(emits.serverToClient.roomOptions, options)
        })

        socket.on(emits.clientToServer.leaveRoom, () => {
            const room = roomSystem.getRoom(socket.roomId)
            if(!room) return socket.emit(emits.serverToClient.roomDoesntExist)
            const status = room.leave(socket, () => {
                 room.broadcast(
                    emits.serverToClient.roomStateChange,
                    {option: "members", newVal: room.members.map(socket => socket.id)}
                )
            })
            socket.emit(status.message, status?.data)
            room.broadcast(emits.serverToClient.roomStateChange, {option: members, newVal: room.members.map(socket => socket.id)})
        })

        socket.on(emits.clientToServer.changeRoomOption, (proprety, value) => {
            roomSystem.changeRoomOption(socket, value, proprety)
            
        })

        socket.on(emits.clientToServer.kick, (id) => {
            roomSystem.kick(socket, id)
        })


        //run stage
        socket.on(emits.clientToServer.appData, (data) => {
            const room = roomSystem.getRoom(socket.data.roomId)
            if(!room) return socket.emit(emits.serverToClient.roomDoesntExist)
            room.recieveData(socket, data)
        })
    })
}