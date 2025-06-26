// routes/groupRoutes.js

const express = require("express");
const router = express.Router();
const groupController = require("../controllers/group.controller");
const authenticateToken = require("../middlewares/authenticateToken");
const upload = require("../config/multerConfig");

// Tạo nhóm mới
router.post("/create", authenticateToken, groupController.createGroup);

// Thêm thành viên vào nhóm
router.post("/add-member", authenticateToken, groupController.addMember);

// Xóa thành viên khỏi nhóm
router.post("/remove-member", authenticateToken, groupController.removeMember);

// Đăng bài trong nhóm
router.post(
  "/post",
  authenticateToken,
  upload.single("image"),
  groupController.createGroupPost
);

// Xem danh sách bài đăng trong nhóm
router.get("/:groupId/posts", authenticateToken, groupController.getGroupPosts);

// Rời khỏi nhóm
router.post("/leave", authenticateToken, groupController.leaveGroup);

// Lấy danh sách các nhóm người dùng tham gia
router.get("/user/groups", authenticateToken, groupController.getUserGroups);

router.get("/allgroups", authenticateToken, groupController.getAllGroups);
// cap nhat group
router.put(
  "/edit-group",
  authenticateToken,
  upload.single("avatar"),
  groupController.updateGroup
);

// join nhóm
router.post("/join", authenticateToken, groupController.joinGroup);

module.exports = router;
