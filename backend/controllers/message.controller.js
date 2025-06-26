const Message = require("../models/message");
const User = require("../models/User"); // Mô hình người dùng
const Friendship = require("../models/Friendship");
const moment = require("moment");
const Notification = require("../models/Notification");
const { emitEventToUser } = require("../socketIO/socket");
// Gửi tin nhắn
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, receiverEmail, content } = req.body; // Lấy receiverId và nội dung tin nhắn từ body yêu cầu
    const senderId = req.userId; // Lấy userId từ middleware xác thực

    // Kiểm tra xem người nhận có tồn tại trong hệ thống không
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Kiểm tra xem hai người có là bạn bè không
    const isFriend = await Friendship.findOne({
      $or: [
        { requester: senderId, recipient: receiverId },
        { requester: receiverId, recipient: senderId },
      ],
    });

    if (!isFriend) {
      return res.status(400).json({ message: "Receiver is not a friend" });
    }
    // Tạo tin nhắn mới
    const newMessage = new Message({
      senderId,
      receiverId,
      content,
      createdAt: new Date(),
    });

    // Lưu tin nhắn vào cơ sở dữ liệu
    await newMessage.save();

    // **Tạo thông báo**receiverId, receiverEmail, content
    const temp = {
      senderId: senderId,
      senderName: "Alice",
      senderAvatar: "https://example.com/avatar.jpg",
      receiverId: receiverId,
      receiverName: "Bob",
      type: "message",
    };
    const newNotification = new Notification(temp);
    emitEventToUser(receiverEmail, "newNotifi", temp);

    const saved = await newNotification.save();

    // Trả về tin nhắn vừa tạo
    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// lay dnah sach tin nhắn giũa hai người
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params; // Lấy ID người dùng từ URL
    const currentUserId = req.userId; // Lấy userId của người dùng hiện tại từ middleware xác thực
    console.log("getuserpMessage", req.params.userId);

    const { limit = 10, page = 0 } = req.query;
    console.log("page", page);
    console.log("limit", limit);
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(parseInt(page) * parseInt(limit))
      .limit(parseInt(limit));

    const formattedMessages = messages.map((message) => {
      const now = moment();
      const created = moment(message.createdAt);
      const diffInDays = now.diff(created, "days");

      let formatTime;
      if (diffInDays >= 1) {
        formatTime = created.format("YYYY-MM-DD HH:mm");
      } else {
        formatTime = created.fromNow();
      }

      return {
        ...message.toObject(),
        createdAt: formatTime, // moment(message.createdAt).fromNow() , // Định dạng ngày giờ
      };
    });
    res.status(200).json(formattedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Lấy danh sách những người đã nhắn tin với người dùng hiện tại
exports.getChatUsers = async (req, res) => {
  try {
    const currentUserId = req.userId; // Lấy userId của người dùng hiện tại từ middleware xác thực

    // Tìm tất cả các tin nhắn mà người dùng hiện tại là người gửi hoặc người nhận
    const messages = await Message.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
    });

    // Trích xuất danh sách userId từ tin nhắn
    const userIds = messages.flatMap((msg) =>
      msg.senderId.toString() === currentUserId
        ? msg.receiverId.toString()
        : msg.senderId.toString()
    );

    // Loại bỏ trùng lặp trong danh sách userId
    const uniqueUserIds = [...new Set(userIds)];

    // Lấy thông tin chi tiết của những người dùng này
    const users = await User.find({ _id: { $in: uniqueUserIds } }).select(
      "username avatar email"
    );

    res.status(200).json(users);
  } catch (error) {
    console.error("Error getting chat users:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
