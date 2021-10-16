const emits = {
    serverToClient: {
        //connection stage
        roomCreated: "room_created", //data: roomId
        roomJoined: "room_joined_succesfully", 
        alreadyMember: "already_member",
        roomFull: "room_is_full",
        roomDoesntExist: "room_doesnt_exist",
        //room stage
        appOptions: "app_options", 
        roomOptions: "room_options",
        roomStateChange: "room_state_changed", //data: prop, value
        roomLeft: "room_left_succesfully",
        kicked: "kicked",
        //run stage
        appStateChange: "app_state_change" //data: prop, newVal
    },

    clientToServer: {
        //connection stage
        createRoom: "create_room", //data: access = private, roomSize = 2
        joinRoom: "join_room", //data: roomId
        //room stage
        getRoomOptions: "get_room_options", 
        leaveRoom: "leave_room", 
        //leader only
        changeRoomOption: "change_room_option", //data: prop, val
        kick: "kick", //data: id
        //run stage
        appData: "app_data"
    }
}

export default emits