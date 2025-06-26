const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");
const authenticate = require("../middlewares/authenticateToken"); // Middleware xác thực người dùng

// Route gửi tin nhắn
router.post("/send", authenticate, messageController.sendMessage); // Middleware authenticate để kiểm tra người dùng

// Route lấy tin nhắn giữa hai người dùng
router.get("/messages/:userId", authenticate, messageController.getMessages);

// Lấy danh sách những người đã nhắn tin với người dùng hiện tại
router.get("/chats", authenticate, messageController.getChatUsers);

module.exports = router;
