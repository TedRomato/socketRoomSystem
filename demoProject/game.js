// app has to implement recieveData and onConnect function
// app has a function broadcast, which is added in room system layer
// be sure not to overrride it
module.exports = () => {
    return {
        leader: undefined,
        running: false,
        counter:0,
        interval:undefined,

        // gets called when new client joins room
        // client id is a uuid4 string
        onConnect: function(clientId){
            // if noone is connected make new client a leader
            if(this.leader) return
            this.leader = clientId
        },
        
        // gets called when room recieves data
        // clientId is sender uuid
        // in this example I differentiate between requests using data.type, but you can use any keyword (emit, message, command)
        recieveData: function(clientId, data){
            // on data.type 'startAutoAdd', if client issuing this command is a leader, and interval is not yet running
            // start interval, that adds one to counter and broadcasts new value
            if(data.type === 'startAutoAdd' && clientId === this.leader && !this.running){
                this.running = true
                this.interval = setInterval(() => {
                    this.counter += 1
                    // broadcasting message to everyone in room
                    this.broadcast({type: "counterChange", counter: this.counter})
                }, 1000)
            }
            // leader can stop interval
            if(data.type === 'stopAutoAdd' && clientId === this.leader && this.running){
                this.running = false
                clearInterval(this.interval)
            }
            // add one to counter and broadcast
            if(data.type === "add"){
                this.counter += 1
                this.broadcast({type: "counterChange", counter: this.counter})
            }
        }
    }
}