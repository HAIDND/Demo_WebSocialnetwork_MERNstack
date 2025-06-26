const GroupMessage = require("../models/GroupMessage");
const moment = require("moment");
exports.getGroupMessage = async (req, res) => {
  console.log("getGroupMessage", req.params.groupId);
  const { groupId } = req.params;
  const { limit = 20, page = 0 } = req.query;

  try {
    let messages = await GroupMessage.find({ groupId })
      .sort({ createdAt: -1 })
      .skip(parseInt(page) * parseInt(limit))
      .limit(parseInt(limit));

    // Nếu không có tin nhắn nào, tạo một tin nhắn hệ thống rỗng
    // if (messages.length === 0 && page == 0) {
    //   const emptyMessage = await GroupMessage.create({
    //     groupId,
    //     senderId: null,
    //     senderName: "Hệ thống",
    //     senderAvatar: "", // hoặc đặt avatar mặc định
    //     message: "[Chào mừng đến với nhóm chat]",
    //     isSystem: true,
    //   });

    //   messages = [emptyMessage];
    // }
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
    res.status(200).json(formattedMessages.reverse());
    // res.json(messages.reverse()); // đảo thứ tự để client hiển thị đúng thời gian
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load messages", error: err });
  }
};

exports.postGroupMessage = async (req, res) => {
  console.log("postGroupMessage", req.body);
  const { groupId, senderId, senderName, senderAvatar, message } = req.body;

  try {
    const newMessage = await GroupMessage({
      groupId,
      senderId,
      senderName,
      senderAvatar,
      message,
    });
    // const newMessage = new Message({
    //   senderId,
    //   receiverId,
    //   content,
    //   createdAt: new Date(),
    // });

    // Lưu tin nhắn vào cơ sở dữ liệu
    await newMessage.save();
    // Có thể emit ở đây nếu dùng Socket.IO
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message", error: err });
  }
};

//thu hồi tin nhắn
exports.recallGroupMessage = async (req, res) => {
  const { messageId } = req.params;
  const { userId } = req.body;

  try {
    const message = await GroupMessage.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ message: "Not allowed to recall" });
    }

    message.message = "[Message recalled]";
    message.isRecalled = true;
    await message.save();

    res.json({ message: "Message recalled", data: message });
  } catch (err) {
    res.status(500).json({ message: "Failed to recall message", error: err });
  }
};
