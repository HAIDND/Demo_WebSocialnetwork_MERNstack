import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Paper,
  Dialog,
  DialogContent,
} from "@mui/material";
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  CallEnd,
  FlipCameraIos,
  Call,
} from "@mui/icons-material";
import Loading from "../Chatting/Loading/Loading";
import { VideoCallContext } from "~/context/VideoCallContext";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import ringtone from "~/assets/ringtone.ogg";

export default function HaveChatVideo() {
  const {
    receiveCall,
    call,
    isCallAccepted,
    endIncomingCall,
    setPartnerUserId,
    opponentName,
  } = useContext(VideoCallContext);
  const [showModal, setShowModal] = useState(false);
  const audioRef = useRef();

  const handleClose = () => {
    setShowModal(false);
    if (call.isReceivingCall && !isCallAccepted) {
      endIncomingCall();
    }
    window.location.reload();
  };

  const handleCallAnswer = () => {
    receiveCall();
    setShowModal(false);
  };

  useEffect(() => {
    if (call.isReceivingCall && !isCallAccepted) {
      setShowModal(true);
      setPartnerUserId(call.from);
    }
  }, [call.from, call.isReceivingCall, isCallAccepted, setPartnerUserId]);

  useEffect(() => {
    if (showModal && audioRef.current) {
      audioRef.current.play();
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [showModal]);
  return (
    <>
      <audio src={ringtone} loop ref={audioRef} />
      {(!isCallAccepted || showModal) && (
        <Dialog open={showModal} onClose={handleClose} maxWidth="xs" fullWidth>
          <DialogContent
            sx={{ p: 3, bgcolor: "#222", color: "#fff", textAlign: "center" }}
          >
            <Avatar
              src={opponentName?.avatar}
              sx={{ width: 80, height: 80, mx: "auto", mb: 2 }}
            />
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              {opponentName?.name}
            </Typography>
            <Typography variant="body2" color="gray" sx={{ mb: 2 }}>
              Đang gọi...
            </Typography>
            <Box sx={{ my: 2 }}>
              <Loading />
            </Box>
            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 3 }}
            >
              <IconButton
                color="error"
                onClick={handleClose}
                sx={{
                  bgcolor: "error.dark",
                  "&:hover": { bgcolor: "error.main" },
                }}
              >
                <CallEnd fontSize="large" />
              </IconButton>
              <IconButton
                color="success"
                onClick={handleCallAnswer}
                sx={{
                  bgcolor: "success.dark",
                  "&:hover": { bgcolor: "success.main" },
                }}
              >
                <Call fontSize="large" />
              </IconButton>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
