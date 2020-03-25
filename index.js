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
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    // message whenever a user enters a new room
    socket.emit("message", {
      user: "admin",
      text: `Hello, ${user.name}! You have entered the room: ${user.room}`
    });

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    socket.join(user.room);

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("disconnect", () => {
    const disconnectedUser = removeUser(socket.id);

    // const updatedUsers = getUsersInRoom(disconnectedUser.room).filter(
    //   onlineUser => onlineUser !== disconnectedUser
    // );

    if (disconnectedUser) {
      io.to(disconnectedUser.room).emit("message", {
        user: "admin",
        text: `${disconnectedUser.name} has left the room.`
      });
      io.to(disconnectedUser.room).emit("roomData", {
        room: disconnectedUser.room,
        users: getUsersInRoom(disconnectedUser.room)
      });
    }
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
