import { createContext, useContext, useEffect, useRef, useState } from "react";
import sockets from "./SocketInitial"; // Import socket từ file trên
import { CurrentUser } from "~/context/GlobalContext";
import { audio } from "~/assets/RingNotifi/audioNotifi";
import Peer from "simple-peer";
import CallVideos from "~/pages/Chatting/CallVideos";
export const SocketContext = createContext();

export const SocketProvider = ({ children, userId }) => {
  const socket = sockets;
  socket.connect();
  const { currentUserInfo } = useContext(CurrentUser);
  const [haveNewMess, setHaveNewMess] = useState(true);

  const LoginSocket = (userId) => {
    socket.emit("userLogin", userId);
  };
  const LogoutSocket = (userId) => {
    socket.emit("userLogin", userId);
  };

  //efectnotifi mess
  useEffect(() => {
    const handleListenMessage = ({ senderId, message }) => {
      console.log("new mess is " + message);
      audio.play();
    };
    socket.on("private_message", handleListenMessage);
    return () => {
      socket.off("private_message");
    };
  }, [haveNewMess]);

  ////context video call
  const [userStream, setUserStream] = useState(null); ///
  const [call, setCall] = useState({});
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [myUserId, setMyUserId] = useState("");
  const [partnerUserId, setPartnerUserId] = useState("");

  const [receivedMessage, setReceivedMessage] = useState("");
  const [name, setName] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [isMyVideoActive, setIsMyVideoActive] = useState(true);
  const [isPartnerVideoActive, setIsPartnerVideoActive] = useState();
  const [isMyMicActive, setIsMyMicActive] = useState(true);
  const [isPartnerMicActive, setIsPartnerMicActive] = useState();
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const myVideoRef = useRef();
  const partnerVideoRef = useRef();
  const peerConnectionRef = useRef();
  const screenShareTrackRef = useRef();

  useEffect(() => {
    const getUserMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        setUserStream(stream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    const handleSocketEvents = () => {
      socket.on("socketId", (id) => {
        setMyUserId(id);
      });

      socket.on("mediaStatusChanged", ({ mediaType, isActive }) => {
        if (isActive !== null) {
          if (mediaType === "video") {
            setIsPartnerVideoActive(isActive);
          } else if (mediaType === "audio") {
            setIsPartnerMicActive(isActive);
          } else {
            setIsPartnerMicActive(isActive[0]);
            setIsPartnerVideoActive(isActive[1]);
          }
        }
      });

      socket.on("callTerminated", () => {
        setIsCallEnded(true);
        window.location.reload();
      });

      socket.on("incomingCall", ({ from, name, signal }) => {
        setCall({ isReceivingCall: true, from, name, signal });
      });

      socket.on("receiveMessage", ({ message: text, senderName }) => {
        const receivedMsg = { text, senderName };
        setReceivedMessage(receivedMsg);

        const timeout = setTimeout(() => {
          setReceivedMessage({});
        }, 1000);

        return () => clearTimeout(timeout);
      });
    };

    getUserMediaStream();
    handleSocketEvents();
  }, []);

  const receiveCall = () => {
    setIsCallAccepted(true);
    setPartnerUserId(call.from);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: userStream,
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", {
        signal: data,
        to: call.from,
        userName: name,
        mediaType: "both",
        mediaStatus: [isMyMicActive, isMyVideoActive],
      });
    });

    peer.on("stream", (currentStream) => {
      if (partnerVideoRef.current) {
        partnerVideoRef.current.srcObject = currentStream;
      }
    });
    peer.signal(call.signal);
    peerConnectionRef.current = peer;
  };

  const callUser = (targetId) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: userStream,
    });
    setPartnerUserId(targetId);

    const handleSignal = (data) => {
      socket.emit("initiateCall", {
        targetId,
        signalData: data,
        senderId: myUserId,
        senderName: name,
      });
    };

    const handleStream = (currentStream) => {
      partnerVideoRef.current.srcObject = currentStream;
    };

    const joinAcceptedCall = ({ signal, userName }) => {
      setIsCallAccepted(true);
      setOpponentName(userName);
      peer.signal(signal);
      socket.emit("changeMediaStatus", {
        mediaType: "both",
        isActive: [isMyMicActive, isMyVideoActive],
      });
    };

    peer.on("signal", handleSignal);
    peer.on("stream", handleStream);
    socket.on("callAnswered", joinAcceptedCall);

    peerConnectionRef.current = peer;
  };

  const toggleVideo = () => {
    const newStatus = !isMyVideoActive;
    setIsMyVideoActive(newStatus);

    userStream.getVideoTracks().forEach((track) => {
      track.enabled = newStatus;
    });

    socket.emit("changeMediaStatus", {
      mediaType: "video",
      isActive: newStatus,
    });

    return newStatus;
  };

  const toggleMicrophone = () => {
    const newStatus = !isMyMicActive;
    setIsMyMicActive(newStatus);

    userStream.getAudioTracks().forEach((track) => {
      track.enabled = newStatus;
    });

    socket.emit("changeMediaStatus", {
      mediaType: "audio",
      isActive: newStatus,
    });

    return newStatus;
  };

  const toggleScreenSharingMode = () => {
    if (!isMyVideoActive) {
      alert("Please turn on your video to share the screen");
      return;
    }
    if (!isScreenSharing) {
      navigator.mediaDevices
        .getDisplayMedia({ cursor: true })
        .then((screenStream) => {
          const screenTrack = screenStream.getTracks()[0];
          const videoTracks = peerConnectionRef.current.streams[0].getTracks();
          const videoTrack = videoTracks.find(
            (track) => track.kind === "video"
          );
          peerConnectionRef.current.replaceTrack(
            videoTrack,
            screenTrack,
            userStream
          );
          screenTrack.onended = () => {
            peerConnectionRef.current.replaceTrack(
              screenTrack,
              videoTrack,
              userStream
            );
            myVideoRef.current.srcObject = userStream;
            setIsScreenSharing(false);
          };
          myVideoRef.current.srcObject = screenStream;
          screenShareTrackRef.current = screenTrack;
          setIsScreenSharing(true);
        })
        .catch((error) => {
          console.log("Failed to get screen sharing stream");
        });
    } else {
      screenShareTrackRef.current.stop();
      screenShareTrackRef.current.onended();
    }
  };

  const toggleFullScreen = (e) => {
    const element = e.target;

    if (!document.fullscreenElement) {
      element.requestFullscreen().catch((err) => {
        console.error(`Error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const endCall = () => {
    setIsCallEnded(true);
    socket.emit("terminateCall", { targetId: partnerUserId });
    peerConnectionRef.current.destroy();
    window.location.reload();
  };

  const endIncomingCall = () => {
    socket.emit("terminateCall", { targetId: partnerUserId });
  };

  const sendMessage = (text) => {
    const newMessage = {
      message: text,
      type: "sent",
      timestamp: Date.now(),
      sender: name,
    };

    setChatMessages((prevMessages) => [...prevMessages, newMessage]);

    socket.emit("sendMessage", {
      targetId: partnerUserId,
      message: text,
      senderName: name,
    });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        LoginSocket,
        LogoutSocket,
        setHaveNewMess,
        haveNewMess,
        call,
        isCallAccepted,
        myVideoRef,
        partnerVideoRef,
        userStream,
        name,
        setName,
        isCallEnded,
        myUserId,
        callUser,
        endCall,
        receiveCall,
        sendMessage,
        receivedMessage,
        setReceivedMessage,
        setPartnerUserId,
        endIncomingCall,
        opponentName,
        isMyVideoActive,
        setIsMyVideoActive,
        isPartnerVideoActive,
        setIsPartnerVideoActive,
        toggleVideo,
        isMyMicActive,
        isPartnerMicActive,
        toggleMicrophone,
        isScreenSharing,
        toggleScreenSharingMode,
        toggleFullScreen,
      }}
    >
      {/* {userStream && <CallVideos />} */}
      {children}
    </SocketContext.Provider>
  );
};
