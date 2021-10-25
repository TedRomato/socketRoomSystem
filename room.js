const { v4: uuidv4 } = require('uuid');


/**
 * Creates instance of room. 
 * @param {Object} socket - Socket io client.
 * @param {Object} app - Custom app.
 * @param {function} roomIsEmpty - callback when room gets empty.
 * @param {number} roomSize - Max room size.
 * @returns {Object} Returns instance of room.
 */

module.exports = (socket, app, roomIsEmpty, roomSize = 2) => {
    const room = {
        id: uuidv4(),
        roomLeader: socket,
        members: [socket],
        maxMembers: roomSize,
        app: app,
        /** 
         * This function is called on new client connection.
         * @param {Object} socket - Socket io client. 
         */
        onConnect:function(socket){
            // call app onConnect function 
            this.app.onConnect(socket.id)
            // set socket io data.roomId for future request to server 
            socket.data.roomId = this.id
        },
        /**
         * This function connects a new client to this room.
         * @param {Object} socket - Socket io client.  
         * @returns {Object} Returns status object {message:/status message/, data:/this room id/}
         */
        connect: function(socket) {
            //check if socket is already connected
            for(const memberSocket of this.members) {
                if(memberSocket === socket){
                    return {message: "already_member", data:this.id}
                }
            }
            //check if room is full
            if(this.members.length >= this.maxMembers) {
                return {message: "room_is_full", data:this.id}
            }
            //connect socket
            this.members.push(socket)
            this.onConnect(socket)
            return {message: "room_joined", data:this.id}
        },
        onLeave: function(socket){
            this.app.onLeave(socket.id)
        },
        /**
         * This function removes socket from room.
         * @param {Object} socket - Socket io client. 
         * @param {function} onLeaderLeave - Callback function, that gets called, when room leader leaves.  
         * @returns {Object} Returns status object {message:/status message/}
         */

        //TODO 
        leave: function(socket, onLeaderLeave){
            //remove from member
            this.members.splice(this.members.indexOf(socket), 1)
            if(members.length === 0) roomIsEmpty()

            if(this.roomLeader === socket) {
                this.roomLeader = this.members[0]
                onLeaderLeave()
            }
            this.onLeave(socket)
            return {message: "room_left"}

        },

        /**
         * Send data to all connected members.
         * @param {string} emit 
         * @param {Object} data 
         */
        broadcast: function(emit,data){
            for(const memberSocket of this.members){
                socket.to(memberSocket.id).emit(emit, data)
            }
            socket.emit(emit, data)
        },
        /**
         * Forward data to app. 
         * @param {Object} socket - Socket io client. 
         * @param {Object} data - Data to be forwarded. 
         */
        recieveData: function(socket, data){
            this.app.recieveData(socket.id, data)
        },
        /**
         * Put all app options into object and return it.
         * @returns {Object} {id: /id/, roomLeader: /roomLeader.id/, members: /members - > ids/, maxMembers: /maxMembers/}
         */
        getRoomOptions: function(){
            const id = this.id
            const roomLeader = this.roomLeader.id
            const members = this.members.map(socket => socket.id)
            const maxMembers = this.maxMembers
            return {
                id: id,
                roomLeader: roomLeader,
                members: members,
                maxMembers: maxMembers
            }
        }
    }
    // set app broadcast function to rooms broadcast function
    room.app.broadcast = (data) => {
        room.broadcast("app_data", data)
    }

    //connect founding socket
    room.app.onConnect(room.roomLeader.id)
    room.roomLeader.data.roomId = room.id
    return room
}