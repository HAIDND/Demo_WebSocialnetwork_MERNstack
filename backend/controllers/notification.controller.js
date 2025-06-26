const UserNotification = require("../models/Notification");

// exports.createNotification = async ({
//   userId,
//   type,
//   sender,
//   messageNote,
//   linkClick,
//   postId,
//   commentId,
// }) => {
//   console.log("careta notifi");
//   if (!userId || !type || !sender || !messageNote) {
//     throw new Error("Thiếu thông tin bắt buộc khi tạo notification");
//   }

//   const newNotification = {
//     type,
//     sender: {
//       id: sender.id,
//       avatar: sender.avatar || "",
//       username: sender.username,
//     },
//     messageNote,
//     linkClick: linkClick || "",
//     postId: postId || null,
//     commentId: commentId || null,
//     isRead: false,
//     createdAt: new Date(),
//   };

//   let userNotification = await UserNotification.findOne({ userId });

//   if (!userNotification) {
//     userNotification = new UserNotification({
//       userId,
//       notifications: [newNotification],
//       unreadCount: 1,
//     });
//   } else {
//     userNotification.notifications.unshift(newNotification);
//     userNotification.unreadCount += 1;

//     if (userNotification.notifications.length > 100) {
//       userNotification.notifications = userNotification.notifications.slice(
//         0,
//         100
//       );
//     }
//   }

//   await userNotification.save();

//   return newNotification;
// };

exports.createNotification = async ({
  userId,
  type,
  sender,
  messageNote,
  linkClick,
  postId,
  commentId,
}) => {
  if (!userId || !type || !sender || !messageNote) {
    throw new Error("Thiếu thông tin bắt buộc khi tạo notification");
  }

  const newNotification = {
    type,
    sender: {
      id: sender.id,
      avatar: sender.avatar || "",
      username: sender.username,
    },
    messageNote,
    linkClick: linkClick || "",
    postId: postId || null,
    commentId: commentId || null,
    isRead: false,
    createdAt: new Date(),
  };

  let userNotification = await UserNotification.findOne({ userId });

  if (!userNotification) {
    userNotification = new UserNotification({
      userId,
      notifications: [newNotification],
      unreadCount: 1,
    });
  } else {
    userNotification.notifications.unshift(newNotification);
    userNotification.unreadCount += 1;

    if (userNotification.notifications.length > 100) {
      userNotification.notifications = userNotification.notifications.slice(
        0,
        100
      );
    }
  }

  await userNotification.save();

  return newNotification;
};

exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    const skip = (page - 1) * limit;

    let userNotification = await UserNotification.findOne({ userId });

    if (!userNotification) {
      return res.status(200).json({
        success: true,
        data: {
          notifications: [],
          unreadCount: 0,
          totalCount: 0,
          currentPage: parseInt(page),
          totalPages: 0,
        },
      });
    }

    let notifications = userNotification.notifications;

    // Filter theo type nếu có
    if (type) {
      notifications = notifications.filter((notif) => notif.type === type);
    }

    // Pagination
    const totalCount = notifications.length;
    const totalPages = Math.ceil(totalCount / limit);
    const paginatedNotifications = notifications.slice(
      skip,
      skip + parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        unreadCount: userNotification.unreadCount,
        totalCount,
        currentPage: parseInt(page),
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
// Đánh dấu notification đã đọc

exports.markAsRead = async (req, res) => {
  try {
    const { userId, notificationId } = req.params;

    const userNotification = await UserNotification.findOne({ userId });

    if (!userNotification) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy notification",
      });
    }

    const notification = userNotification.notifications.id(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy notification",
      });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      userNotification.unreadCount = Math.max(
        0,
        userNotification.unreadCount - 1
      );
      await userNotification.save();
    }

    res.status(200).json({
      success: true,
      message: "Đánh dấu đã đọc thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
// Đánh dấu tất cả notification đã đọc
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await UserNotification.updateOne(
      { userId },
      {
        $set: {
          "notifications.$[].isRead": true,
          unreadCount: 0,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    res.status(200).json({
      success: true,
      message: "Đánh dấu tất cả đã đọc thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Xóa notification
exports.deleteNotification = async (req, res) => {
  try {
    const { userId, notificationId } = req.params;

    const userNotification = await UserNotification.findOne({ userId });

    if (!userNotification) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy notification",
      });
    }

    const notification = userNotification.notifications.id(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy notification",
      });
    }

    // Giảm unreadCount nếu notification chưa đọc
    if (!notification.isRead) {
      userNotification.unreadCount = Math.max(
        0,
        userNotification.unreadCount - 1
      );
    }

    userNotification.notifications.pull(notificationId);
    await userNotification.save();

    res.status(200).json({
      success: true,
      message: "Xóa notification thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy số lượng notification chưa đọc
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const userNotification = await UserNotification.findOne({ userId });

    const unreadCount = userNotification ? userNotification.unreadCount : 0;

    res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
class NotificationController {
  // Tạo notification mới
  static async createNotification(req, res) {
    try {
      const {
        userId,
        type,
        sender,
        messageNote,
        linkClick,
        postId,
        commentId,
      } = req.body;

      // Validate input
      if (!userId || !type || !sender || !messageNote) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin bắt buộc",
        });
      }

      const newNotification = {
        type,
        sender: {
          id: sender.id,
          avatar: sender.avatar || "",
          username: sender.username,
        },
        messageNote,
        linkClick: linkClick || "",
        postId: postId || null,
        commentId: commentId || null,
        isRead: false,
        createdAt: new Date(),
      };

      // Tìm hoặc tạo document notification cho user
      let userNotification = await UserNotification.findOne({ userId });

      if (!userNotification) {
        userNotification = new UserNotification({
          userId,
          notifications: [newNotification],
          unreadCount: 1,
        });
      } else {
        userNotification.notifications.unshift(newNotification);
        userNotification.unreadCount += 1;

        // Giới hạn số lượng notification (giữ 100 notification mới nhất)
        if (userNotification.notifications.length > 100) {
          userNotification.notifications = userNotification.notifications.slice(
            0,
            100
          );
        }
      }

      await userNotification.save();

      res.status(201).json({
        success: true,
        message: "Tạo notification thành công",
        data: newNotification,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }

  // Lấy danh sách notification của user
  static async getUserNotifications(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20, type } = req.query;

      const skip = (page - 1) * limit;

      let userNotification = await UserNotification.findOne({ userId });

      if (!userNotification) {
        return res.status(200).json({
          success: true,
          data: {
            notifications: [],
            unreadCount: 0,
            totalCount: 0,
            currentPage: parseInt(page),
            totalPages: 0,
          },
        });
      }

      let notifications = userNotification.notifications;

      // Filter theo type nếu có
      if (type) {
        notifications = notifications.filter((notif) => notif.type === type);
      }

      // Pagination
      const totalCount = notifications.length;
      const totalPages = Math.ceil(totalCount / limit);
      const paginatedNotifications = notifications.slice(
        skip,
        skip + parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: {
          notifications: paginatedNotifications,
          unreadCount: userNotification.unreadCount,
          totalCount,
          currentPage: parseInt(page),
          totalPages,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }

  // Đánh dấu notification đã đọc
  static async markAsRead(req, res) {
    try {
      const { userId, notificationId } = req.params;

      const userNotification = await UserNotification.findOne({ userId });

      if (!userNotification) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy notification",
        });
      }

      const notification = userNotification.notifications.id(notificationId);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy notification",
        });
      }

      if (!notification.isRead) {
        notification.isRead = true;
        userNotification.unreadCount = Math.max(
          0,
          userNotification.unreadCount - 1
        );
        await userNotification.save();
      }

      res.status(200).json({
        success: true,
        message: "Đánh dấu đã đọc thành công",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }

  // Đánh dấu tất cả notification đã đọc
  static async markAllAsRead(req, res) {
    try {
      const { userId } = req.params;

      const result = await UserNotification.updateOne(
        { userId },
        {
          $set: {
            "notifications.$[].isRead": true,
            unreadCount: 0,
          },
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user",
        });
      }

      res.status(200).json({
        success: true,
        message: "Đánh dấu tất cả đã đọc thành công",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }

  // Xóa notification
  static async deleteNotification(req, res) {
    try {
      const { userId, notificationId } = req.params;

      const userNotification = await UserNotification.findOne({ userId });

      if (!userNotification) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy notification",
        });
      }

      const notification = userNotification.notifications.id(notificationId);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy notification",
        });
      }

      // Giảm unreadCount nếu notification chưa đọc
      if (!notification.isRead) {
        userNotification.unreadCount = Math.max(
          0,
          userNotification.unreadCount - 1
        );
      }

      userNotification.notifications.pull(notificationId);
      await userNotification.save();

      res.status(200).json({
        success: true,
        message: "Xóa notification thành công",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }

  // Lấy số lượng notification chưa đọc
  static async getUnreadCount(req, res) {
    try {
      const { userId } = req.params;

      const userNotification = await UserNotification.findOne({ userId });

      const unreadCount = userNotification ? userNotification.unreadCount : 0;

      res.status(200).json({
        success: true,
        data: { unreadCount },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }
}
