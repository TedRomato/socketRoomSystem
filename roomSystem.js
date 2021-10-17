import createRoom from'./room.js'
import emits from './socketRoomSystem-Client/socketRoomSystem-Client/emits.js'

export default (appConstructor) => {
    return {
        rooms:[],
        appConstructor: appConstructor,
        createRoom: function(socket, roomSize = 2) {
            const room = createRoom(socket, this.appConstructor(), () => {"room is empty"}, roomSize)
            this.rooms.push(room)
            return {message:emits.serverToClient.roomCreated, data: room.id}
        },
        getRoom: function(roomId) {
            for(const room of this.rooms) {
                if(room.id === roomId) return room
            }
        },

        leaveRoom: function(socket, roomId) {
            const room = this.getRoom(roomId)
            if(!room) return noRoomWithThisIdEmit(socket, roomId)
            room.disconnect(socket)
        },
    }
}