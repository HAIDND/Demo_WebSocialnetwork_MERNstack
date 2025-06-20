import { Chat, Close, Send } from "@mui/icons-material";
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  TextField,
  Paper,
  Typography,
  Fab,
} from "@mui/material";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { notifiSound } from "~/assets/RingNotifi/audioNotifi";
import { CurrentUser } from "~/context/GlobalContext";
import socket from "~/context/SocketInitial";
import { getGroupMessage, postGroupMessage } from "./groupChatService";

function GroupChat({ showChat = true, onToggleChat }) {
  const { currentUserInfo } = useContext(CurrentUser);
  const { id } = useParams();

  // State management
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Refs
  const messagesEndRef = useRef(null);
  const messageBoxRef = useRef(null);
  const prevScrollHeightRef = useRef(0);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  // Fetch messages with pagination
  const fetchMessages = async (pageNum = 0, limit = 10) => {
    if (loading) return;

    setLoading(true);
    try {
      const data = await getGroupMessage(id, pageNum, limit);

      if (!Array.isArray(data)) {
        console.error("Invalid data format:", data);
        return;
      }

      if (data.length === 0) {
        setHasMore(false);
        return;
      }

      const reversedData = [...data].reverse();

      if (pageNum === 0) {
        // Initial load
        setMessages(reversedData);
        setIsInitialLoad(false);
        // Scroll to bottom after initial load
        setTimeout(scrollToBottom, 100);
      } else {
        // Pagination load
        setMessages((prev) => [...reversedData, ...prev]);
      }

      setPage(pageNum);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle scroll for infinity scroll
  const handleScroll = () => {
    const container = messageBoxRef.current;
    if (!container || loading || !hasMore) return;

    // Check if scrolled to top
    if (container.scrollTop === 0) {
      const nextPage = page + 1;
      prevScrollHeightRef.current = container.scrollHeight;
      fetchMessages(nextPage);
    }
  };

  // Initial load
  useEffect(() => {
    if (id) {
      fetchMessages(0);
    }
  }, [id]);

  // Socket setup
  useEffect(() => {
    if (!id || !currentUserInfo?.email) return;

    // Join room
    socket.emit("joinOrCreateGroupRoom", {
      groupId: id,
      memberId: currentUserInfo.email,
    });

    // Listen for new messages
    const handleNewMessage = ({
      groupId,
      message,
      senderName,
      senderId,
      createdAt,
    }) => {
      if (senderId !== currentUserInfo.email) {
        notifiSound.play();
      }

      setMessages((prev) => [
        ...prev,
        { senderId, message, senderName, createdAt },
      ]);

      // Auto scroll to bottom for new messages
      setTimeout(scrollToBottom, 100);
    };

    socket.on("groupChat", handleNewMessage);

    // Cleanup
    return () => {
      socket.off("groupChat", handleNewMessage);
      socket.emit("leaveRoom", {
        groupId: id,
        memberId: currentUserInfo.email,
      });
    };
  }, [id, currentUserInfo?.email]);

  // Handle scroll position after loading older messages
  useLayoutEffect(() => {
    if (!loading && prevScrollHeightRef.current && !isInitialLoad) {
      const container = messageBoxRef.current;
      if (container) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeightRef.current;
      }
    }
  }, [messages, loading, isInitialLoad]);

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();

    if (!newMessage.trim() || !currentUserInfo) return;

    const messageData = {
      groupId: id,
      message: newMessage.trim(),
      senderId: currentUserInfo.email,
      senderName: currentUserInfo.username,
    };

    try {
      // Emit to socket
      socket.emit("groupChat", messageData);

      // Save to database
      await postGroupMessage({
        ...messageData,
        senderAvatar: currentUserInfo.avatar,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Handle chat toggle
  const handleCloseChat = () => {
    if (onToggleChat) {
      onToggleChat(false);
    }
  };

  // Don't render if chat is hidden
  if (!showChat) return null;

  return (
    <Paper
      sx={{
        padding: 1,
        borderRadius: 2,
        width: 350,
        display: "flex",
        flexDirection: "column",
        borderLeft: 1,
        borderColor: "divider",
        height: "85vh",
        position: "fixed",
        right: 0,
        top: "15vh",
        backgroundColor: "secondary.main",
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h6">Live Chat</Typography>
        <IconButton onClick={handleCloseChat} size="small">
          <Close />
        </IconButton>
      </Box>

      <Divider />

      {/* Messages Container */}
      <Box
        ref={messageBoxRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflowY: "auto",
          padding: 2,
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {/* Loading indicator for pagination */}
        {loading && hasMore && (
          <Box sx={{ textAlign: "center", py: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="caption" sx={{ ml: 1 }}>
              Loading messages...
            </Typography>
          </Box>
        )}

        {/* No more messages indicator */}
        {!hasMore && messages.length > 0 && (
          <Box sx={{ textAlign: "center", py: 1 }}>
            <Typography variant="caption" color="textSecondary">
              No more messages to display
            </Typography>
          </Box>
        )}

        {/* Messages */}
        {messages.map((msg, idx) => {
          const isOwnMessage = msg.senderId === currentUserInfo?.email;

          return (
            <Box
              key={`${msg.senderId}-${msg.createdAt}-${idx}`}
              sx={{
                display: "flex",
                justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                mb: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: isOwnMessage ? "row-reverse" : "row",
                  alignItems: "flex-start",
                  gap: 1,
                  maxWidth: "80%",
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: isOwnMessage ? "#e3f2fd" : "#f5f5f5",
                  border: "1px solid #e0e0e0",
                }}
              >
                <Avatar
                  src={msg.senderAvatar}
                  sx={{ width: 32, height: 32, flexShrink: 0 }}
                >
                  {msg.senderName?.charAt(0)?.toUpperCase()}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    color={isOwnMessage ? "primary" : "secondary"}
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    {msg.senderName}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.message}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}

        {/* Empty state */}
        {messages.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="textSecondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          gap: 1,
          backgroundColor: "#fff",
        }}
      >
        <TextField
          fullWidth
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          size="small"
          variant="outlined"
          multiline
          maxRows={3}
          sx={{
            backgroundColor: "#f8f9fa",
            "& .MuiOutlinedInput-root": {
              borderRadius: "20px",
            },
          }}
        />

        <IconButton
          type="submit"
          color="primary"
          disabled={!newMessage.trim()}
          sx={{
            alignSelf: "flex-end",
            mb: 0.5,
          }}
        >
          <Send />
        </IconButton>
      </Box>
    </Paper>
  );
}

// export default GroupChat;

// Example parent component showing how to use the GroupChat with toggle functionality
function ChatContainer() {
  const [showChat, setShowChat] = useState(false);

  const handleToggleChat = (isVisible) => {
    setShowChat(isVisible);
  };

  return (
    <>
      {/* Floating Action Button to open chat */}
      {!showChat && (
        <Fab
          color="primary"
          aria-label="chat"
          // sx={{
          //   position: "relative",
          //   bottom: 26,
          //   right: 0,
          //   // zIndex: 1000,
          // }}
          onClick={() => setShowChat(true)}
        >
          <Chat />
        </Fab>
      )}

      {/* Group Chat Component */}
      <GroupChat showChat={showChat} onToggleChat={handleToggleChat} />
    </>
  );
}

export default ChatContainer;
