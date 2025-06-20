import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useLayoutEffect,
} from "react";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Button,
  Paper,
  Input,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import {
  getChatWithUser,
  sendMessage,
} from "~/services/chatServices/chatService";
import { CurrentUser, useGlobalContext } from "~/context/GlobalContext";
import { VideoCall } from "@mui/icons-material";

import { SocketContext } from "~/context/SocketContext";
import IsUserActive from "~/components/Elements/IsUserActive";
import { VideoCallContext } from "~/context/VideoCallContext";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return `${seconds} giây trước`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

const ChatWindow = ({ onClose, friend }) => {
  const { setHaveNewMess, haveNewMess, socket } = useContext(SocketContext);
  const { dispatchMessageState } = useGlobalContext();
  const { currentUserInfo } = useContext(CurrentUser);
  const {
    setName,
    setIsCalling,
    callUser,
    isCallAccepted,
    getUserMediaStream,
  } = useContext(VideoCallContext);
  // const [newMessage, setNewMessage] = useState("");
  const [friendSocketId, setFriendSocketId] = useState(null);

  const newMessage = useRef("");
  const messagesEndRef = useRef(null);
  const messageBoxRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const prevScrollHeightRef = useRef(0);
  const [page, setPage] = useState(0);

  ///old
  const scrollContainerRef = useRef(null);
  const [isFetching, setIsFetching] = useState(false);
  // Gửi friendId lên server để lấy socketId của bạn bè
  const getFriendSocketId = () => {
    socket.emit("useridtosocketid", friend?.email, (socketId) => {
      setFriendSocketId(socketId);
      console.log(`Socket ID của ${friend?.email}: ${socketId}`);
    });
  };
  useEffect(() => {
    getFriendSocketId();
  }, []);

  const handleSetCall = () => {
    if (!friend?.email) {
      console.error("Friend's socket ID is not available");
      return;
    }
    try {
      alert(friendSocketId);

      setName(currentUserInfo?.username || "none");
      callUser(friendSocketId); // Use friend's socket ID instead of hardcoded value
    } catch (error) {
      console.error("Failed to initiate call:", error);
    }
  };

  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const data = await getChatWithUser(friend?._id, page);
        setMessages(data.reverse());
        scrollToBottom();
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    };

    // socket.emit("register", currentUserInfo?._id);
    fetchChatList();
  }, []); // Chỉ chạy khi component được mount///handle scroll
  // const handleScroll = async () => {
  //   const container = scrollContainerRef.current;
  //   if (!container || isFetching || container.scrollTop > 200) return;

  //   setIsFetching(true);
  //   try {
  //     const nextPage = page + 1;
  //     const newMessages = await getChatWithUser(friend?._id, nextPage);

  //     if (newMessages.reverse().length > 0) {
  //       const prevScrollHeight = container.scrollHeight;
  //       setMessages((prev) => [...newMessages, ...prev]);
  //       setPage(nextPage);

  //       // Giữ nguyên vị trí cuộn sau khi thêm dữ liệu
  //       setTimeout(() => {
  //         container.scrollTop = container.scrollHeight - prevScrollHeight;
  //       }, 0);
  //       // scrollToBottom();
  //     }
  //   } catch (error) {
  //     console.error("Failed to load more messages:", error);
  //   } finally {
  //     setIsFetching(false);
  //   }
  // };
  //send messs
  const handleSendMessage = async () => {
    console.log("send mess", newMessage.current.value);
    if (!newMessage.current.value.trim()) return;
    // Gửi tin nhắn đến server
    await sendMessage(friend?._id, friend.email, newMessage.current.value);
    console.log(newMessage.current.value);
    const newMess = newMessage.current.value;
    setMessages((messages) => [
      ...messages,
      {
        content: newMess,
        createdAt: "a second ago",
        receiverId: currentUserInfo._id,
        senderId: currentUserInfo._id,
      },
    ]);
    // Gửi tin nhắn đến bạn bè qua socket
    const payload = {
      senderEmail: currentUserInfo?.email,
      receiverEmail: friend?.email,
      message: newMessage.current.value,
    };
    // socket.emit("personalChat", payload);
    dispatchMessageState({ type: "chat/send", payload });

    newMessage.current.value = null;
    scrollToBottom();
  };
  const { notifiSound } = useGlobalContext();
  useEffect(() => {
    const handleReceiveMessage = ({ senderEmail, message }) => {
      setMessages((messages) => [
        ...messages,
        {
          content: message,
          createdAt: "a few second ago",
          // formatDistanceToNow(new Date(), {
          //   addSuffix: true,
          //   locale: vi,
          // }),
          receiverId: currentUserInfo._id,
          senderId: senderEmail,
        },
      ]);
      console.log(message);
      notifiSound.play();
      setHaveNewMess(() => !haveNewMess);
    };

    socket.on("personalChat", handleReceiveMessage);

    return () => {
      socket.off("personalChat", handleReceiveMessage); // Xóa listener đúng cách
    };
  }, []); // Chỉ chạy lại khi socket thay đổi
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  ///rèactor

  const fetchChatList = async () => {
    setLoading(true);
    try {
      const data = await getChatWithUser(friend?._id, page);
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
  const fetchOlderMessages = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600)); // fake delay
    await fetchChatList();
    setPage(1);
    setLoading(false);
    scrollToBottom();
  };
  const handleScroll = () => {
    const nextPage = page + 1;
    const container = messageBoxRef.current;
    if (container.scrollTop === 0 && hasMore && !loading) {
      prevScrollHeightRef.current = container.scrollHeight;
      fetchChatList();
      setPage(nextPage);
    }
  };

  useLayoutEffect(() => {
    // if (loading) {
    //   const container = messageBoxRef.current;
    //   const newScrollHeight = container.scrollHeight;
    //   container.scrollTop = newScrollHeight - prevScrollHeightRef.current;
    //   console.log(messages);
    // }
    //add
    if (!loading && prevScrollHeightRef.current && messages.length > 0) {
      const container = messageBoxRef.current;
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - prevScrollHeightRef.current;
    }
  }, [messages]);

  useEffect(() => {
    fetchOlderMessages();
    // fetchChatList();
    // setPage(1);
  }, []);
  return (
    <>
      {!isCallAccepted && (
        <>
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
              flex: 1,
              overflowY: "auto",
              padding: 2,
              backgroundColor: "#f0f2f5",
              scrollBehavior: "smooth",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 1,
                borderBottom: "1px solid #ddd",
                backgroundColor: "#fff",
                borderRadius: "1rem",
              }}
            >
              <Box display="flex" alignItems="center">
                <Avatar
                  src={friend?.avatar}
                  alt="User Avatar"
                  sx={{ width: 45, height: 45, marginRight: 1.5 }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#333" }}
                  >
                    {friend?.username}
                  </Typography>
                  <IsUserActive userId={friend?.email} />
                </Box>
              </Box>
              <Box display="flex" gap={1}>
                {/* call button */}
                <IconButton
                  onClick={() => {
                    alert(friendSocketId);
                    setName(currentUserInfo?.username || "none");
                    setIsCalling(() => true);
                    callUser(friendSocketId);
                  }}
                  disabled={!friend?._id}
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
            {loading && (
              <Box sx={{ textAlign: "center", mb: 1 }}>
                <CircularProgress size={20} />
              </Box>
            )}
            {!hasMore && (
              <Box sx={{ textAlign: "center", mb: 1, mt: 1 }}>
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
                backgroundColor: "#f0f0f0",
                scrollBehavior: "smooth",
              }}
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
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
                        message.senderId === currentUserInfo?._id
                          ? "white"
                          : "black",
                      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                      wordBreak: "break-word",
                    }}
                  >
                    <Typography variant="body2">{message?.content}</Typography>
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
                      {message?.createdAt}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Section */}
            <Box
              sx={{
                borderRadius: "1rem",
                display: "flex",
                alignItems: "center",
                padding: 1.5,
                borderTop: "1px solid #ddd",
                backgroundColor: "#fff",
              }}
            >
              <Input
                fullWidth
                placeholder="Typing message..."
                // value={newMessage}
                // onChange={(e) => setNewMessage(e.target.value)}
                inputRef={newMessage}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
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
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendMessage}
                sx={{
                  borderRadius: "50%",
                  minWidth: "auto",
                  padding: "10px",
                  backgroundColor: "#1877f2",
                  "&:hover": { backgroundColor: "#166fe5" },
                }}
              >
                <SendIcon fontSize="medium" />
              </Button>
            </Box>

            {/* <IncomingCall /> */}
          </Box>
        </>
      )}
    </>
  );
};

export default ChatWindow;
