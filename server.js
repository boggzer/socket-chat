const express = require('express')
const http = require('http')
const socketIO = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

const port = process.env.PORT || 3000
const host = process.env.HOST || 'localhost'

// Room examples
const rooms = [
    { id: 'Admin', usersOnline: [0], isOpen: false, password: 'admin' },
    { id: 'Public', usersOnline: [0], isOpen: true },
];

app.use(express.static('public'))

app.get("/rooms", (req, res) => {
    res.json(rooms)
})


io.on('connection', (socket) => {
    // Default join a room function for open rooms
    socket.on('join room', (data) => {
        joinRoom(socket, data)
    })

    // Handles joining/creating locked rooms
    socket.on('verify locked room', (data) => {
        // If room exists
        if (roomExists(data.room.id)) {
            const foundIndex = rooms.findIndex(room => room.id === data.room.id)
            // Join room if the entered password matches, otherwise show error message
            if (data.room.password === rooms[foundIndex].password) {
                joinRoom(socket, data)
            } else { socket.emit('on error', 'Wrong password') }
        } else {
            // If room does not exist in list of rooms, join/create a room like normal
            if (data.room.password.length >= 3) {
                joinRoom(socket, data)
            } else { socket.emit('on error', 'Password must be at least 3 characters') }
        }
    })
    // Check if requested room already exists and sends to callback function
    socket.on('check if exists', (roomId, fn) => {
        fn(roomExists(roomId))
    })
    
})


/**
 * Main function for joining/creating any room
 * @param {object} socket current socket
 * @param {object} data data recieved with username and room information
 */
function joinRoom(socket, data) {
    socket.join(data.room.id, () => {
        // Respond to client that join was successful
        io.to(socket.id).emit('join successful', data.room.id)
        // Client's username saved in socket
        socket.username = data.username
        socket.room = data.room
        const exists = roomExists(data.room.id)
        const serverMessage = welcomeMessage(data.room, exists)
        // Tell everyone that user has created/joined room
        io.to(data.room.id).emit(
            'update chat', {
            username: socket.username,
            message: serverMessage
        })
        // Add new open room to list of rooms if not already included
        roomExists(data.room.id) ? null : rooms.push(data.room)
        // When user leaves chat room
        socket.on("disconnect", () => {
            console.log(socket.username + " has disconnected from " + data.room.id)
            for (let u = 0; u < rooms.length; u++) {
                if (rooms[u].id === data.room.id) {
                    rooms[u].usersOnline--;

                    io.to(data.room.id).emit('update chat', { username: socket.username, message: " has left the room" })

                    if (rooms[u].usersOnline <= 0 && rooms[u].id != "Admin" && rooms[u].id != "Public") {

                        let removeTheName = rooms.findIndex(rooms => rooms[u] === rooms.id)
                        rooms.splice(removeTheName, 1)
                        socket.emit('update list')
                    }
                }
            }
        })
        // Event for messages
        socket.on('message', (message) => {
            // Broadcast message to all clients in the room
            io.to(data.room.id).emit('update chat', { username: socket.username, message })
        })

        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].id === data.room.id) {
                rooms[i].usersOnline++;
            }
        }
    })
}

/**
 * Returns server message based on if room already exists or/and if it is open
 * @param {Room} room 
 * @param {boolean} exists 
 * @returns {string} message
 */
const welcomeMessage = (room, exists) => {
    switch (true) {
        case (exists === true && room.isOpen === true):
            return `Has joined the room!`
        case (exists === true && room.isOpen === false):
            return `Has joined the locked room!`
        case (exists === false && room.isOpen === true):
            return `Created the room "${room.id}"`
        case (exists === false && room.isOpen === false):
            return `Created the locked room "${room.id}"`
        default:
            return `Welcome to Socket Chat!`
    }
}

/**
 * Check if room exists in list of rooms
 * @param {string} roomId id of room to check if it exists
 * @returns {boolean} true or false
 */
function roomExists(roomId) {
    const exists = rooms.filter(room => room.id === roomId)
    if (exists.length >= 1) {
        return true;
    } else {
        return false;
    }
}

server.listen(port, () => console.log(`Server is running on http://${host}:${port}`))