const rooms = new Map();

class LivestreamRoom {
  constructor(hostId) {
    this.hostId = hostId;
    this.viewers = new Set();
  }

  addViewer(viewerId) {
    this.viewers.add(viewerId);
    return this.viewers.size;
  }

  removeViewer(viewerId) {
    this.viewers.delete(viewerId);
    return this.viewers.size;
  }

  getViewerCount() {
    return this.viewers.size;
  }
}

const handleLivestreamEvents = (io, socket) => {
  // Host creates a new room
  socket.on("createRoom", ({ roomId }) => {
    try {
      rooms.set(roomId, new LivestreamRoom(socket.id));
      socket.join(roomId);
      console.log(`Host ${socket.id} created room ${roomId}`);
    } catch (error) {
      console.error("Error creating room:", error);
      socket.emit("error", { message: "Failed to create room" });
    }
  });

  // Host sends signal data
  socket.on("hostSignal", ({ roomId, signalData }) => {
    try {
      socket.to(roomId).emit("receiveHostSignal", { signalData });
    } catch (error) {
      console.error("Error sending host signal:", error);
    }
  });

  // Viewer joins room
  socket.on("joinRoom", ({ roomId }) => {
    try {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      socket.join(roomId);
      const viewerCount = room.addViewer(socket.id);
      io.to(roomId).emit("viewerCount", viewerCount);
      console.log(`Viewer ${socket.id} joined room ${roomId}`);
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // Viewer sends signal back to host
  socket.on("viewerSignal", ({ roomId, signal }) => {
    try {
      const room = rooms.get(roomId);
      if (room) {
        io.to(room.hostId).emit("viewerSignal", {
          signal,
          viewerId: socket.id,
        });
      }
    } catch (error) {
      console.error("Error sending viewer signal:", error);
    }
  });

  // Host ends livestream
  socket.on("endLivestream", ({ roomId }) => {
    try {
      const room = rooms.get(roomId);
      if (room && room.hostId === socket.id) {
        io.to(roomId).emit("hostLeft");
        rooms.delete(roomId);
      }
    } catch (error) {
      console.error("Error ending livestream:", error);
    }
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    try {
      rooms.forEach((room, roomId) => {
        if (room.hostId === socket.id) {
          // Host disconnected
          io.to(roomId).emit("hostLeft");
          rooms.delete(roomId);
        } else if (room.viewers.has(socket.id)) {
          // Viewer disconnected
          const viewerCount = room.removeViewer(socket.id);
          io.to(roomId).emit("viewerCount", viewerCount);
        }
      });
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  });
};

module.exports = handleLivestreamEvents;
