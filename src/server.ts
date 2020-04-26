import { Socket } from "socket.io";
import express = require("express");
import http = require("http");
import socketIO = require("socket.io");
import path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
module.exports = io;

const port = process.env.PORT || 3000;

io.on("connection", (socket: Socket) => {
    if (typeof socket !== undefined) {
        console.log("Client connected: ", socket.id);
        socket.on("join room", (data: any) => {
            socket.join(data.room, () => {
                // Respond to client that join was succesfull
                io.to(socket.id).emit("join successful", "success");

                // Broadcast message to all clients in the room
                io.to(data.room).emit(
                    "message",
                    {
                        name: data.name,
                        message: "Has joined the room!"
                    }
                );
            });

            socket.on("message", (message: any) => {
                // Broadcast message to all clients in the room
                io.to(data.room).emit("message", { name: data.name, message });
            });
        });
    }
});
server.listen(3000, () => console.log(`Server is running on http://localhost:${port}/`));

app.use(express.static(path.join(__dirname, "public")));

console.log("Hello from server.ts");