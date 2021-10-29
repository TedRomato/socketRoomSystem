const  {Room} = require('./room.js')
const {Status} = require('./status.js')


/**
 * RoomSystem class, manages multiple rooms, and passes incoming data to correct room. 
 */

class RoomSystem{
    /**
     * Create new RoomSystem instance.
     * @param {Function} appConstructor - App constructor. Keep in mind, custom app must implement onConnect, and recieveData methods.
     */
    constructor(appConstructor){
        /**
         * @property {Array<Room>} rooms - Array of all [rooms]{@link Room} in a [room system]{@link RoomSystem}.
         */
        this.rooms = []
        /**
         * @property {Function} appConstructor - App constructor. Should implement onConnect, and recieveData methods.
         */
        this.appConstructor = appConstructor
    }
    /**
     * Creates and adds a new [room]{@link Room} to this [room system]{@link RoomSystem}. Makes a socket that made, the request a [room leader]{@link Room#roomLeader}. 
     * @param {Object} socket - Founding socket.io socket. 
     * @param {number} maxMembers - Maximum room size. 
     * @returns {Status} Status message, with {string} created room id as a data.
     */
    createRoom(socket, maxMembers = 2) {
        const room = new Room(socket, this.appConstructor(), () => {"room is empty"}, maxMembers)
        this.rooms.push(room)
        return new Status("room_created", room.id)
    }
    /**
     * Finds and returns [room]{@link Room} with matching [room id]{@link Room#id} or null if it doesn't exist'.
     * @param {srting} roomId 
     * @returns {Room|null} 
     */
    getRoom(roomId) {
        for(const room of this.rooms) {
            if(room.id === roomId) return room
        }
        return null
    }
    /**
     * Not implemented.
     */
    leaveRoom() {
        //const room = this.getRoom(roomId)
        //if(!room) return noRoomWithThisIdEmit(socket, roomId)
        //room.disconnect(socket)
    }

}


module.exports = {RoomSystem};