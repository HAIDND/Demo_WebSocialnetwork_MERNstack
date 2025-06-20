const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} = require("../controllers/notificationController");
const authenticateToken = require("../middlewares/authenticateToken");
// Lấy thông báo
router.get("/:userId", authenticateToken, getUserNotifications);
// Đánh dấu thông báo đã đọc
router.put("/:userId/:notificationId/read", authenticateToken, markAsRead);
// Đánh dấu tất cả notification đã đọc
router.put("/:userId/read-all", authenticateToken, markAllAsRead);
// Xóa notification
router.delete(
  "/:userId/:notificationId",
  authenticateToken,
  deleteNotification
);
// Lấy số lượng notification chưa đọc
router.get("/:userId/unread-count", authenticateToken, getUnreadCount);

module.exports = router;
