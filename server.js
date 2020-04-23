const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 3000;

app.use(express.static('public'))

io.on('connection', (socket) => {
  console.log('Client connected: ', socket.id);

/* FRÅN FÖRELÄSNINGEN
  socket.on('join room', (data) => {
    socket.join(data.room, () => {
      // Respond to client that join was succesfull
      io.to(socket.id).emit('join successful', 'success')

      // Broadcast message to all clients in the room
      io.to(data.room).emit(
        'message',
        {
          name: data.name,
          message: `Has joined the room!`
        }
      )
    })

    socket.on('message', (message) => {
      // Broadcast message to all clients in the room
      io.to(data.room).emit('message', { name: data.name, message })
    })
  })
  */
})


server.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}/`)
)