const express =  require("express")
const {RoomSystem} = require('./roomSystem.js')

/**
 * Room system compatible with socket layer.
 */
class SocketRoomSystem {
    /**
     * Creates SocketRoomSystem instance.
     * @param {Function} appConstructor - App constructor. Keep in mind, custom app must implement onConnect, and recieveData methods.
     * @param {Object} io - socket.io io instance.
     * @param {Object} app - Express app.
     */
    constructor(appConstructor, io, app){
        //initialize room system
        /**
         * @property {RoomSystem} roomSystem - [RoomSystem}{@link RoomSystem} instance. That's where all the [room]{@link Room} managment logic lays.
         */
        this.roomSystem = new RoomSystem(appConstructor)
        /**
         * @property {Object} io - socket.io io instance.
         */
        this.io = io
        /**
         * @property {Object} app - Express app.
         */
        this.app = app
        // list of all possible events
        /**
         * @property {Object} eventNames - List of all events SocketRoomSystem can handle. 
         */
        this.eventNames = {
            createRoom: "create_room",
            joinRoom: "join_room",
            getRoomOptions: "get_room_options",
            leaveRoom: "leave_room",
            changeRoomOption: "change_room_option",
            kick: "kick",
            appData: "app_data"
        }
    }
    /**
     * Starts listening for socket.io emits from clients, and exposes socketRoomSystem-Client in socketRoomSystem-Client folder for clients. 
     * @returns {void}
     */
    start(){
        // path to room system client code 
        let clientPath = __dirname + "/socketRoomSystem-Client"
        // expose client code under /socketRoomSystem-Client folder on client 
        this.app.use(express.static(clientPath))
        

        //configure emit listeners
        io.on("connection", (socket) => {
            
            
            socket.on(this.eventNames.createRoom, (roomSize = 2) => {
                const status = roomSystem.createRoom(socket, roomSize)
                socket.emit(status.message, status?.data)
            })


            socket.on(this.eventNames.joinRoom, (roomId) => {
                const room = roomSystem.getRoom(roomId)
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
                const room = roomSystem.getRoom(socket.data.roomId)
                // emit "room_not_found" when no room is found
                if(!room) return socket.emit("room_not_found")
                const options = room.getRoomOptions(socket)
                socket.emit("room_options", options)
            })

            socket.on(this.eventNames.appData, (data) => {
                const room = roomSystem.getRoom(socket.data.roomId)
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

module.exports = {SocketRoomSystem}

/*
module.exports = {


    start: function(appConstructor, io, app) {
        // path to room system client code 
        let clientPath = __dirname + "/socketRoomSystem-Client"
        // expose client code under /socketRoomSystem-Client folder on client 
        app.use(express.static(clientPath))
        //initialize room system
        let roomSystem = createRoomSystem(appConstructor)

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
                const status = roomSystem.createRoom(socket, roomSize)
                socket.emit(status.message, status?.data)
            })


            socket.on(this.eventNames.joinRoom, (roomId) => {
                const room = roomSystem.getRoom(roomId)
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
                const room = roomSystem.getRoom(socket.data.roomId)
                // emit "room_not_found" when no room is found
                if(!room) return socket.emit("room_not_found")
                const options = room.getRoomOptions(socket)
                socket.emit("room_options", options)
            })

            socket.on(this.eventNames.appData, (data) => {
                const room = roomSystem.getRoom(socket.data.roomId)
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
}*/