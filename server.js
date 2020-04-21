// allt som har med servern att göra
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket-io')(http);

const port = 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });
  
  io.on('connection', (socket) => {
    console.log('a user connected');
  });
  
  http.listen(3000, () => {
    console.log(`Server is running at `);
  });