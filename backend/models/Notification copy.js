const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["friend_request", "like_post", "comment_post", "friend_post"],
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // 👉 Quan trọng: để tăng tốc tìm notify theo người nhận
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    note: {
      type: String,
      default: "",
    },
    linkClick: {
      type: String,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true, // Có thể dùng để lọc nhanh notify chưa đọc
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // 👉 tự tạo createdAt
  }
);

// 👉 Index kết hợp (tối ưu nếu thường query theo receiver + isRead + sort theo createdAt)
notificationSchema.index({ receiver: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
