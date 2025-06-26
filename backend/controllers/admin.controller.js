const User = require("../models/User");
const Post = require("../models/Post");
const Group = require("../models/group");
const Message = require("../models/message");
const Notification = require("../models/Notification");
const Friendship = require("../models/Friendship");

// Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Không trả về trường password
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Xóa người dùng theo ID
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

// Thay đổi vai trò người dùng (e.g., từ user thành admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User role updated", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating role", error });
  }
};

// Lấy danh sách tất cả bài viết
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("userId", "username email");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
  }
};

// Xóa bài viết theo ID
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error });
  }
};

// Lấy danh sách tất cả nhóm
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate("creator", "username email");
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Error fetching groups", error });
  }
};

// Xóa nhóm theo ID
exports.deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    await Group.findByIdAndDelete(groupId);
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting group", error });
  }
};

// Lấy danh sách tất cả tin nhắn
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("senderId", "username email")
      .populate("receiverId", "username email");
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
};

// Xóa tin nhắn theo ID
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    await Message.findByIdAndDelete(messageId);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting message", error });
  }
};

// Lấy danh sách thông báo
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().populate(
      "userId",
      "username email"
    );
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error });
  }
};

// Xóa thông báo theo ID
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting notification", error });
  }
};

// Lấy danh sách bạn bè
exports.getAllFriendships = async (req, res) => {
  try {
    const friendships = await Friendship.find()
      .populate("requester", "username email")
      .populate("recipient", "username email");
    res.status(200).json(friendships);
  } catch (error) {
    res.status(500).json({ message: "Error fetching friendships", error });
  }
};

// Xóa mối quan hệ bạn bè theo ID
exports.deleteFriendship = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const friendship = await Friendship.findById(friendshipId);
    if (!friendship) {
      return res.status(404).json({ message: "Friendship not found" });
    }
    await Friendship.findByIdAndDelete(friendshipId);
    res.status(200).json({ message: "Friendship deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting friendship", error });
  }
};
