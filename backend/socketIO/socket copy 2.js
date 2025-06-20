const socketIO = require("socket.io");
const socketLiveStream = require("./socketLiveStream");

// Global state management
const onlineUsers = new Map(); // userId -> socketId
let rooms = {};
let groupRooms = {};
let ioInstance;

/**
 * Main Socket.IO setup function
 */
const setupSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    socket.emit("socketId", socket.id);

    // Setup event handlers
    setupUserHandlers(socket, io);
    setupChatHandlers(socket, io);
    setupVideoCallHandlers(socket, io);
    setupDisconnectHandler(socket, io);

    // Setup live stream functionality
    socketLiveStream(socket, io, rooms, onlineUsers);
  });
};

/**
 * User connection/disconnection handlers
 */
function setupUserHandlers(socket, io) {
  // User login
  socket.on("userLogin", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("userConnected", userId);
    console.log(`User ${userId} connected with socket ${socket.id}`);
  });

  // User logout
  socket.on("userLogout", (userId) => {
    onlineUsers.delete(userId);
    io.emit("userDisconnected", userId);
    console.log(`User ${userId} logged out`);
  });

  // Check if user is online
  socket.on("checkUserOnline", (userId) => {
    const isOnline = onlineUsers.has(userId);
    socket.emit("checkUserOnline", isOnline);
  });

  // Get socket ID from user ID
  socket.on("useridtosocketid", (friendId, callback) => {
    const friendSocketId = onlineUsers.get(friendId) || null;
    callback(friendSocketId);
  });
}

/**
 * Chat handlers (personal and group)
 */
function setupChatHandlers(socket, io) {
  // Personal chat
  socket.on("personalChat", handlePersonalChat);

  // Group chat
  socket.on("joinOrCreateGroupRoom", handleJoinOrCreateGroupRoom);
  socket.on("leaveRoom", handleLeaveRoom);
  socket.on("groupChat", handleGroupChat);
}

/**
 * Video call handlers
 */
function setupVideoCallHandlers(socket, io) {
  socket.on("initiateCall", handleInitiateCall);
  socket.on("answerCall", handleAnswerCall);
  socket.on("terminateCall", handleTerminateCall);
  socket.on("changeMediaStatus", handleChangeMediaStatus);
  socket.on("sendMessage", handleSendMessage);
}

/**
 * Disconnect handler
 */
function setupDisconnectHandler(socket, io) {
  socket.on("disconnect", () => {
    // Remove user from online users map
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit("userDisconnected", userId);
        console.log(`❌ User disconnected: ${socket.id}`);
        break;
      }
    }

    // Clean up group rooms
    cleanupGroupRooms(socket.id, io);
  });
}

// ===================== CHAT HANDLERS =====================

/**
 * Handle personal chat messages
 */
async function handlePersonalChat({ senderEmail, receiverEmail, message }) {
  console.log(
    `Personal chat from ${senderEmail} to ${receiverEmail}: ${message}`
  );

  const receiverSocketId = onlineUsers.get(receiverEmail);

  if (receiverSocketId) {
    ioInstance.to(receiverSocketId).emit("personalChat", {
      senderEmail,
      message,
    });
    console.log(`Message delivered to ${receiverEmail}`);
  } else {
    console.log(`User ${receiverEmail} is offline`);
  }
}

/**
 * Handle group room join/create
 */
function handleJoinOrCreateGroupRoom({ groupId, memberId }) {
  // Create room if doesn't exist
  if (!groupRooms[groupId]) {
    groupRooms[groupId] = {
      groupId,
      members: [memberId],
      viewers: [],
    };
    console.log("Created new group room:", groupId);
  }

  const room = groupRooms[groupId];

  // Add member if not exists
  if (!room.members.includes(memberId)) {
    room.members.push(memberId);
  }

  // Join socket to room
  const socket = getSocketFromContext();
  socket.join(groupId);

  // Add viewer if not exists
  const alreadyViewer = room.viewers.find((v) => v.id === socket.id);
  if (!alreadyViewer) {
    room.viewers.push({
      id: socket.id,
      userId: memberId,
      joinTime: new Date(),
    });
  }

  // Notify room members
  ioInstance.to(groupId).emit("viewerJoined", {
    viewerId: socket.id,
    userId: memberId,
    count: room.viewers.length,
  });

  ioInstance.to(groupId).emit("roomInfo", room);
  updateGroupRooms();

  console.log("User joined group room:", groupId, "Socket:", socket.id);
}

/**
 * Handle leaving group room
 */
function handleLeaveRoom({ groupId }) {
  const room = groupRooms[groupId];
  if (!room) return;

  const socket = getSocketFromContext();
  socket.leave(groupId);

  room.viewers = room.viewers.filter((viewer) => viewer.id !== socket.id);

  if (room.viewers.length === 0) {
    delete groupRooms[groupId];
    console.log(`Group room ${groupId} deleted (no viewers)`);
  } else {
    ioInstance.to(groupId).emit("viewerLeft", {
      viewerId: socket.id,
      count: room.viewers.length,
    });
  }

  updateGroupRooms();
}

/**
 * Handle group chat messages
 */
function handleGroupChat({ groupId, message, senderId, senderName }) {
  const timestamp = new Date().toISOString();

  ioInstance.to(groupId).emit("groupChat", {
    groupId,
    message,
    senderId,
    senderName,
    createdAt: "a few seconds ago",
    timestamp,
  });

  console.log(`[Group ${groupId}] ${senderName}: ${message}`);
}

// ===================== VIDEO CALL HANDLERS =====================

function handleInitiateCall({ targetId, signalData, senderId, senderName }) {
  ioInstance.to(targetId).emit("incomingCall", {
    signal: signalData,
    from: senderId,
    name: senderName,
  });
}

function handleAnswerCall(data) {
  const socket = getSocketFromContext();
  socket.broadcast.emit("mediaStatusChanged", {
    mediaType: data.mediaType,
    isActive: data.mediaStatus,
  });
  ioInstance.to(data.to).emit("callAnswered", data);
}

function handleTerminateCall({ targetId }) {
  ioInstance.to(targetId).emit("callTerminated");
}

function handleChangeMediaStatus({ mediaType, isActive }) {
  const socket = getSocketFromContext();
  socket.broadcast.emit("mediaStatusChanged", {
    mediaType,
    isActive,
  });
}

function handleSendMessage({ targetId, message, senderName }) {
  ioInstance.to(targetId).emit("receiveMessage", {
    message,
    senderName,
  });
}

// ===================== NOTIFICATION SYSTEM =====================

/**
 * Create and emit real-time notification to user
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.userId - Target user ID
 * @param {string} notificationData.type - Notification type
 * @param {Object} notificationData.sender - Sender information
 * @param {string} notificationData.messageNote - Notification message
 * @param {string} notificationData.linkClick - Link to click
 * @param {string} [notificationData.postId] - Related post ID
 */
async function createAndEmitNotification(notificationData) {
  try {
    // You'll need to import your User model here
    // const User = require("../models/User");

    // Get user email from userId
    // const user = await User.findById(notificationData.userId).select('email');
    // if (!user) {
    //   console.log(`User not found: ${notificationData.userId}`);
    //   return;
    // }

    // Create notification in database
    // await createNotification(notificationData);

    // Emit real-time notification
    // emitNotificationToUser(user.email, notificationData);

    // For now, using userId directly (you can modify based on your User model)
    emitNotificationToUser(notificationData.userId, notificationData);
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

/**
 * Emit notification to specific user by email
 */
function emitNotificationToUser(userEmail, notificationData) {
  const socketId = onlineUsers.get(userEmail);

  if (socketId && ioInstance) {
    ioInstance.to(socketId).emit("notification", {
      ...notificationData,
      timestamp: new Date().toISOString(),
    });
    console.log(`Notification sent to user ${userEmail}`);
  } else {
    console.log(
      `User ${userEmail} is offline - notification saved to database`
    );
  }
}

/**
 * Emit notification to user by ID (with email lookup)
 */
async function emitNotificationToUserId(userId, notificationData) {
  try {
    // You'll need to import your User model here
    // const User = require("../models/User");
    // const user = await User.findById(userId).select('email');

    // if (user) {
    //   emitNotificationToUser(user.email, notificationData);
    // } else {
    //   console.log(`User not found: ${userId}`);
    // }

    // For now, using userId directly
    emitNotificationToUser(userId, notificationData);
  } catch (error) {
    console.error("Error emitting notification:", error);
  }
}

// ===================== UTILITY FUNCTIONS =====================

function updateGroupRooms() {
  ioInstance.emit("updateLiveRooms", Object.values(groupRooms));
}

function cleanupGroupRooms(socketId, io) {
  Object.keys(groupRooms).forEach((groupId) => {
    const room = groupRooms[groupId];
    room.viewers = room.viewers.filter((viewer) => viewer.id !== socketId);

    if (room.viewers.length === 0) {
      delete groupRooms[groupId];
      console.log(`Group room ${groupId} deleted (no viewers)`);
    } else {
      io.to(groupId).emit("viewerLeft", {
        viewerId: socketId,
        count: room.viewers.length,
      });
    }
  });
  updateGroupRooms();
}

function getSocketFromContext() {
  // This is a helper function to get current socket context
  // You might need to adjust this based on your implementation
  return this;
}

/**
 * Legacy function for backward compatibility
 */
function emitEventToUser(userEmail, eventName, data) {
  console.log("emitEventToUser", userEmail, eventName, data);
  const socketId = onlineUsers.get(userEmail);

  if (socketId && ioInstance) {
    ioInstance.to(socketId).emit(eventName, data);
    console.log(`Emit event '${eventName}' to user ${userEmail}`);
  } else {
    console.log(`User ${userEmail} offline or socket not initialized.`);
  }
}

// ===================== EXPORTS =====================

module.exports = {
  setupSocket,
  emitEventToUser,
  emitNotificationToUser,
  emitNotificationToUserId,
  createAndEmitNotification,
  onlineUsers,
};
