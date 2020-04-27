const express = require('express')
const http = require('http')
const socketIO = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIO(server)


app.use(express.static('public'))

io.on('connection', (socket) => {
    console.log('Client connected: ', socket.id)

    socket.on('join room', (data) => {
        socket.join(data.room, () => {
            // Respond to client that join was successful
            io.to(socket.id).emit('join successful', 'success')

            // Tell everyone that user has joined room
            io.to(data.room).emit(
                'message',
                {
                    name: data.name,
                    message: `Has joined the room!`
                }
            )
        })

        socket.on('message', (message) => {
            // Send Message to everyone in room
            io.to(data.room).emit('message', { name: data.name, message })
        })
    })
})


server.listen(3000, () => console.log('Server is running on http://localhost:3000'))