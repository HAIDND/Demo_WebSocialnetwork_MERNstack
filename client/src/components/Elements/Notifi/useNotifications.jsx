// ===== REACT HOOKS =====

import { useState, useEffect, useCallback, useContext } from "react";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "./NotificationAPI";
import { CurrentUser } from "~/context/GlobalContext";

// Hook để quản lý notifications
export const useNotifications = () => {
  const { currentUserInfo } = useContext(CurrentUser);
  let userId = currentUserInfo?._id;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Lấy danh sách notifications
  const fetchNotifications = useCallback(
    async (page = 1, type = null) => {
      try {
        setLoading(true);
        setError(null);

        const params = { page, limit: 20 };
        if (type) params.type = type;

        const response = await getUserNotifications(userId, params);

        if (response.success) {
          setNotifications(response.data.notifications);
          setUnreadCount(response.data.unreadCount);
          setCurrentPage(response.data.currentPage);
          setTotalPages(response.data.totalPages);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Đánh dấu đã đọc
  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        const response = await markAsRead(userId, notificationId);

        if (response.success) {
          setNotifications((prev) =>
            prev.map((notif) =>
              notif._id === notificationId ? { ...notif, isRead: true } : notif
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        setError(err.message);
      }
    },
    [userId]
  );

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await markAllAsRead(userId);

      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [userId]);

  // Xóa notification
  const deleteNotification = useCallback(
    async (notificationId) => {
      try {
        const response = await deleteNotification(userId, notificationId);

        if (response.success) {
          const deletedNotif = notifications.find(
            (n) => n._id === notificationId
          );
          setNotifications((prev) =>
            prev.filter((notif) => notif._id !== notificationId)
          );

          if (deletedNotif && !deletedNotif.isRead) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      } catch (err) {
        setError(err.message);
      }
    },
    [userId, notifications]
  );

  // Lấy số lượng chưa đọc
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadCount(userId);
      if (response.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error("Lỗi lấy số lượng chưa đọc:", err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [userId, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    currentPage,
    totalPages,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchUnreadCount,
  };
};
// ===== HELPER FUNCTIONS =====

// Helper function để tạo messageNote dựa trên type
export const generateMessageNote = (type, senderName) => {
  const messages = {
    friend_request: `vừa gửi lời mời kết bạn`,
    like_post: `vừa like bài viết của bạn`,
    comment_post: `vừa bình luận bài viết của bạn`,
    friend_post: `vừa đăng bài viết mới`,
  };

  return messages[type] || "có hoạt động mới";
};

// Helper function để tạo linkClick dựa trên type
export const generateLinkClick = (type, postId, userId) => {
  switch (type) {
    case "friend_request":
      return `/profile/${userId}`;
    case "like_post":
    case "comment_post":
    case "friend_post":
      return `/posts/${postId}`;
    default:
      return "/";
  }
};
