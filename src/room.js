const { v4: uuidv4 } = require('uuid');
const {Status} = require('./status.js')

/**
 * Room class, manages user connections, and user communication with app, so app doesn't need to implement any socket/room_managment logic.
 */

class Room{
    
    /**
     * Creates a new instance of Room.
     * @param {Object} socket - Founding socket. 
     * @param {number} maxMembers - Max number of members, that can be present in a room.
     * @param {Object} app - Custom app, determines behaviour of a room. App has to implement onConnect, and recieveData methods, otherwise error is thrown.
     * @param {Function} onRoomIsEmpty - Callback function called, when a room gets empty. 
     * @param {Function} onLeaderLeave - Callback function called, when leader leaves a room.
     */
    constructor(socket, app, maxMembers, onRoomIsEmpty, onLeaderLeave){
        /**
         * @property {string} id - Unique identifier of room.
         */
        this.id = uuidv4()
        /**
         * @property {Object} roomLeader - socket.io socket with expanded permissions (kick, change settings etc.).
         */
        this.roomLeader = socket
        /**
         * @property {Array<Object>} members - socket.io sockets array, constaining all connected clients.
         */
        this.members = [socket]
        /**
         * @property {number} maxMembers - Maximum number of connected clients.
         */
        this.maxMembers = maxMembers
        /**
         * @property {Object} app - Custom app, determines behaviour of a room. App has to implement onConnect, and recieveData methods, otherwise error is thrown.
         */
        this.app = app
        /**
         * @property {Function} onRoomIsEmpty - Callback function called, when room gets empty. 
         */
        this.onRoomIsEmpty = onRoomIsEmpty
        /**
         * @property {Function} onLeaderLeave - Callback function called, when leader leaves a room.
         */
        this.onLeaderLeave = onLeaderLeave


        //check if app has required propreties
        if(!this.app.onConnect) throw new Error("App doesn't provide mandatory function - onConnect.")
        if(!this.app.recieveData) throw new Error("App doesn't provide mandatory function - recieveData.")

        this.app.broadcast = (data) => {
            this.broadcast("app_data", data);
        };

        //connect founding socket
        this.app.onConnect(this.roomLeader.id);
        this.roomLeader.data.roomId = this.id;
    }

    /**
     * Gets called, when a socket connects succesfully. 
     * Calls app.onConnect(socket.id) with socket id as a parameter, letting app know that a new member has joined. 
     * Sets socket.data.id to room id , retaining this information for future emits.
     * @param {Object} socket - Connecting socket. 
     * @returns {void}
     */

    onConnect(socket) {
        // call app onConnect function 
        this.app.onConnect(socket.id);
        // set socket io data.roomId for future request to server 
        socket.data.roomId = this.id;
    }

    /**
     * Try to connect socket to this room 
     * @param {Object} socket - Connecting socket. 
     * @returns {Status} Status object. Data property contains room.id.
     */
    connect(socket) {
        //check if socket is already connected
        for (const memberSocket of this.members) {
            if (memberSocket === socket) {
                return new Status("already_member", this.id);
            }
        }
        //check if room is full
        if (this.members.length >= this.maxMembers) {
            return new Status("room_is_full", this.id );
        }
        //connect socket
        this.members.push(socket);
        this.onConnect(socket);
        return new Status("room_joined", this.id );
    }
    /**
     * No implemented yet.
     * Called when member leaves. 
     * Calls app.onLeave(socket.id) with socket id as a parameter, letting app know that a new member has left. 
     * @param {Object} socket - Socket, that disconnected.
     * @returns {void}
     */
    onLeave(socket) {
        this.app.onLeave(socket.id);
    }


    /**
     * No implemented yet.
     * Disconnect socket from this room.
     * Removes socket from members array. Calls this.onRoomIsEmpty() if no members are left. Calls this.onLeaderLeave() when leader leaves. 
     * @param {Object} socket - Socket, that should disconnect.
     * @returns {Status} Status object with no data property. 
    */
    leave(socket) {
        //remove from member
        this.members.splice(this.members.indexOf(socket), 1);
        if (members.length === 0)
            this.onRoomIsEmpty();

        if (this.roomLeader === socket) {
            this.roomLeader = this.members[0];
            this.onLeaderLeave();
        }
        this.onLeave(socket);
        return new Status("room_left" );

    }

    /**
     * This function is assigned to app.broadcast to enable app to send data to all of it's members. -> this.app.broadcast = (data) => {room.broadcast("app_data", data)}
     * @param {string} emit - Emit name.
     * @param {*} data - Data sent.
     */
    broadcast(emit, data) {
        for (const memberSocket of this.members) {
            this.roomLeader.to(memberSocket.id).emit(emit, data);
        }
        this.roomLeader.emit(emit, data);
    }
    
    /**
     * This function gets called when data for app arrive. Calls this.app.recieveData(senderId, data).
     * @param {Object} socket - Socket, that sent data. 
     * @param {*} data - Arriving data.
     */
    recieveData(socket, data) {
        this.app.recieveData(socket.id, data);
    }


    /**
     * Returns all relevant propreties of a this room in an object.
     * @returns {Object} {id, roomLeader, members, maxMembers}
     */
    getRoomOptions() {
        const id = this.id;
        const roomLeader = this.roomLeader.id;
        const members = this.members.map(socket => socket.id);
        const maxMembers = this.maxMembers;
        return {
            id: id,
            roomLeader: roomLeader,
            members: members,
            maxMembers: maxMembers
        };
    }
}




module.exports = {Room};