const socket = io()



export const client = {
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
     * Get room options. Triggers "room_not_found"|"room_options" events.
     */
    getRoomOptions: function(){
        socket.emit("get_room_options")
    },
    //TODO:
    /*
    changeRoomOption: function(proprety, value){
        socket.emit(emits.clientToServer.changeRoomOption, proprety, value)
    },
    kick: function(id) {
        socket.emit(emits.clientToServer.kick, id)
    },*/

    /**
     * Send data to app.
     * @param {Object} data - App data. 
     */
    sendAppData: function(data) {
        socket.emit("app_data", data)
    },

    /**
     * Listener function.
     * @param {string} event
     * @param {function} callback 
     */
    on: function(event, callback) {
        socket.off(event)
        socket.on(event, data => callback(data))
    }
} 