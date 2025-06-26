const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const postController = require("../controllers/post.controller");
const authenticateToken = require("../middlewares/authenticateToken");

// API tạo bài viết
//old 1 file:
// router.post(
//   "/create",
//   authenticateToken,
//   upload.single("image"),
//   postController.createPost
// );
router.post(
  "/create",
  authenticateToken,
  //upload.array("files", 4),
  upload.array("images", 4), // Chấp nhận tối đa 4 ảnh
  //upload.single("images"), // Chấp nhận 1 ảnh hoặc video
  postController.createPost
);

// API lấy danh sách bài viết của người dùng
router.get("/userPosts", authenticateToken, postController.getUserPosts);
//get postPostById
router.get("/getPostById/:id", postController.getPostById);
// API like bài viết
router.post("/like", authenticateToken, postController.likePost);

// API bình luận bài viết
router.post("/comment", authenticateToken, postController.commentPost);

router.post("/unlike", authenticateToken, postController.unlikePost);

// Route Xóa Bình Luận
router.post("/delete-comment", authenticateToken, postController.deleteComment);

// Route Sửa Bài Viết
router.put(
  "/edit-post",
  authenticateToken,
  // upload.single("image"),
  upload.array("images", 4), // Chấp nhận tối đa 4 ảnh
  postController.editPost
);

// Route Sửa Bình Luận
router.put("/edit-comment", authenticateToken, postController.editComment);

module.exports = router;
