function socketLiveStream(socket, io, rooms, onlineUsers) {
  //chat  in room
  socket.on(
    "liveChat",
    ({ roomId, message, sender, senderName, timestamp }) => {
      console.log("have chat", message);
      io.to(roomId).emit("liveChat", {
        roomId,
        message,
        sender,
        senderName,
        timestamp,
      });
    }
  );

  //stream in rooms
  const updateRooms = () => io.emit("updateLiveRooms", Object.values(rooms));

  const handleCreateRoom = ({ owner, roomId, streamerName }) => {
    socket.join(roomId);
    rooms[roomId] = {
      owner: owner,
      id: roomId,
      streamer: streamerName,
      viewers: [],
      startTime: new Date(),
    };
    updateRooms();
    console.log("rooms", rooms);
  };

  const handleJoinRoom = (roomId) => {
    const room = rooms[roomId];
    if (room) {
      socket.join(roomId);
      room.viewers.push({
        id: socket.id,
        joinTime: new Date(),
      });
      io.to(roomId).emit("viewerJoined", {
        viewerId: socket.id,
        count: room.viewers.length,
      });
      console.log("join room", rooms[roomId].viewers);
      io.to(roomId).emit("roomInfo", room);
    }
  };

  const handleLeaveRoom = (roomId) => {
    const room = rooms[roomId];
    if (!room) return;

    socket.leave(roomId);
    room.viewers = room.viewers.filter((viewer) => viewer.id !== socket.id);

    if (room.viewers.length === 0 && socket.id === onlineUsers[rooms.owner]) {
      delete rooms[roomId];
    }
    console.log("leave room", rooms[roomId].viewers);
    updateRooms();
  };

  const handleDisconnect = () => {
    Object.keys(rooms).forEach((roomId) => {
      const room = rooms[roomId];
      room.viewers = room.viewers.filter((viewer) => viewer.id !== socket.id);

      if (roomId === socket.id) {
        delete rooms[roomId];
        io.to(roomId).emit("streamEnded", { roomId });
      }
    });
    updateRooms();
  };

  // Event listeners
  socket.on("getLiveRooms", () => {
    io.emit("updateLiveRooms", Object.values(rooms));
  });
  socket.on("createRoom", handleCreateRoom);
  socket.on("joinRoom", handleJoinRoom);
  socket.on("leaveRoom", handleLeaveRoom);
  // socket.on("userLogout", (roomId) => {
  //   console.log("userLogout", roomId);
  //   delete rooms[roomId];
  //   io.to(roomId).emit("streamEnded", { roomId });
  //   updateRooms();
  // });
  socket.on("endLive", (roomId) => {
    delete rooms[roomId];
    io.to(roomId).emit("streamEnded", { roomId });
    console.log("endlive");
    updateRooms();
  });
  socket.on("disconnect", handleDisconnect);

  ///add livestrea,feature
  // socket.on("createRoom", ({ roomId }) => {
  //   rooms[roomId] = socket.id;
  //   socket.join(roomId);
  //   console.log(`Room ${roomId} created by ${socket.id}`);
  // });

  // socket.on("joinRoom", ({ roomId }) => {
  //   const hostId = rooms[roomId];
  //   if (hostId) {
  //     socket.join(roomId);
  //     io.to(hostId).emit("viewerSignal", { viewerId: socket.id });
  //   }
  // });

  socket.on("hostSend", ({ roomId, signalData }) => {
    const hostId = onlineUsers.get(rooms[roomId].owner);
    console.log(rooms[roomId].viewers);
    rooms[roomId].viewers.forEach((viewerSocketId) => {
      io.to(viewerSocketId).emit("viewerJoined", { signalData });
    });
    // socket.to(roomId).emit("clientListen", { signalData });
  });

  socket.on("viewerJoin", ({ roomId, signal }) => {
    console.log(onlineUsers.get(rooms[roomId].owner) + " host id");

    const hostId = onlineUsers.get(rooms[roomId].owner);
    if (hostId) {
      io.to(hostId).emit("viewerJoined", { signal, viewerId: socket.id });
    }
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (rooms[roomId] === socket.id) {
        socket.to(roomId).emit("hostLeft");
        delete rooms[roomId];
      }
    }
  });
}

module.exports = socketLiveStream;
