const express = require("express");
const socketio = require("socket.io");
const http = require("http");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const PORT = process.env.PORT || 5000;

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", socket => {
  console.log("New Connection!!");

  socket.on("join", ({ name, room }, cb) => {});

  socket.on("disconnect", () => {
    console.log("LEAVING NOW");
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
