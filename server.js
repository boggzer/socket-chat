const express = require('express')
const http = require('http')
const socketIO = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

// Lite statuskoder, kanske inte ska använda dessa sen
require('./public/status-codes')

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
    console.log('Client connected: ', socket.id)

    socket.on('join room', (data) => {
        // If room is open
        if (data.room.isOpen === true) {
            socket.join(data.room.id, () => {
                // Respond to client that join was successful
                io.to(socket.id).emit('join successful', 'success')
                // Client's username saved in socket
                socket.username = data.username;
                // Tell everyone that user has created/joined room
                io.to(data.room.id).emit(
                    'update chat', {
                    username: socket.username,
                    message: `${roomExists(data.room.id) ? 'Has joined the room!' : `Created the room "${data.room.id}"`}`
                })
                // Add new open room to list of rooms if not already included
                roomExists(data.room.id) ? null : rooms.push(data.room)
            })
        } else {
            // TODO: Add function for entering locked chat room
        }

        socket.on('message', (message) => {
            // Broadcast message to all clients in the room
            io.to(data.room.id).emit('update chat', { username: socket.username, message })
            console.log(rooms)
        })
    })
})

/**
 * Check if room exists in list of rooms
 * @param {string} roomId id of room to check if it exists
 * @returns {boolean}
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