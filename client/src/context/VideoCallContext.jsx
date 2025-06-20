import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import socket from "~/context/SocketInitial";
import Peer from "simple-peer/simplepeer.min.js";
import { SocketContext } from "./SocketContext";
import { LivestreamProvider } from "./LivestreamContext";

const VideoCallContext = createContext();

const VideoCallProvider = ({ children }) => {
  //media state
  const [userStream, setUserStream] = useState(null); //local media stream video/audio
  const [isMyVideoActive, setIsMyVideoActive] = useState(true); //Controls local video track status (on/off)
  const [isMyMicActive, setIsMyMicActive] = useState(true); // Tracks remote user's video status
  const [isPartnerVideoActive, setIsPartnerVideoActive] = useState();
  const [isPartnerMicActive, setIsPartnerMicActive] = useState();
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  //call states
  const [call, setCall] = useState({}); //Stores incoming call data (caller info, signal data)
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  //iduser\
  const { rootSocketID } = useContext(SocketContext);
  const [myUserId, setMyUserId] = useState(rootSocketID);
  const [partnerUserId, setPartnerUserId] = useState("");
  // Userinfo
  const [name, setName] = useState("");
  const [opponentName, setOpponentName] = useState(""); // name friends
  //Chatstates
  const [chatMessages, setChatMessages] = useState([]);
  const [receivedMessage, setReceivedMessage] = useState("");
  //Refs
  const myVideoRef = useRef();
  const partnerVideoRef = useRef();
  const peerConnectionRef = useRef();
  const screenShareTrackRef = useRef();
  //livestream states
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [isJoinedStream, setIsJoinedStream] = useState(false);
  //effect
  useEffect(() => {
    const getUserMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
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

    getUserMediaStream();
  }, []);
  const getUserMediaStream = async (boolean) => {
    if (boolean) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setUserStream(stream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: false,
        });
        setUserStream(stream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    }
  };
  useEffect(() => {
    ///handle socket
    const handleSocketEvents = () => {
      //step1 on set id usser
      socket.on("socketId", (id) => {
        setMyUserId(id);
      });
      //step2 on setmmedia friends
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
      //ste[ 3 on off call video]
      socket.on("callTerminated", () => {
        setIsCallEnded(true);
        window.location.reload();
      });
      //socket on loading initial call video
      socket.on("incomingCall", ({ from, name, signal }) => {
        console.log("incomingCall:", name);
        setOpponentName(name);
        setCall({ isReceivingCall: true, from, name, signal });
      });
      /// socket on receive messs
      socket.on("receiveMessage", ({ message: text, senderName }) => {
        const receivedMsg = { text, senderName };
        setReceivedMessage(receivedMsg);

        const timeout = setTimeout(() => {
          setReceivedMessage({});
        }, 1000);

        return () => clearTimeout(timeout);
      });
    };
    //get media and run socket on
    handleSocketEvents();
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.destroy();
      }
      if (userStream) {
        userStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  //handle receivecall nhận cuộc gọi
  const receiveCall = () => {
    setIsCallAccepted(true);
    setPartnerUserId(call.from);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: userStream,
    });

    peer.on("signal", (data) => {
      console.log("thiet lap nhan cuoc goi");
      socket.emit("answerCall", {
        signal: data,
        to: call.from,
        userName: name,
        mediaType: "both",
        mediaStatus: [isMyMicActive, isMyVideoActive],
      });
    });

    peer.on("stream", (currentStream) => {
      console.log(" nhan stream  cuoc goi");
      if (partnerVideoRef.current) {
        partnerVideoRef.current.srcObject = currentStream;
      }
    });
    peer.signal(call.signal);
    peerConnectionRef.current = peer;
  };

  // thực hiện send call video
  const callUser = (targetId) => {
    if (!userStream) {
      console.error("No media provided");
      return;
    }

    if (!targetId) {
      console.error("No target ID provided");
      return;
    }

    try {
      // Create peer with required options
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: userStream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            {
              urls: "turn:numb.viagenie.ca",
              username: "webrtc@live.com",
              credential: "muazkh",
            },
          ],
        },
        objectMode: true, // Add this to fix the 'call' property error
      });

      // Set partner ID first
      setPartnerUserId(targetId);

      // Handle peer events ({ targetId, signalData, senderId, senderName })
      peer.on("signal", (data) => {
        socket.emit("initiateCall", {
          targetId,
          signalData: data,
          senderId: myUserId,
          senderName: name,
        });
      });

      peer.on("connect", () => {
        console.log("Peer connection established");
      });

      peer.on("stream", (remoteStream) => {
        console.log("Received remote stream");
        if (partnerVideoRef.current) {
          partnerVideoRef.current.srcObject = remoteStream;
        }
      });

      peer.on("error", (err) => {
        console.error("Peer connection error:", err);
        endCall();
      });

      peer.on("close", () => {
        console.log("Peer connection closed");
        endCall();
      });

      // Handle call acceptance
      socket.on("callAnswered", ({ signal, userName }) => {
        console.log("Call answered by:", userName);
        setIsCallAccepted(true);
        setOpponentName(userName);

        if (peer && !peer.destroyed) {
          peer.signal(signal);
        }
      });

      // Store peer reference
      peerConnectionRef.current = peer;

      return peer;
    } catch (error) {
      console.error("Error creating peer:", error);
      if (peerConnectionRef.current) {
        peerConnectionRef.current.destroy();
      }
      throw error;
    }
  };
  ///setup on off video
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
  //setup on/off micro
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
  ///sharing screen
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
  //socket emit end callvideo
  const endCall = () => {
    setIsCallEnded(true);
    socket.emit("terminateCall", { targetId: partnerUserId });
    peerConnectionRef.current.destroy();
    window.location.reload();
  };
  //socket emit reject call video
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
    <VideoCallContext.Provider
      value={{
        call,
        isCallAccepted,
        isCalling,
        setIsCalling,
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
        chatMessages,
        setChatMessages,
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
        getUserMediaStream,
      }}
    >
      <LivestreamProvider>{children}</LivestreamProvider>
    </VideoCallContext.Provider>
  );
};

export { VideoCallContext, VideoCallProvider };
