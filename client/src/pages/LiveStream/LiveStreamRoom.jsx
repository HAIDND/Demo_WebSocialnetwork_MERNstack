import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Stack,
  Divider,
  Avatar,
  TextField,
  Badge,
} from "@mui/material";
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ScreenShare,
  StopScreenShare,
  ChatBubble,
  People,
  Close,
  Send,
  CallEnd,
  ExitToApp,
} from "@mui/icons-material";
import { SocketContext } from "~/context/SocketContext";
import { CurrentUser } from "~/context/GlobalContext";
import { VideoCallContext } from "~/context/VideoCallContext";
import { LivestreamContext } from "~/context/LiveContext";

const LiveStreamRoom = () => {
  const { socket } = useContext(SocketContext);
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { currentUserInfo } = useContext(CurrentUser);
  const chatRef = useRef(null);
  const [isStreamer, setIsStreamer] = useState(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [viewers, setViewers] = useState([]);
  const peerRef = useRef();
  const streamRef = useRef();
  const [stream, setStream] = useState(null);
  const [peers, setPeers] = useState({});
  const [error, setError] = useState(null);
  const {
    toggleMic,
    isMicActive,
    toggleVideo,

    isVideoActive,
    toggleScreenShare,
    isScreenSharing,
    myVideoRef,
    userStream,
  } = useContext(VideoCallContext);
  //new
  const {
    joinLiveStream,
    roomInfo,
    setRoomInfo,
    ownerRoomVideoRef,
    clientViewVideoRef,
  } = useContext(LivestreamContext);

  useEffect(() => {
    socket.emit("joinRoom", roomId);
    // Join room
    // if (roomId !== currentUserInfo?.email) {
    //   joinLiveStream(roomId);
    // }

    // Get room info
    socket.on("roomInfo", (info) => {
      if (info.owner !== currentUserInfo?.email) {
        joinLiveStream(roomId);
        console.log("joinroom");
      }
      console.log(info);
      setRoomInfo(info);
      setIsStreamer(info.owner === currentUserInfo?.email || false);
    });
    // Handle new viewer
    socket.on("viewerJoined", ({ viewerId, viewers: updatedViewers }) => {
      setViewers(updatedViewers);
    });

    // Handle viewer left
    socket.on("viewerLeft", ({ viewerId, viewers: updatedViewers }) => {
      setViewers(updatedViewers);
    });

    // Handle stream end
    socket.on("streamEnded", () => {
      navigate("/livestream");
    });

    return () => {
      socket.emit("leaveRoom", roomId);
      if (isStreamer) {
        socket.emit("endLive", roomId);
      }
      socket.off("roomInfo");
      socket.off("viewerJoined");
      socket.off("viewerLeft");
      socket.off("streamEnded");
    };
  }, [roomId, socket]);

  function handleViewerLeftRoom() {
    socket.emit("leaveRoom", roomId);
    navigate("/livestream");
  }

  function handleOwnerEndRoom(roomId) {
    if (confirm("Are you sure you want to end the stream?"))
      socket.emit("endLive", roomId);
    else return 0;
  }

  useEffect(() => {
    const handleLiveChat = ({
      roomId,
      message,
      sender,
      senderName,
      timestamp,
    }) => {
      setMessages((prev) => [
        ...prev,
        {
          roomId,
          message,
          sender,
          senderName,
          timestamp,
        },
      ]);
    };

    socket.on("liveChat", handleLiveChat);
    return () => socket.off("liveChat", handleLiveChat);
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socket.emit("liveChat", {
      roomId,
      message: newMessage,
      sender: currentUserInfo?._id,
      senderName: currentUserInfo?.username,
      timestamp: new Date(),
    });
    console.log("have new chat");
    setNewMessage("");
  };

  useEffect(() => {
    let mounted = true;

    const setupStreamerMedia = async () => {
      if (!isStreamer) return;

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!mounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = mediaStream;
        setStream(mediaStream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = mediaStream;
        }
        socket.emit("streamReady", { roomId });
      } catch (err) {
        console.error("Failed to get media devices:", err);
        setError("Failed to access camera and microphone");
      }
    };
    console.log(myVideoRef);
    setupStreamerMedia();

    return () => {
      mounted = false;
      // if (streamRef.current) {
      //   streamRef.current.getTracks().forEach((track) => track.stop());
      // }
    };
  }, [isStreamer, roomId]);

  useEffect(() => {
    if (isStreamer) return;

    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
          ],
        },
      ],
    });

    const handleOffer = async ({ offer }) => {
      try {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit("streamAnswer", {
          answer,
          roomId,
          streamerId: roomInfo?.streamerId,
        });
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      try {
        if (peer.currentRemoteDescription) {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    };

    peer.ontrack = (event) => {
      if (myVideoRef.current && event.streams[0]) {
        myVideoRef.current.srcObject = event.streams[0];
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          candidate: event.candidate,
          roomId,
          streamerId: roomInfo?.streamerId,
        });
      }
    };

    socket.on("streamOffer", handleOffer);
    socket.on("iceCandidate", handleIceCandidate);

    peerRef.current = peer;

    return () => {
      socket.off("streamOffer", handleOffer);
      socket.off("iceCandidate", handleIceCandidate);
      peer.close();
    };
  }, [roomInfo?.streamerId, roomId]);

  return (
    <Box sx={{ height: "100vh", display: "flex" }}>
      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Video Area */}
        <Box
          sx={{
            flex: 1,
            bgcolor: "black",
            position: "relative",
            height: "100vh",
          }}
        >
          {isStreamer ? (
            <video
              ref={myVideoRef}
              autoPlay
              playsInline
              // muted={isStreamer}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <video
              ref={myVideoRef}
              // ref={clientViewVideoRef}
              autoPlay
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          )}

          {/* Stream Info Overlay */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              p: 2,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar src={roomInfo?.streamerAvatar} />
              <Typography variant="h6" color="white">
                {roomInfo?.streamerName}
              </Typography>
            </Box>
            <Badge
              badgeContent={viewers?.length}
              color="error"
              sx={{ "& .MuiBadge-badge": { fontSize: "0.8rem" } }}
            >
              <People sx={{ color: "white" }} />
            </Badge>
          </Box>

          {/* Streamer Controls */}
          {isStreamer ? (
            <Stack
              direction="row"
              spacing={1}
              sx={{
                position: "absolute",
                bottom: 16,
                left: "50%",
                transform: "translateX(-50%)",
                bgcolor: "rgba(0,0,0,0.6)",
                borderRadius: 2,
                p: 1,
              }}
            >
              <IconButton onClick={toggleMic} sx={{ color: "white" }}>
                {isMicActive ? <Mic /> : <MicOff color="error" />}
              </IconButton>
              <IconButton onClick={toggleVideo} sx={{ color: "white" }}>
                {isVideoActive ? <Videocam /> : <VideocamOff color="error" />}
              </IconButton>
              <IconButton onClick={toggleScreenShare} sx={{ color: "white" }}>
                {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
              </IconButton>
              <IconButton
                onClick={() => handleOwnerEndRoom(roomId)}
                sx={{ color: "white" }}
              >
                {isScreenSharing ? <CallEnd /> : <CallEnd />}
              </IconButton>
            </Stack>
          ) : (
            <Stack
              direction="row"
              spacing={1}
              sx={{
                position: "absolute",
                bottom: 16,
                left: "50%",
                transform: "translateX(-50%)",
                bgcolor: "rgba(0,0,0,0.6)",
                borderRadius: 2,
                p: 1,
              }}
            >
              <IconButton
                onClick={handleViewerLeftRoom}
                sx={{ color: "white" }}
              >
                <ExitToApp />
              </IconButton>
            </Stack>
          )}
        </Box>
      </Box>

      {/* Chat Sidebar */}
      <Paper
        sx={{
          width: 350,
          display: "flex",
          flexDirection: "column",
          borderLeft: 1,
          borderColor: "divider",
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

        {/* Messages */}
        <Box
          ref={chatRef}
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {messages.map((msg, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "flex-start",
              }}
            >
              <Avatar src={msg.senderAvatar} sx={{ width: 32, height: 32 }} />
              <Box>
                <Typography variant="subtitle2" color="primary">
                  {msg.senderName}
                </Typography>
                <Typography variant="body2">{msg?.message}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Chat Input */}
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            gap: 1,
          }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={!newMessage.trim()}
          >
            <Send />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default LiveStreamRoom;
