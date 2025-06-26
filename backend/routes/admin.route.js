const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/admin.controller");
const adminMiddleware = require("../middlewares/authenticateAdmin"); // Middleware kiểm tra quyền admin
const authenticateToken = require("../middlewares/authenticateToken");

// User routes
router.get(
  "/users",
  authenticateToken,
  adminMiddleware,
  AdminController.getAllUsers
);
router.delete(
  "/users/:userId",
  authenticateToken,
  adminMiddleware,
  AdminController.deleteUser
);
router.put(
  "/users/:userId/role",
  authenticateToken,
  adminMiddleware,
  AdminController.updateUserRole
);

// Post routes
router.get(
  "/posts",
  authenticateToken,
  adminMiddleware,
  AdminController.getAllPosts
);
router.delete(
  "/posts/:postId",
  authenticateToken,
  adminMiddleware,
  AdminController.deletePost
);

// Group routes
router.get(
  "/groups",
  authenticateToken,
  adminMiddleware,
  AdminController.getAllGroups
);
router.delete(
  "/groups/:groupId",
  authenticateToken,
  adminMiddleware,
  AdminController.deleteGroup
);

// Message routes
router.get(
  "/messages",
  authenticateToken,
  adminMiddleware,
  AdminController.getAllMessages
);
router.delete(
  "/messages/:messageId",
  authenticateToken,
  adminMiddleware,
  AdminController.deleteMessage
);

// Notification routes
router.get(
  "/notifications",
  authenticateToken,
  adminMiddleware,
  AdminController.getAllNotifications
);
router.delete(
  "/notifications/:notificationId",
  authenticateToken,
  adminMiddleware,
  AdminController.deleteNotification
);

// Friendship routes
router.get(
  "/friendships",
  authenticateToken,
  adminMiddleware,
  AdminController.getAllFriendships
);
router.delete(
  "/friendships/:friendshipId",
  authenticateToken,
  adminMiddleware,
  AdminController.deleteFriendship
);

module.exports = router;
