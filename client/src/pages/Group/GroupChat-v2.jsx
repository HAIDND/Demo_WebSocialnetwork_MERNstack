import { Close, Send } from "@mui/icons-material";
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Input,
  Paper,
  TextField,
  Typography,
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

function GroupChat() {
  const { currentUserInfo } = useContext(CurrentUser);

  //old
  const { id } = useParams();

  const newMessage = useRef("");
  const messagesEndRef = useRef(null);
  const messageBoxRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const prevScrollHeightRef = useRef(0);
  const [page, setPage] = useState(0);
  // Load ban đầu
  useEffect(() => {
    const initLoad = async () => {
      const data = await getGroupMessage(id, page, 10);
      console.log("data", data);
      setMessages(Array.isArray(data) ? data : []);
      scrollToBottom(); // Scroll xuống tin mới nhất
    };
    initLoad();
  }, [id]);
  //fetch
  const fetchChatList = async () => {
    setLoading(true);
    try {
      const data = await getGroupMessage(id, page);
      // setMessages(data.reverse());
      if (data.length === 0) {
        setHasMore(false);
      }
      data.reverse();
      setMessages((prev) => [...data, ...prev]);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleScroll = async () => {
    const nextPage = page + 1;
    const container = messageBoxRef.current;
    if (container.scrollTop === 0 && hasMore && !loading) {
      prevScrollHeightRef.current = container.scrollHeight;
      await fetchChatList(id, nextPage);
      setPage(nextPage);
    }
  };
  // Tải thêm khi scroll tới đầu
  // useEffect(() => {
  //   if (loadingMore || !hasMore) return;
  //   if (observer.current) observer.current.disconnect();
  //   observer.current = new IntersectionObserver(
  //     async (entries) => {
  //       if (entries[0].isIntersecting) {
  //         setLoadingMore(true);
  //         const container = chatRef.current;
  //         const previousScrollHeight = container.scrollHeight;
  //         const nextPage = page + 1;
  //         const more = await getGroupMessage(id, nextPage);
  //         if (more.length === 0) {
  //           setHasMore(false);
  //         } else {
  //           setMessages((prev) => [...more, ...prev]);
  //           setPage(nextPage);
  //           // Giữ nguyên vị trí cuộn
  //           setTimeout(() => {
  //             const newScrollHeight = container.scrollHeight;
  //             container.scrollTop =
  //               newScrollHeight - previousScrollHeight + 400;
  //           }, 100);
  //         }
  //         setLoadingMore(false);
  //       }
  //     },
  //     {
  //       root: chatRef.current,
  //       threshold: 0.1,
  //     }
  //   );
  //   if (topMessageRef.current) {
  //     observer.current.observe(topMessageRef.current);
  //   }
  // }, [messages, page, hasMore, loadingMore]);
  //efect mout socket
  useEffect(() => {
    async () => {
      await fetchChatList();
    };
  }, []);
  // Scroll xuống cuối
  function scrollToBottom() {
    if (messagesEndRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", top: 200 });
    }
  }
  useEffect(() => {
    socket.emit("joinOrCreateGroupRoom", {
      groupId: id,
      memberId: currentUserInfo?.email,
    });
    // Nghe nhận tin nhắn realtime
    socket.on(
      "groupChat",
      ({ groupId, message, senderName, senderId, createdAt }) => {
        if (senderId !== currentUserInfo?.email) {
          notifiSound.play();
        }
        setMessages((prev) => [
          ...prev,
          { senderId, message, senderName, createdAt },
        ]);
      }
    );
    return () => {
      socket.off("groupChat");
      socket.emit("leaveRoom", {
        groupId: id,
        memberId: currentUserInfo?.email,
      });
    };
  }, []);
  //send messs
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    socket.emit("groupChat", {
      groupId: id,
      message: newMessage,
      senderId: currentUserInfo?.email,
      senderName: currentUserInfo?.username,
    });
    await postGroupMessage({
      senderAvatar: currentUserInfo?.avatar,
      groupId: id,
      message: newMessage,
      senderId: currentUserInfo?.email,
      senderName: currentUserInfo?.username,
    });
    setNewMessage("");
  };
  useLayoutEffect(() => {
    if (!loading && prevScrollHeightRef.current && messages.length > 0) {
      const container = messageBoxRef.current;
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - prevScrollHeightRef.current;
    }
  }, [messages]);
  return (
    <div>
      <Paper
        sx={{
          width: 350,
          display: "flex",
          flexDirection: "column",
          borderLeft: 1,
          borderColor: "divider",
          height: "85vh",
          position: "fixed",
          backgroundColor: "#f0f0f0",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Live Chat</Typography>
          <IconButton onClick={() => setShowChat(false)} size="small">
            <Close />
          </IconButton>
        </Box>
        <Divider />
        {/* Messages */}{" "}
        {loading && (
          <Box sx={{ textAlign: "center", mb: 1 }}>
            <CircularProgress size={20} />
          </Box>
        )}
        {!hasMore && (
          <Box
            sx={{
              textAlign: "center",

              backgroundColor: "#ffffff",
            }}
          >
            <Typography>No more messages to display</Typography>
          </Box>
        )}
        <Box
          ref={messageBoxRef}
          onScroll={handleScroll}
          sx={{
            flex: 1,
            overflowY: "auto",
            padding: 2,
            backgroundColor: "#ffffff",
            scrollBehavior: "smooth",
          }}
        >
          {messages.length > 0 &&
            messages.map((msg, idx) => {
              const isOwnMessage = msg.senderId === currentUserInfo?.email;
              return (
                <Box
                  key={idx}
                  // ref={idx === 0 ? topMessageRef : null} // Theo dõi tin đầu tiên
                  sx={{
                    display: "flex",
                    justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: isOwnMessage ? "row-reverse" : "row",
                      alignItems: "flex-start",
                      gap: 1,
                      maxWidth: "80%",
                      padding: 1,
                      borderRadius: 2,
                      backgroundColor: isOwnMessage ? "#d1e7dd" : "#f0f0f0",
                      border: "1px solid #ccc",
                    }}
                  >
                    <Avatar
                      src={msg?.senderAvatar}
                      sx={{ width: 32, height: 32 }}
                    />
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color={isOwnMessage ? "secondary" : "primary"}
                      >
                        {msg.senderName}
                      </Typography>
                      <Typography variant="body2">{msg.message}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {msg.createdAt}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          <div ref={messagesEndRef} />
        </Box>
        {/* Chat Input */}
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            gap: 1,
          }}
        >
          <Input
            fullWidth
            placeholder="Typing message..."
            // value={newMessage}
            // onChange={(e) => setNewMessage(e.target.value)}
            inputRef={newMessage}
            // onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            size="small"
            variant="outlined"
            sx={{
              marginRight: 1,

              backgroundColor: "#f8f9fa",
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
              },
            }}
          />
          <IconButton
            type="submit"
            color="primary"
            // disabled={!newMessage.trim()}
          >
            <Send />
          </IconButton>
        </Box>
      </Paper>
    </div>
  );
}
export default GroupChat;
