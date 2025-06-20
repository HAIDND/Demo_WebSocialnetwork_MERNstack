// controllers/notificationController.js
const Notification = require("../models/Notification");
const Friendship = require("../models/Friendship");
const User = require("../models/User");
// API Tạo thông báo
exports.createNotification = async ({
  senderId,
  senderName,
  senderAvatar,
  receiverId,
  receiverName,
  type,
  postId = null,
  messageId = null,
}) => {
  try {
    const notification = new Notification({
      senderId,
      senderName,
      senderAvatar,
      receiverId,
      receiverName,
      type,
      postId,
      messageId,
      isRead: false, // mặc định chưa đọc
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// controllers/notificationController.js

// API Lấy thông báo của người dùng
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.userId; // Lấy ID người dùng từ middleware xác thực

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 }) // Mới nhất trước
      .populate("senderId", "username avatar") // Lấy thêm thông tin người gửi
      .populate("postId", "content image") // Lấy nội dung bài viết nếu có
      .populate("messageId"); // Có thể bỏ nếu không dùng

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};
// controllers/notificationController.js

// API Đánh dấu thông báo là đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    return notification;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Gửi thông báo cho bạn bè
exports.sendNotificationsToFriends = async (userId, newPost) => {
  try {
    // Tìm danh sách bạn bè từ bảng Friendship (mối quan hệ đã được chấp nhận)
    const friendships = await Friendship.find({
      $or: [
        { requester: userId, status: "accepted" },
        { recipient: userId, status: "accepted" },
      ],
    });

    // Trích xuất danh sách bạn bè (loại bỏ userId)
    const friends = friendships.map((friendship) =>
      friendship.requester.toString() === userId
        ? friendship.recipient
        : friendship.requester
    );

    if (!friends || friends.length === 0) {
      return; // Không có bạn bè thì không gửi thông báo
    }

    // Tạo thông báo cho người tạo bài viết
    const user = await User.findById(userId).select("username"); // Lấy trường 'name' của người dùng

    // Tạo thông báo gửi đến từng bạn bè
    const notifications = friends.map((friendId) => ({
      userId: friendId, // Người nhận thông báo
      type: "new_post",
      message: `Người dùng ${user.username} đã tạo một bài viết mới.`,
      postId: newPost._id, // Liên kết đến bài viết
      createdAt: new Date(),
    }));

    // Lưu thông báo vào cơ sở dữ liệu
    await Notification.insertMany(notifications);
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
};
