import { Socket } from "socket.io";
import http from "http";
import path from 'path'; // Correct import
import express from 'express';
import { Server } from 'socket.io';
import { UserManager } from "./managers/UserManager";
const socketIo = require('socket.io');

const app = express();

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
const io = socketIo(server, {  // Correct usage of socket.io here
    cors: {
      origin: 'http://localhost:3001', // Allow the frontend from this origin
      methods: ['GET', 'POST'],
    }
  });

const userManager = new UserManager();
// WebSocket connection between client and server
io.on('connection', (socket: Socket) => {
    console.log('a user connected'); 
    userManager.addUser("abc", socket);
    socket.on("disconnect", () =>{
        userManager.removeUser(socket.id);
    })
});

// Start the server on port 3000
server.listen(3000, () => {
    console.log('Server Running at http://localhost:3000');
});
