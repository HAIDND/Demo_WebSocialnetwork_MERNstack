import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  Typography,
  Box,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Notifications, Close } from "@mui/icons-material";
import { useNotifications } from "./useNotifications"; // Import hook đã tạo

const NotificationPopup = ({ open, onClose, onNavigate, userId }) => {
  const [page, setPage] = useState(1);
  const [allNotifications, setAllNotifications] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const isFirstLoad = useRef(true);

  // Sử dụng hook useNotifications
  const {
    notifications,
    unreadCount,
    loading,
    error,
    totalPages,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(userId);

  // Load notifications khi component mount và khi page thay đổi
  const loadNotifications = useCallback(
    async (pageNum, isNewLoad = false) => {
      try {
        await fetchNotifications(pageNum);
      } catch (err) {
        console.error("Lỗi tải notifications:", err);
      }
    },
    [fetchNotifications]
  );

  // Effect để xử lý việc load notifications
  useEffect(() => {
    if (!open || !userId) return;

    // Reset state khi popup mở lại
    if (isFirstLoad.current) {
      setPage(1);
      setAllNotifications([]);
      setHasMore(true);
      isFirstLoad.current = false;
    }
  }, [open, userId]);

  // Effect để xử lý khi có notifications mới từ API
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    if (page === 1) {
      // Load trang đầu tiên - thay thế toàn bộ
      setAllNotifications(notifications);
    } else {
      // Load thêm trang - append vào cuối
      setAllNotifications((prev) => {
        // Tránh duplicate bằng cách filter
        const existingIds = prev.map((n) => n._id);
        const newNotifications = notifications.filter(
          (n) => !existingIds.includes(n._id)
        );
        return [...prev, ...newNotifications];
      });
    }

    // Kiểm tra còn trang nào không
    setHasMore(page < totalPages);
  }, [notifications, page, totalPages]);

  // Load trang đầu tiên khi popup mở
  useEffect(() => {
    if (open && userId && page === 1) {
      loadNotifications(1, true);
    }
  }, [open, userId, loadNotifications]);

  // Infinite scroll observer
  const lastNotificationElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadNotifications(nextPage);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, page, loadNotifications]
  );

  // Xử lý click notification
  const handleNotificationClick = useCallback(
    async (notification) => {
      try {
        // Đánh dấu đã đọc nếu chưa đọc
        if (!notification.isRead) {
          await markAsRead(notification._id);
        }

        // Navigate đến link
        if (notification.linkClick) {
          onNavigate(notification.linkClick);
        }

        onClose();
      } catch (err) {
        console.error("Lỗi xử lý click notification:", err);
      }
    },
    [markAsRead, onNavigate, onClose]
  );

  // Xử lý accept friend request
  const handleAcceptFriendRequest = useCallback(async (notificationId) => {
    try {
      // TODO: Gọi API accept friend request
      // await friendAPI.acceptFriendRequest(notificationId);

      // Update local state
      setAllNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId
            ? { ...notif, status: "accepted" }
            : notif
        )
      );
    } catch (err) {
      console.error("Lỗi accept friend request:", err);
    }
  }, []);

  // Xử lý decline friend request
  const handleDeclineFriendRequest = useCallback(async (notificationId) => {
    try {
      // TODO: Gọi API decline friend request
      // await friendAPI.declineFriendRequest(notificationId);

      // Update local state
      setAllNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId
            ? { ...notif, status: "declined" }
            : notif
        )
      );
    } catch (err) {
      console.error("Lỗi decline friend request:", err);
    }
  }, []);

  // Xử lý xóa notification
  const handleDeleteNotification = useCallback(
    async (notificationId) => {
      try {
        await deleteNotification(notificationId);
        setAllNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );
      } catch (err) {
        console.error("Lỗi xóa notification:", err);
      }
    },
    [deleteNotification]
  );

  // Xử lý đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setAllNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (err) {
      console.error("Lỗi đánh dấu tất cả đã đọc:", err);
    }
  }, [markAllAsRead]);
  const [popupOpen, setPopupOpen] = useState(open);
  // Reset khi đóng popup
  const handleClose = useCallback(() => {
    isFirstLoad.current = true;
    onClose();
  }, [onClose]);

  // Render notification item dựa trên type
  const renderNotificationItem = (notification, index) => {
    const isLast = index === allNotifications.length - 1;

    switch (notification.type) {
      case "friend_request":
        return (
          <FriendRequestNotificationItem
            key={notification._id}
            notification={notification}
            onClick={() => handleNotificationClick(notification)}
            onAccept={() => handleAcceptFriendRequest(notification._id)}
            onDecline={() => handleDeclineFriendRequest(notification._id)}
            onDelete={() => handleDeleteNotification(notification._id)}
            ref={isLast ? lastNotificationElementRef : null}
          />
        );

      case "like_post":
      case "comment_post":
      case "friend_post":
        return (
          <ActivityNotificationItem
            key={notification._id}
            notification={notification}
            onClick={() => handleNotificationClick(notification)}
            onDelete={() => handleDeleteNotification(notification._id)}
            ref={isLast ? lastNotificationElementRef : null}
          />
        );

      default:
        return (
          <GenericNotificationItem
            key={notification._id}
            notification={notification}
            onClick={() => handleNotificationClick(notification)}
            onDelete={() => handleDeleteNotification(notification._id)}
            ref={isLast ? lastNotificationElementRef : null}
          />
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          height: "80vh",
          maxHeight: 600,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Notifications />
          <Typography variant="h6">Thông báo</Typography>
          {unreadCount > 0 && (
            <Chip label={unreadCount} color="error" size="small" />
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          {unreadCount > 0 && (
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: "pointer", mr: 1 }}
              onClick={handleMarkAllAsRead}
            >
              Đánh dấu tất cả đã đọc
            </Typography>
          )}
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>
        {error && (
          <Box p={2}>
            <Typography color="error" align="center">
              {error}
            </Typography>
          </Box>
        )}

        <List sx={{ flex: 1, overflow: "auto", px: 2 }}>
          {allNotifications.length === 0 && !loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              p={4}
            >
              <Typography color="text.secondary">
                Không có thông báo nào
              </Typography>
            </Box>
          ) : (
            allNotifications.map((notification, index) => (
              <div key={notification._id}>
                {renderNotificationItem(notification, index)}
                {index < allNotifications.length - 1 && (
                  <Divider sx={{ my: 1 }} />
                )}
              </div>
            ))
          )}

          {loading && (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress size={24} />
            </Box>
          )}

          {!hasMore && allNotifications.length > 0 && (
            <Typography
              align="center"
              color="text.secondary"
              sx={{ p: 2 }}
              variant="body2"
            >
              Đã tải hết tất cả thông báo
            </Typography>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

// Component con để render từng loại notification
const FriendRequestNotificationItem = React.forwardRef(
  ({ notification, onClick, onAccept, onDecline, onDelete }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          p: 2,
          bgcolor: notification.isRead ? "transparent" : "action.hover",
          borderRadius: 1,
          cursor: "pointer",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <img
            src={notification.sender.avatar || "/default-avatar.png"}
            alt={notification.sender.username}
            style={{ width: 40, height: 40, borderRadius: "50%" }}
          />

          <Box flex={1}>
            <Typography variant="body2">
              <strong>{notification.sender.username}</strong>{" "}
              {notification.messageNote}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(notification.createdAt).toLocaleString("vi-VN")}
            </Typography>

            {notification.status === "pending" && (
              <Box mt={1} display="flex" gap={1}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept();
                  }}
                >
                  Chấp nhận
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDecline();
                  }}
                >
                  Từ chối
                </button>
              </Box>
            )}
          </Box>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    );
  }
);

const ActivityNotificationItem = React.forwardRef(
  ({ notification, onClick, onDelete }, ref) => {
    return (
      <Box
        ref={ref}
        onClick={onClick}
        sx={{
          p: 2,
          bgcolor: notification.isRead ? "transparent" : "action.hover",
          borderRadius: 1,
          cursor: "pointer",
          "&:hover": { bgcolor: "action.selected" },
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <img
            src={notification.sender.avatar || "/default-avatar.png"}
            alt={notification.sender.username}
            style={{ width: 40, height: 40, borderRadius: "50%" }}
          />

          <Box flex={1}>
            <Typography variant="body2">
              <strong>{notification.sender.username}</strong>{" "}
              {notification.messageNote}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(notification.createdAt).toLocaleString("vi-VN")}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    );
  }
);

const GenericNotificationItem = React.forwardRef(
  ({ notification, onClick, onDelete }, ref) => {
    return (
      <Box
        ref={ref}
        onClick={onClick}
        sx={{
          p: 2,
          bgcolor: notification.isRead ? "transparent" : "action.hover",
          borderRadius: 1,
          cursor: "pointer",
          "&:hover": { bgcolor: "action.selected" },
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box flex={1}>
            <Typography variant="body2">{notification.messageNote}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(notification.createdAt).toLocaleString("vi-VN")}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    );
  }
);

//export default NotificationPopup;
const NotificationDemo = ({ open }) => {
  const [popupOpen, setPopupOpen] = useState(open);
  const [currentRoute, setCurrentRoute] = useState("/");

  const handleNavigate = (route) => {
    setCurrentRoute(route);
    console.log("Navigating to:", route);
    // Ở đây bạn sẽ sử dụng react-router để navigate
    // window.location.href = route; // hoặc sử dụng useNavigate() hook
  };

  return (
    <>
      {/* // <Box
    //   sx={{
    //     p: 4,
    //     textAlign: "center",
    //     border: "1px solid #ccc",
    //     borderRadius: 2,
    //   }}
    // > */}
      {/* <Typography variant="h4" gutterBottom>
        Notification System Demo
      </Typography>

      <Button
        variant="contained"
        startIcon={<Notifications />}
        onClick={() => setPopupOpen(true)}
        sx={{ mb: 2 }}
      >
        Mở Thông Báo
      </Button> */}

      {/* <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6">Current Route:</Typography>
        <Typography color="primary">{currentRoute}</Typography>
      </Paper> */}

      <NotificationPopup
        // open={popupOpen}
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        onNavigate={handleNavigate}
      />
      {/* </Box> */}
    </>
  );
};

export default NotificationDemo;
