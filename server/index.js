const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const handleLivestreamEvents = require("./socketManager/livestreamHandler");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("A user connected");

  // Add livestream event handlers
  handleLivestreamEvents(io, socket);

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
