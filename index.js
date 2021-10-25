const express =  require("express")
const createRoomSystem = require('./roomSystem.js')

/**
 * @type {Object} Room system
 */
module.exports = {

    /**
    * This function is called to start the room system. 
    * @param {function} appConstructor - The constructor for custom app used by all room in room system.
    * @param {Object} io - The socket-io server object.
    * @param {Object} app - The express server object.
    */
    start: function(appConstructor, io, app) {
        // path to room system client code 
        this.clientPath = __dirname + "/socketRoomSystem-Client"
        // expose client code under /socketRoomSystem-Client folder on client 
        app.use(express.static(this.clientPath))
        //initialize room system
        this.roomSystem = createRoomSystem(appConstructor)
        this.io = io

        // list of all possible events
        this.eventNames = {
            createRoom: "create_room",
            joinRoom: "join_room",
            getRoomOptions: "get_room_options",
            leaveRoom: "leave_room",
            changeRoomOption: "change_room_option",
            kick: "kick",
            appData: "app_data"
        }


        //configure emit listeners
        io.on("connection", (socket) => {
            
            
            socket.on(this.eventNames.createRoom, (roomSize = 2) => {
                const status = this.roomSystem.createRoom(socket, roomSize)
                socket.emit(status.message, status?.data)
            })


            socket.on(this.eventNames.joinRoom, (roomId) => {
                const room = this.roomSystem.getRoom(roomId)
                // emit "room_not_found" when no room is found
                if(!room) return socket.emit("room_not_found", roomId)
                //connect new socket to room
                const status = room.connect(socket)
        
                socket.emit(status.message, status?.data)

                if(status.message === "room_joined"){
                    // broadcast room state change with new member array to all connected members
                    room.broadcast(
                        "room_state_changed", 
                        {option: "members", newVal: room.members.map(socket => socket.id)}
                    )
                }
            })


            socket.on(this.eventNames.getRoomOptions, () => {
                const room = this.roomSystem.getRoom(socket.data.roomId)
                // emit "room_not_found" when no room is found
                if(!room) return socket.emit("room_not_found")
                const options = room.getRoomOptions(socket)
                socket.emit("room_options", options)
            })

            socket.on(this.eventNames.appData, (data) => {
                const room = this.roomSystem.getRoom(socket.data.roomId)
                if(!room) return socket.emit("room_not_found")
                room.recieveData(socket, data)
            })
            
            // TODO:
            socket.on(this.eventNames.leaveRoom, () => {
            
            })

            // TODO:
            socket.on(this.eventNames.changeRoomOption, (proprety, value) => {
                
            })

            // TODO:
            socket.on(this.eventNames.kick, (id) => {
            })

        })
    }
}