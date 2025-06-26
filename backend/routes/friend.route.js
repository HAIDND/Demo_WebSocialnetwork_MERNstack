const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friend.controller");
const authenticateToken = require("../middlewares/authenticateToken");

router.post("/request", authenticateToken, friendController.sendFriendRequest);
router.post("/accept", authenticateToken, friendController.acceptFriendRequest);
router.delete(
  "/reject",
  authenticateToken,
  friendController.rejectFriendRequest
);
router.delete("/remove", authenticateToken, friendController.removeFriend);
router.get("/list", authenticateToken, friendController.getFriendsList);
router.get(
  "/sent-requests",
  authenticateToken,
  friendController.getSentRequests
);

module.exports = router;
