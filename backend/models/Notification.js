// ===== MONGOOSE MODEL =====
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema cho người gửi notification
const senderSchema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

// Schema cho từng notification item
const notificationItemSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["friend_request", "like_post", "comment_post", "friend_post"],
      required: true,
    },
    sender: {
      type: senderSchema,
      required: true,
    },
    messageNote: {
      type: String,
      required: true,
    },
    linkClick: {
      type: String,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // Các trường bổ sung cho từng loại notification
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  { _id: true }
);

// Schema chính cho notification của user
const userNotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    notifications: [notificationItemSchema],
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index để tối ưu query
userNotificationSchema.index({ userId: 1 });
userNotificationSchema.index({ "notifications.isRead": 1 });
userNotificationSchema.index({ "notifications.createdAt": -1 });

module.exports = mongoose.model("UserNotification", userNotificationSchema);
