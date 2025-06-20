import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { VideoCall } from "@mui/icons-material";
import {
  getChatWithUser,
  sendMessage,
} from "~/services/chatServices/chatService";
import { CurrentUser, useGlobalContext } from "~/context/GlobalContext";
import { SocketContext } from "~/context/SocketContext";
import { VideoCallContext } from "~/context/VideoCallContext";
import IsUserActive from "~/components/Elements/IsUserActive";

const ChatWindow = ({ onClose, friend }) => {
  // Context hooks
  const { setHaveNewMess, haveNewMess, socket } = useContext(SocketContext);
  const { dispatchMessageState, notifiSound } = useGlobalContext();
  const { currentUserInfo } = useContext(CurrentUser);
  const { setName, setIsCalling, callUser, isCallAccepted } =
    useContext(VideoCallContext);

  // State management
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [friendSocketId, setFriendSocketId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);

  // Refs
  const messagesEndRef = useRef(null);
  const messageBoxRef = useRef(null);
  const prevScrollHeightRef = useRef(0);

  // Get friend's socket ID
  const getFriendSocketId = useCallback(() => {
    if (!friend?.email || !socket) return;

    socket.emit("useridtosocketid", friend.email, (socketId) => {
      setFriendSocketId(socketId);
      console.log(`Socket ID của ${friend.email}: ${socketId}`);
    });
  }, [friend?.email, socket]);

  // Fetch chat messages
  const fetchChatMessages = useCallback(
    async (pageNum = 0, isInitial = false) => {
      if (!friend?._id || loading) return;

      setLoading(true);
      try {
        const data = await getChatWithUser(friend._id, pageNum);

        if (data.length === 0) {
          setHasMore(false);
          return;
        }

        const reversedData = [...data].reverse();

        if (isInitial) {
          setMessages(reversedData);
        } else {
          setMessages((prev) => [...reversedData, ...prev]);
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setLoading(false);
      }
    },
    [friend?._id, loading]
  );

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Handle sending message
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !friend?._id) return;

    const messageContent = newMessage.trim();
    const tempMessage = {
      content: messageContent,
      createdAt: "Just now",
      receiverId: friend._id,
      senderId: currentUserInfo._id,
    };

    // Optimistically add message to UI
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      // Send message to server
      await sendMessage(friend._id, friend.email, messageContent);

      // Send message via socket
      const payload = {
        senderEmail: currentUserInfo?.email,
        receiverEmail: friend?.email,
        message: messageContent,
      };

      dispatchMessageState({ type: "chat/send", payload });

      // Scroll to bottom after sending
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove optimistic message on error
      setMessages((prev) => prev.slice(0, -1));
    }
  }, [
    newMessage,
    friend?._id,
    friend?.email,
    currentUserInfo?._id,
    currentUserInfo?.email,
    dispatchMessageState,
    scrollToBottom,
  ]);
  console.log("currentUserInfo", currentUserInfo);
  useEffect(() => {
    setName({
      name: currentUserInfo?.username || "Unknown",
      avatar: currentUserInfo?.avatar || "",
    });
  }, []);
  // Handle video call
  const handleVideoCall = useCallback(() => {
    if (!friendSocketId) {
      console.error("Friend's socket ID is not available");
      return;
    }

    try {
      setIsCalling(true);
      callUser(friendSocketId);
    } catch (error) {
      console.error("Failed to initiate call:", error);
    }
  }, [
    friendSocketId,
    currentUserInfo?.username,
    setName,
    setIsCalling,
    callUser,
  ]);

  // Handle scroll for pagination
  const handleScroll = useCallback(() => {
    const container = messageBoxRef.current;
    if (!container || !hasMore || loading) return;

    if (container.scrollTop === 0) {
      prevScrollHeightRef.current = container.scrollHeight;
      const nextPage = page + 1;
      setPage(nextPage);
      fetchChatMessages(nextPage, false);
    }
  }, [hasMore, loading, page, fetchChatMessages]);

  // Handle received messages
  const handleReceiveMessage = useCallback(
    ({ senderEmail, message }) => {
      const newMsg = {
        content: message,
        createdAt: "Just now",
        receiverId: currentUserInfo._id,
        senderId: senderEmail,
      };

      setMessages((prev) => [...prev, newMsg]);
      notifiSound?.play();
      setHaveNewMess((prev) => !prev);
    },
    [currentUserInfo._id, notifiSound, setHaveNewMess]
  );

  // Handle key press
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Initialize component
  useEffect(() => {
    if (friend?._id && initialLoad) {
      fetchChatMessages(0, true);
      setInitialLoad(false);
    }
  }, [friend?._id, initialLoad, fetchChatMessages]);

  // Get friend socket ID on mount
  useEffect(() => {
    getFriendSocketId();
  }, [getFriendSocketId]);

  // Socket message listener
  useEffect(() => {
    if (!socket) return;

    socket.on("personalChat", handleReceiveMessage);
    return () => {
      socket.off("personalChat", handleReceiveMessage);
    };
  }, [socket, handleReceiveMessage]);

  // Adjust scroll position after loading more messages
  useLayoutEffect(() => {
    if (!loading && prevScrollHeightRef.current && messages.length > 0) {
      const container = messageBoxRef.current;
      if (container) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeightRef.current;
      }
    }
  }, [messages, loading]);

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (!loading && messages.length > 0) {
      const container = messageBoxRef.current;
      if (container) {
        const isAtBottom =
          container.scrollHeight - container.clientHeight <=
          container.scrollTop + 1;
        if (isAtBottom || initialLoad) {
          scrollToBottom();
        }
      }
    }
  }, [messages, loading, initialLoad, scrollToBottom]);

  // Don't render if call is accepted
  if (isCallAccepted) {
    return null;
  }

  return (
    <Box
      component={Paper}
      elevation={6}
      sx={{
        position: "fixed",
        right: "1rem",
        bottom: 20,
        width: 420,
        maxHeight: 550,
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        boxShadow: "0px 5px 18px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
        backgroundColor: "#f0f2f5",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 2,
          borderBottom: "1px solid #ddd",
          backgroundColor: "#fff",
          borderRadius: "12px 12px 0 0",
        }}
      >
        <Box display="flex" alignItems="center">
          <Avatar
            src={friend?.avatar}
            alt={friend?.username}
            sx={{ width: 45, height: 45, marginRight: 1.5 }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
              {friend?.username}
            </Typography>
            <IsUserActive userId={friend?.email} />
          </Box>
        </Box>

        <Box display="flex" gap={1}>
          <IconButton
            onClick={handleVideoCall}
            disabled={!friendSocketId}
            sx={{ color: "#1a97f2" }}
          >
            <VideoCall fontSize="large" />
          </IconButton>
          <IconButton onClick={onClose}>
            <CloseIcon fontSize="large" />
          </IconButton>
        </Box>
      </Box>

      {/* Messages Section */}
      <Box
        ref={messageBoxRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflowY: "auto",
          padding: 2,
          backgroundColor: "#f0f0f0",
          scrollBehavior: "smooth",
        }}
      >
        {/* Loading indicator */}
        {loading && (
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <CircularProgress size={20} />
          </Box>
        )}

        {/* No more messages indicator */}
        {!hasMore && messages.length > 0 && (
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              No more messages to display
            </Typography>
          </Box>
        )}

        {/* Messages */}
        {messages.map((message, index) => (
          <Box
            key={`${message.senderId}-${message.createdAt}-${index}`}
            sx={{
              display: "flex",
              justifyContent:
                message.senderId === currentUserInfo?._id
                  ? "flex-end"
                  : "flex-start",
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                maxWidth: "75%",
                padding: 1.5,
                borderRadius: "18px",
                backgroundColor:
                  message.senderId === currentUserInfo?._id
                    ? "#0866ff"
                    : "#e4e6eb",
                color:
                  message.senderId === currentUserInfo?._id ? "white" : "black",
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                wordBreak: "break-word",
              }}
            >
              <Typography variant="body2">{message.content}</Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: 10,
                  display: "block",
                  textAlign: "right",
                  marginTop: 0.5,
                  opacity: 0.6,
                }}
              >
                {message.createdAt}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: 1.5,
          borderTop: "1px solid #ddd",
          backgroundColor: "#fff",
          borderRadius: "0 0 12px 12px",
        }}
      >
        <TextField
          fullWidth
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          variant="outlined"
          sx={{
            marginRight: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: "20px",
              backgroundColor: "#f8f9fa",
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          sx={{
            borderRadius: "50%",
            minWidth: "auto",
            padding: "10px",
            backgroundColor: "#1877f2",
            "&:hover": { backgroundColor: "#166fe5" },
            "&:disabled": { backgroundColor: "#ccc" },
          }}
        >
          <SendIcon fontSize="medium" />
        </Button>
      </Box>
    </Box>
  );
};

export default ChatWindow;
