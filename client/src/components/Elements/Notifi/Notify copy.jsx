import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  CircularProgress,
  Divider,
  Button,
  Chip,
  Paper,
} from "@mui/material";
import {
  Close,
  Message,
  ThumbUp,
  Comment,
  Share,
  PersonAdd,
  Check,
  Clear,
  Notifications,
  Chat,
  Favorite,
} from "@mui/icons-material";
import { useNotifications } from "./useNotifications";

// Mock data và utilities
const NOTIFICATION_TYPES = {
  CHAT: "chat",
  ACTIVITY: "activity",
  FRIEND_REQUEST: "friend_request",
};

const ACTIVITY_TYPES = {
  LIKE: "like",
  COMMENT: "comment",
  SHARE: "share",
};

// Component cho từng loại thông báo
const ChatNotificationItem = ({ notification, onClick }) => {
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return "Vừa xong";
  };

  return (
    <ListItem
      button
      onClick={() => onClick(`/chat/${notification.senderId}`)}
      sx={{
        bgcolor: notification.isRead ? "transparent" : "action.hover",
        borderRadius: 2,
        mb: 1,
        "&:hover": {
          bgcolor: "action.selected",
        },
      }}
    >
      <ListItemAvatar>
        <Badge
          badgeContent={<Message sx={{ fontSize: 12 }} />}
          color="primary"
          overlap="circular"
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
        >
          <Avatar src={notification.senderAvatar} />
        </Badge>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {notification.senderName}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {notification.lastMessage}
            </Typography>
          </Box>
        }
        secondary={formatTimeAgo(notification.timestamp)}
      />
      {notification.unreadCount > 0 && (
        <ListItemSecondaryAction>
          <Chip
            label={notification.unreadCount}
            size="small"
            color="primary"
            sx={{ minWidth: 20, height: 20 }}
          />
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

const ActivityNotificationItem = ({ notification, onClick }) => {
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return "Vừa xong";
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case ACTIVITY_TYPES.LIKE:
        return <ThumbUp color="primary" sx={{ fontSize: 16 }} />;
      case ACTIVITY_TYPES.COMMENT:
        return <Comment color="info" sx={{ fontSize: 16 }} />;
      case ACTIVITY_TYPES.SHARE:
        return <Share color="success" sx={{ fontSize: 16 }} />;
      default:
        return <Notifications sx={{ fontSize: 16 }} />;
    }
  };

  const getActivityText = (type, userName) => {
    switch (type) {
      case ACTIVITY_TYPES.LIKE:
        return `${userName} đã thích bài viết của bạn`;
      case ACTIVITY_TYPES.COMMENT:
        return `${userName} đã bình luận về bài viết của bạn`;
      case ACTIVITY_TYPES.SHARE:
        return `${userName} đã chia sẻ bài viết của bạn`;
      default:
        return `${userName} đã tương tác với bạn`;
    }
  };

  return (
    <ListItem
      button
      onClick={() => onClick(`/post/${notification.postId}`)}
      sx={{
        bgcolor: notification.isRead ? "transparent" : "action.hover",
        borderRadius: 2,
        mb: 1,
        "&:hover": {
          bgcolor: "action.selected",
        },
      }}
    >
      <ListItemAvatar>
        <Badge
          badgeContent={getActivityIcon(notification.activityType)}
          color="secondary"
          overlap="circular"
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
        >
          <Avatar src={notification.userAvatar} />
        </Badge>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="body2">
            {getActivityText(notification.activityType, notification.userName)}
          </Typography>
        }
        secondary={formatTimeAgo(notification.timestamp)}
      />
    </ListItem>
  );
};

const FriendRequestNotificationItem = ({
  notification,
  onClick,
  onAccept,
  onDecline,
}) => {
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return "Vừa xong";
  };

  return (
    <ListItem
      sx={{
        bgcolor: notification.isRead ? "transparent" : "action.hover",
        borderRadius: 2,
        mb: 1,
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        width="100%"
        sx={{ cursor: "pointer" }}
        onClick={() => onClick(`/profile/${notification.senderId}`)}
      >
        <ListItemAvatar>
          <Badge
            badgeContent={<PersonAdd sx={{ fontSize: 12 }} />}
            color="warning"
            overlap="circular"
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
          >
            <Avatar src={notification.senderAvatar} />
          </Badge>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant="body2">
              <strong>{notification.senderName}</strong> đã gửi lời mời kết bạn
            </Typography>
          }
          secondary={formatTimeAgo(notification.timestamp)}
        />
      </Box>

      {notification.status === "pending" && (
        <Box display="flex" gap={1} mt={2}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Check />}
            onClick={(e) => {
              e.stopPropagation();
              onAccept(notification.id);
            }}
            sx={{ flex: 1 }}
          >
            Chấp nhận
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Clear />}
            onClick={(e) => {
              e.stopPropagation();
              onDecline(notification.id);
            }}
            sx={{ flex: 1 }}
          >
            Từ chối
          </Button>
        </Box>
      )}

      {notification.status === "accepted" && (
        <Chip
          label="Đã chấp nhận"
          color="success"
          size="small"
          sx={{ alignSelf: "flex-start", mt: 1 }}
        />
      )}

      {notification.status === "declined" && (
        <Chip
          label="Đã từ chối"
          color="default"
          size="small"
          sx={{ alignSelf: "flex-start", mt: 1 }}
        />
      )}
    </ListItem>
  );
};

// Component chính
const NotificationPopup = ({ open, onClose, onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef();

  // Mock data generator
  // const generateMockNotifications = (pageNum, count = 10) => {
  //   const types = Object.values(NOTIFICATION_TYPES);
  //   const activityTypes = Object.values(ACTIVITY_TYPES);

  //   return Array.from({ length: count }, (_, i) => {
  //     const notifId = (pageNum - 1) * count + i + 1;
  //     const type = types[Math.floor(Math.random() * types.length)];
  //     const timestamp = new Date(
  //       Date.now() - Math.random() * 86400000 * 7
  //     ).toISOString();

  //     const baseNotification = {
  //       id: notifId,
  //       type,
  //       timestamp,
  //       isRead: Math.random() > 0.3,
  //     };

  //     switch (type) {
  //       case NOTIFICATION_TYPES.CHAT:
  //         return {
  //           ...baseNotification,
  //           senderId: notifId,
  //           senderName: `User ${notifId}`,
  //           senderAvatar: `https://ui-avatars.io/api/?name=User+${notifId}&background=random`,
  //           lastMessage: `Tin nhắn số ${notifId} từ người dùng...`,
  //           unreadCount: Math.floor(Math.random() * 5) + 1,
  //         };

  //       case NOTIFICATION_TYPES.ACTIVITY:
  //         return {
  //           ...baseNotification,
  //           userId: notifId,
  //           userName: `User ${notifId}`,
  //           userAvatar: `https://ui-avatars.io/api/?name=User+${notifId}&background=random`,
  //           activityType:
  //             activityTypes[Math.floor(Math.random() * activityTypes.length)],
  //           postId: Math.floor(Math.random() * 100) + 1,
  //         };

  //       case NOTIFICATION_TYPES.FRIEND_REQUEST:
  //         return {
  //           ...baseNotification,
  //           senderId: notifId,
  //           senderName: `User ${notifId}`,
  //           senderAvatar: `https://ui-avatars.io/api/?name=User+${notifId}&background=random`,
  //           status: ["pending", "accepted", "declined"][
  //             Math.floor(Math.random() * 3)
  //           ],
  //         };

  //       default:
  //         return baseNotification;
  //     }
  //   });
  // };
  const { fetchNotifications } = useNotifications();
  //fetch api notifi
  const generateMockNotifications = fetchNotifications(0, null);
  const loadNotifications = useCallback(async (pageNum) => {
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const newNotifications = generateMockNotifications(pageNum);

      if (pageNum === 1) {
        setNotifications(newNotifications);
      } else {
        setNotifications((prev) => [...prev, ...newNotifications]);
      }

      if (pageNum >= 5) {
        setHasMore(false);
      }

      setLoading(false);
    }, 1000);
  }, []);

  // Load initial notifications when popup opens
  useEffect(() => {
    if (open && notifications.length === 0) {
      loadNotifications(1);
    }
  }, [open, loadNotifications, notifications.length]);

  // Infinite scroll observer
  const lastNotificationElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            loadNotifications(nextPage);
            return nextPage;
          });
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadNotifications]
  );

  const handleNotificationClick = (route) => {
    onNavigate(route);
    onClose();
  };

  const handleAcceptFriendRequest = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, status: "accepted" } : notif
      )
    );
    // Here you would also make API call to accept friend request
  };

  const handleDeclineFriendRequest = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, status: "declined" } : notif
      )
    );
    // Here you would also make API call to decline friend request
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          //   width: "300px",

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
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>
        <List sx={{ flex: 1, overflow: "auto", px: 2 }}>
          {notifications.map((notification, index) => {
            const isLast = index === notifications.length - 1;

            return (
              <div key={index} ref={isLast ? lastNotificationElementRef : null}>
                {notification.type === NOTIFICATION_TYPES.CHAT && (
                  <ChatNotificationItem
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                )}

                {notification.type === NOTIFICATION_TYPES.ACTIVITY && (
                  <ActivityNotificationItem
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                )}

                {notification.type === NOTIFICATION_TYPES.FRIEND_REQUEST && (
                  <FriendRequestNotificationItem
                    notification={notification}
                    onClick={handleNotificationClick}
                    onAccept={handleAcceptFriendRequest}
                    onDecline={handleDeclineFriendRequest}
                  />
                )}

                {index < notifications.length - 1 && <Divider sx={{ my: 1 }} />}
              </div>
            );
          })}

          {loading && (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          )}

          {!hasMore && notifications.length > 0 && (
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

// Demo component để test
const NotificationDemo = ({ open }) => {
  const [popupOpen, setPopupOpen] = useState(open);
  // const [currentRoute, setCurrentRoute] = useState("/");

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
