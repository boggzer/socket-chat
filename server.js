const express = require('express')
const http = require('http')
const socketIO = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

// Lite statuskoder, kanske inte ska använda dessa sen
const statusCode = require('./public/status-codes.js')

// Exempel på användare
const users = [
    { id: 'Foo', room: 'fooroom' },
    { id: 'Bar', room: 'barroom' },
    { id: 'Foobar', room: 'fooroom' }
];

// Exempel på rum
const rooms = [
    { id: 'fooroom', usersOnline: ['Foo', 'Foobar'], isOpen: false, password: 'password' },
    { id: 'barroom', usersOnline: ['Bar'], isOpen: true },
];

app.use(express.static('public'))

io.on('connection', (socket) => {
    socket.on('join room', (data) => {
        joinRoom(socket, data)
        socket.on('verify room', roomExists)
    })

    socket.on('verify locked room', (data) => {
        // console.log("room: ", data.room.id, "rooms: ", rooms)
        if (roomExists(data.room.id)) {
            const foundIndex = rooms.findIndex(room => room.id === data.room.id)
            // Kolla om lösenordet matchar V med console.log() nedan
            // console.log("match: ", data.room.password === rooms[foundIndex].password, "entered password: ", data.room.password, ": ", rooms[foundIndex].password)
            if (data.room.password === rooms[foundIndex].password) {
                joinRoom(socket, data)
            } else { socket.emit('on error', statusCode.WRONG_PASSWORD) }
        } else {
            joinRoom(socket, data)
        }
    })
})

function joinRoom(socket, data) {
    socket.join(data.room.id, () => {
        // Respond to client that join was successful
        io.to(socket.id).emit('join successful', 'success')
        // Client's username saved in socket
        socket.username = data.username;
        // Tell everyone that user has created/joined room
        const exists = roomExists(data.room.id)
        const serverMessage = welcomeMessage(data.room, exists)
        io.to(data.room.id).emit(
            'update chat', {
            username: socket.username,
            message: serverMessage
        })
        // Add event for messages
        socket.on('message', (message) => {
            // Broadcast message to all clients in the room
            io.to(data.room.id).emit('update chat', { username: socket.username, message })
        })
        // Add new open room to list of rooms if not already included
        roomExists(data.room.id) ? null : rooms.push(data.room)
    })
}

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

    // TODO: lägg till funktion som tar bort (splice) rum när det är tomt här kanske?

    const exists = rooms.filter(room => room.id === roomId)
    if (exists.length >= 1) {
        return true;
    } else {
        return false;
    }
}

server.listen(3000, () => console.log('Server is running on http://localhost:3000'))