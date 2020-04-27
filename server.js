const express = require('express')
const http = require('http')
const socketIO = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

const users = [
    { id: 'ted', room: 'room1' },
    { id: 'angela', room: 'froom' }
];

const rooms = [
    { id: 'room1', usersOnline: ['ted'], isLocked: true, password: 'poo' },
    { id: 'froom', usersOnline: ['angela'], isLocked: false },
];

app.use(express.static('public'))

io.on('connection', (socket) => {
    console.log('Client connected: ', socket.id)
    socket.on('join room', (data) => {
        if (!data.password) {
            socket.join(data.room.id, () => {
                // Respond to client that join was successful
                io.to(socket.id).emit('join successful', 'success')
                // Clients username saved in socket
                socket.username = data.username;
                // Tell everyone that user has joined room
                io.to(data.room.id).emit(
                    'update chat', {
                    username: socket.username,
                    message: `${rooms.includes(data.room.id) ? 'Joined the room!' : `Created the room "${data.room.id}"`}`
                })
                // Add new open room to list of rooms if not already included
                rooms.includes(data.room.id) ? null : rooms.push(data.room)
            })
        } else {
            if (rooms.includes(data.room.id)) {
                const foundIndex = rooms.findIndex(data.room.id)
                if (data.password === rooms[foundIndex].password) {
                  socket.join  
                } 
            }
        }

        socket.on('message', (message) => {
            // Broadcast message to all clients in the room
            io.to(data.room.id).emit('update chat', { username: socket.username, message })
        })
    })
})


server.listen(3000, () => console.log('Server is running on http://localhost:3000'))