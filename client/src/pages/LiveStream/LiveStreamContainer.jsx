import React, { useState, useEffect, useContext } from "react";
import { Box, Typography, Grid, Button, Container } from "@mui/material";
import { SocketContext } from "~/context/SocketContext";
import LiveStreamCard from "./LiveStreamCardComplot";
import StartStreamDialog from "./StartStreamDialog";
import { useNavigate } from "react-router-dom";
import { CurrentUser } from "~/context/GlobalContext";

import { LivestreamContext } from "~/context/LiveContext";

const LiveStreamContainer = () => {
  const [liveRooms, setLiveRooms] = useState([]);
  const [isStreamDialogOpen, setStreamDialogOpen] = useState(false);
  const { socket } = useContext(SocketContext);
  const { currentUserInfo } = useContext(CurrentUser);
  const { startLiveStream } = useContext(LivestreamContext);
  const navigate = useNavigate();
  console.log("livePage");

  useEffect(() => {
    socket.emit("getLiveRooms");
    socket.on("updateLiveRooms", (rooms) => {
      setLiveRooms(rooms);
    });

    socket.on("streamEnded", ({ roomId }) => {
      setLiveRooms((prev) => prev.filter((room) => room.id !== roomId));
    });

    return () => {
      socket.off("getLiveRooms");
      socket.off("updateLiveRooms");
      socket.off("streamEnded");
    };
  }, [socket]);

  const handleStartStream = (streamTitle) => {
    const roomId = `stream_${Date.now()}`;
    startLiveStream(roomId);
    socket.emit("createRoom", {
      owner: currentUserInfo?.email,
      roomId,
      streamerName: streamTitle,
    });
    navigate(`/livestream/${roomId}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Typography variant="h4">Live Streams</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setStreamDialogOpen(true)}
          >
            Start Streaming
          </Button>
        </Box>
        {/* <LiveVideo /> */}
        <Grid container spacing={3}>
          {liveRooms.map((room) => (
            <Grid item xs={12} sm={6} md={4} key={room.id}>
              <LiveStreamCard room={room} />
            </Grid>
          ))}
        </Grid>

        <StartStreamDialog
          open={isStreamDialogOpen}
          onClose={() => setStreamDialogOpen(false)}
          onStart={handleStartStream}
        />
      </Box>
    </Container>
  );
};

export default LiveStreamContainer;
