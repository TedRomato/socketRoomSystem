import emits from "./emits.js"
const socket = io()



export const client = {
    createRoom: function() {
        socket.emit(emits.clientToServer.createRoom)
    },
    joinRoom: function(roomId) {
        socket.emit(emits.clientToServer.joinRoom, roomId)
    },
    getRoomOptions: function(){
        socket.emit(emits.clientToServer.getRoomOptions)
    },/*
    changeRoomOption: function(proprety, value){
        socket.emit(emits.clientToServer.changeRoomOption, proprety, value)
    },
    kick: function(id) {
        socket.emit(emits.clientToServer.kick, id)
    },*/
    sendAppData: function(data) {
        socket.emit(emits.clientToServer.appData, data)
    },
    on: function(event, callback) {
        socket.off(event)
        socket.on(event, data => callback(data))
    }
} 