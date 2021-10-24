const socket = io()



export const client = {
    createRoom: function() {
        socket.emit("create_room")
    },
    joinRoom: function(roomId) {
        socket.emit("join_room", roomId)
    },
    getRoomOptions: function(){
        socket.emit("get_room_options")
    },/*
    changeRoomOption: function(proprety, value){
        socket.emit(emits.clientToServer.changeRoomOption, proprety, value)
    },
    kick: function(id) {
        socket.emit(emits.clientToServer.kick, id)
    },*/
    sendAppData: function(data) {
        socket.emit("app_data", data)
    },
    on: function(event, callback) {
        socket.off(event)
        socket.on(event, data => callback(data))
    }
} 