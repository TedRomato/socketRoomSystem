import emits from './socketRoomSystem-Client/socketRoomSystem-Client/emits.js'
import { v4 as uuidv4 } from 'uuid'

export default (socket, app, roomIsEmpty, roomSize = 2) => {
    const room = {
        id: uuidv4(),
        roomLeader: socket,
        members: [socket],
        maxMembers: roomSize,
        app: app,
        onConnect:function(socket){
            this.app.onConnect(socket.id)
            socket.data.roomId = this.id
        },
        connect: function(socket) {
            for(const memberSocket of this.members) {
                if(memberSocket === socket){
                    return {message: emits.serverToClient.alreadyMember, data:this.id}
                }
            }
            if(this.members.length >= this.maxMembers) {
                return {message: emits.serverToClient.roomFull, data:this.id}
            }
            this.members.push(socket)
            this.onConnect(socket)
            return {message:emits.serverToClient.roomJoined, data:this.id}
        },
        onLeave: function(socket){
            this.app.onLeave(socket.id)
        },
        leave: function(socket, onLeaderLeave){
            this.members.splice(this.members.indexOf(socket), 1)
            if(members.length === 0) roomIsEmpty()
            if(this.roomLeader === socket) {
                this.roomLeader = this.members[0]
                onLeaderLeave()
            }
            this.onLeave(socket)
            return {message: emits.serverToClient.roomLeft}

        },
        broadcast: function(emit,data){
            for(const memberSocket of this.members){
                socket.to(memberSocket.id).emit(emit, data)
            }
            socket.emit(emit, data)
        },
        recieveData: function(socket, data){
            this.app.recieveData(socket.id, data)
        },
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

    room.app.broadcast = (data) => {
        room.broadcast(emits.serverToClient.appData, data)
    }

    room.app.onConnect(room.roomLeader.id)
    room.roomLeader.data.roomId = room.id
    return room
}