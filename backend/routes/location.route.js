const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const authenticateToken = require("../middlewares/authenticateToken");

const localtionController = require("../controllers/locations.controller");

// API tạo bài viết
// router.post(
//   "/create",
//   authenticateToken,
//   upload.single("image"),
//   postController.createPost
// );

// //get raitngin location
router.get("/ratinginlocation", localtionController.getRatingInLocation);
//get my rating in location
router.get("/myrating", localtionController.getMyRatingLocation);
// API lấy danh sách bài viết của người dùng
router.get("/:id?", localtionController.getLocations);

//api tạo ration cho1 location

router.post("/rating", localtionController.postRatingLocation);
module.exports = router;
