const groupMessageRoute = require("express").Router();
const {
  getGroupMessage,
  postGroupMessage,
  recallGroupMessage,
} = require("../controllers/groupMesssage.controller");
const authenticateToken = require("../middlewares/authenticateToken");
const upload = require("../config/multerConfig");

// GET /api/group/:groupId
// groupMessageRoute.get("/:groupId", authenticateToken, getGroupMessage); // Lấy tin nhắn của nhóm
groupMessageRoute.get("/:groupId", getGroupMessage); // Lấy tin nhắn của nhóm ko auth
// POST /api/group/:groupId
groupMessageRoute.post(
  "/",

  upload.single("file"), // Upload file nếu có
  postGroupMessage
);
//patch /:groupId
groupMessageRoute.patch("/recall/", recallGroupMessage);
module.exports = groupMessageRoute;
