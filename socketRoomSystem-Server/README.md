# socketRoomSystem
This repo constains a little module, that allows for simple communication using Socket.io module. It serves as a layer, that handles entries from Socket.io, and transfers them to the correct users (in room), where they will be handled by one's app.
Core of this repo is a roomSystem. That is an object that, contains an array of all rooms and appContructor.

RoomSystems methods: createRoom(socket), joinRoom(socket, roomId), leaveRoom(socket, roomId), recieveData(socket, roomId, data)


