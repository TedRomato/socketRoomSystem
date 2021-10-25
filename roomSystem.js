const createRoom  = require('./room.js')

/** 
 * Returns room system instance.
 * @param {function} appConstructor - The constructor function for the app.
 * @returns {Object} The instance of room system.
 */
module.exports = (appConstructor) => {
    return {
        rooms:[],
        appConstructor: appConstructor,
        /** 
         * Create a new room with the socket as a leader, and push it to rooms.  
         * @param {Object} socket - The founding socket io client.
         * @param {number} roomSize - A maximum number of socket.
         */
        createRoom: function(socket, roomSize = 2) {
            const room = createRoom(socket, this.appConstructor(), () => {"room is empty"}, roomSize)
            this.rooms.push(room)
            return {message: "room_created", data: room.id}
        },
        /** 
         * Get room with given id.
         * @param {string} roomId - Id of searched room.
         */
        getRoom: function(roomId) {
            for(const room of this.rooms) {
                if(room.id === roomId) return room
            }
        },
        // TODO: 
        leaveRoom: function(socket, roomId) {
            /*
            const room = this.getRoom(roomId)
            if(!room) return noRoomWithThisIdEmit(socket, roomId)
            room.disconnect(socket)
            */
        },
    }
}