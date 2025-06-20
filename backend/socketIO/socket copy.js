// const Message = require("../models/Message"); // Import Message model
const socketIO = require("socket.io");
const socketLiveStream = require("./socketLiveStream");
//map user online
const onlineUsers = new Map();
// Danh sách các phòng chat
let rooms = {};
let groupRooms = {};

let ioInstance;
const setupSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  ioInstance = io;
  io.on("connection", (socket) => {
    // Kết nối socket cho live stream
    socket.emit("socketId", socket.id); //send socketid to client
    console.log("Socket connected: " + socket.id); //log id
    // set Map user online
    socket.on("userLogin", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("userConnected", userId);
      console.log(`User ${userId} connected with socket ${socket.id}`);
      console.log(onlineUsers);
    });
    socket.on("userLogout", (userId) => {
      onlineUsers.delete(userId, socket.id);
      io.emit("userDisconnected", userId);
      console.log(`❌ User disconnected: ${socket.id}`);
      console.log(onlineUsers);
    });
    // set  user online
    socket.on("checkUserOnline", (userId) => {
      const isOnline = onlineUsers.has(userId);
      socket.emit("checkUserOnline", isOnline);
    });
    //check id to socketid
    socketLiveStream(socket, io, rooms, onlineUsers);
    // Khi frontend gửi friendId, backend gửi lại socketId của friendId
    socket.on("useridtosocketid", (friendId, callback) => {
      const friendSocketId = onlineUsers.get(friendId) || null;
      callback(friendSocketId);
    });
    // socket disconnect
    // socket.on("private_message", async ({ senderId, receiverId, message }) => {
    //   const receiverSocketId = onlineUsers[receiverId];

    //   if (receiverSocketId) {
    //     io.to(receiverSocketId).emit("private_message", { senderId, message });
    //     console.log(`Message from ${senderId} to ${receiverId}: ${message}`);
    //   } else {
    //     console.log(`User ${receiverId} is offline.`);
    //   }
    // });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit("userDisconnected", userId);
          console.log(`❌ User disconnected: ${socket.id}`);
          break;
        }
      }
    });

    //chat personal
    personalChat(io, socket);
    //group chat
    groupChat(io, socket);
    // call video
    callVideoPersonal(io, socket);
  });
};
//chat pesonal
function personalChat(io, socket) {
  socket.on("personalChat", async ({ senderEmail, receiverEmail, message }) => {
    console.log(
      `Received personal chat from ${senderEmail} to ${receiverEmail}: ${message}`
    );
    const receiverSocketId = onlineUsers.get(receiverEmail);
    console.log("receiverSocketId", onlineUsers);
    const senderSocketId = onlineUsers[senderEmail];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("personalChat", { senderEmail, message });
      console.log(
        `Message from ${senderEmail} to ${receiverEmail}: ${message}`
      );
    } else {
      console.log(`User ${receiverEmail} is offline.`);
    }
  });
}
//chat group
// const groupRooms = {}; // Global object to manage group rooms
// const onlineUsers = {}; // Bạn cần setup từ login/socket middleware
//old code chta group
// function groupChat(io, socket) {
//   const updateRooms = () => {
//     io.emit("updateLiveRooms", Object.values(groupRooms));
//   };

//   // Tạo phòng group nếu chưa có
//   const handleCreateRoom = ({ groupId, memberId }) => {
//     if (!groupRooms[groupId]) {
//       groupRooms[groupId] = {
//         groupId,
//         members: [memberId],
//         viewers: [], // Danh sách socket đang online trong group
//       };
//     }
//     socket.join(groupId);
//     updateRooms();
//     console.log("Created group room:", groupRooms[groupId]);
//   };

//   // Tham gia phòng group (khi online)
//   const handleJoinRoom = ({ groupId, memberId }) => {
//     const room = groupRooms[groupId];
//     if (room) {
//       socket.join(groupId);

//       // Đánh dấu socket online
//       const alreadyViewer = room.viewers.find((v) => v.id === socket.id);
//       if (!alreadyViewer) {
//         room.viewers.push({
//           id: socket.id,
//           userId: memberId,
//           joinTime: new Date(),
//         });
//       }

//       // Emit thông tin người vừa tham gia
//       io.to(groupId).emit("viewerJoined", {
//         viewerId: socket.id,
//         userId: memberId,
//         count: room.viewers.length,
//       });

//       io.to(groupId).emit("roomInfo", room);
//       console.log("User joined group:", groupId, "Socket:", socket.id);
//     }
//   };

//   // Rời phòng group
//   const handleLeaveRoom = ({ groupId }) => {
//     const room = groupRooms[groupId];
//     if (!room) return;

//     socket.leave(groupId);
//     room.viewers = room.viewers.filter((viewer) => viewer.id !== socket.id);

//     // Nếu không còn ai trong phòng
//     if (room.viewers.length === 0) {
//       delete groupRooms[groupId];
//       console.log(`Group room ${groupId} deleted (no viewers)`);
//     } else {
//       io.to(groupId).emit("viewerLeft", {
//         viewerId: socket.id,
//         count: room.viewers.length,
//       });
//     }

//     updateRooms();
//   };

//   // Nhận và gửi tin nhắn group
//   const handleGroupChat = ({ groupId, message, senderId, senderName }) => {
//     const timestamp = new Date().toISOString();

//     io.to(groupId).emit("groupChat", {
//       groupId,
//       message,
//       senderId,
//       senderName,
//       timestamp,
//     });

//     console.log(`[Group ${groupId}] ${senderName}: ${message}`);
//   };

//   // Đăng ký các sự kiện
//   socket.on("createGroupRoom", handleCreateRoom);
//   socket.on("joinRoom", handleJoinRoom);
//   socket.on("leaveRoom", handleLeaveRoom);
//   socket.on("groupChat", handleGroupChat);
// }
//;new code group chat 12-05
function groupChat(io, socket) {
  const updateRooms = () => {
    io.emit("updateLiveRooms", Object.values(groupRooms));
  };

  // Tham gia hoặc tạo phòng group nếu chưa có
  const handleJoinOrCreateRoom = ({ groupId, memberId }) => {
    // Tạo phòng nếu chưa có
    if (!groupRooms[groupId]) {
      groupRooms[groupId] = {
        groupId,
        members: [memberId],
        viewers: [],
      };
      console.log("Created new group room:", groupId);
    }

    const room = groupRooms[groupId];

    // Thêm memberId vào danh sách thành viên nếu chưa có
    if (!room.members.includes(memberId)) {
      room.members.push(memberId);
    }

    // Join socket vào room
    socket.join(groupId);

    // Kiểm tra nếu socket đã là viewer chưa
    const alreadyViewer = room.viewers.find((v) => v.id === socket.id);
    if (!alreadyViewer) {
      room.viewers.push({
        id: socket.id,
        userId: memberId,
        joinTime: new Date(),
      });
    }
    let ioInstance = io; // Gán global ioInstance
    // Thông báo cho các socket khác trong phòng
    io.to(groupId).emit("viewerJoined", {
      viewerId: socket.id,
      userId: memberId,
      count: room.viewers.length,
    });

    io.to(groupId).emit("roomInfo", room);
    updateRooms();

    console.log("User joined group room:", groupId, "Socket:", socket.id);
  };

  // Rời khỏi phòng
  const handleLeaveRoom = ({ groupId }) => {
    const room = groupRooms[groupId];
    if (!room) return;

    socket.leave(groupId);
    room.viewers = room.viewers.filter((viewer) => viewer.id !== socket.id);

    if (room.viewers.length === 0) {
      delete groupRooms[groupId];
      console.log(`Group room ${groupId} deleted (no viewers)`);
    } else {
      io.to(groupId).emit("viewerLeft", {
        viewerId: socket.id,
        count: room.viewers.length,
      });
    }

    updateRooms();
  };

  // Xử lý tin nhắn group
  const handleGroupChat = ({ groupId, message, senderId, senderName }) => {
    const timestamp = new Date().toISOString();

    io.to(groupId).emit("groupChat", {
      groupId,
      message,
      senderId,
      senderId,
      senderName,
      createdAt: "a few second ago",
    });

    console.log(`[Group ${groupId}] ${senderName}: ${message}`);
  };

  // Đăng ký sự kiện
  socket.on("joinOrCreateGroupRoom", handleJoinOrCreateRoom);
  socket.on("leaveRoom", handleLeaveRoom);
  socket.on("groupChat", handleGroupChat);
}

//pass callVideoPersonal
function callVideoPersonal(io, socket) {
  socket.on(
    "initiateCall",
    ({ targetId, signalData, senderId, senderName }) => {
      io.to(targetId).emit("incomingCall", {
        signal: signalData,
        from: senderId,
        name: senderName,
      });
    }
  );

  socket.on("changeMediaStatus", ({ mediaType, isActive }) => {
    socket.broadcast.emit("mediaStatusChanged", {
      mediaType,
      isActive,
    });
  });

  socket.on("sendMessage", ({ targetId, message, senderName }) => {
    io.to(targetId).emit("receiveMessage", { message, senderName });
  });

  socket.on("answerCall", (data) => {
    socket.broadcast.emit("mediaStatusChanged", {
      mediaType: data.mediaType,
      isActive: data.mediaStatus,
    });
    io.to(data.to).emit("callAnswered", data);
  });

  socket.on("terminateCall", ({ targetId }) => {
    io.to(targetId).emit("callTerminated");
  });
}

const emitEventToUser = (userEmail, eventName, data) => {
  console.log("emitEventToUser", userEmail, eventName, data);
  const socketId = onlineUsers.get(userEmail);
  console.log("socketId to notifi", socketId);
  if (socketId && ioInstance) {
    ioInstance.to(socketId).emit(eventName, data);
    console.log(`Emit event '${eventName}' to user ${userEmail}`);
  } else {
    console.log(`User ${userEmail} offline or socket not initialized.`);
  }
};
// module.exports = setupSocket;
module.exports = {
  setupSocket,
  emitEventToUser, // ✅ export thêm
  onlineUsers, // optional: export nếu nơi khác cần dùng
};
