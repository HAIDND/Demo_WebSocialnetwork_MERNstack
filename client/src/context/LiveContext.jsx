import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import Peer from "simple-peer";
import { SocketContext } from "./SocketContext";
import { VideoCallContext } from "./VideoCallContext";

export const LivestreamContext = createContext();

export const LivestreamProvider = ({ children }) => {
  const {
    myVideoRef,
    name,
    setName,
    userStream,
    isCallEnded,
    myUserId,
    setPartnerUserId,
    isMyVideoActive,
    setIsMyVideoActive,
    isMyMicActive,
    isPartnerMicActive,
    toggleMicrophone,
    isScreenSharing,
    toggleScreenSharingMode,
    toggleFullScreen,
    getUserMediaStream,
  } = useContext(VideoCallContext);
  const { socket } = useContext(SocketContext);

  ///state in livestream
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [userLiveStream, setUserLiveStream] = useState(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [isJoinedStream, setIsJoinedStream] = useState(false);
  const ownerRoomVideoRef = useRef();
  const clientViewVideoRef = useRef();
  const peerConnectionRef = useRef();
  //old
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [messages, setMessages] = useState([]);
  const streamRef = useRef();
  const [call, setCall] = useState({}); //Stores incoming call data (caller info, signal data)
  //effect livepage
  useEffect(() => {
    const getUserMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setUserLiveStream(stream);
        if (ownerRoomVideoRef.current) {
          ownerRoomVideoRef.current.srcObject = stream;
        }
        console.log("pas setup cam live");
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };
    getUserMediaStream();
  }, []);

  const startStream = async (roomId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;

      socket.emit("streamStart", {
        roomId,
        userId: socket.id,
      });

      setIsLive(true);
      return stream;
    } catch (err) {
      console.error("Failed to start stream:", err);
      throw err;
    }
  };

  const stopStream = (roomId) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    socket.emit("endStream", roomId);
    setIsLive(false);
  };

  const joinStream = (roomId) => {
    socket.emit("joinRoom", roomId);
  };

  const sendMessage = (roomId, message, sender, senderName) => {
    socket.emit("liveChat", {
      roomId,
      message,
      sender,
      senderName,
    });
  };

  useEffect(() => {
    socket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("viewerUpdate", ({ viewers }) => {
      setViewers(viewers);
    });

    return () => {
      socket.off("newMessage");
      socket.off("viewerUpdate");
    };
  }, [socket]);
  ///add live stream feature
  // const startLiveStream = (roomId) => {
  //   if (!userStream) {
  //     console.log("No media stream available");
  //     return false;
  //   }
  //   console.log(userStream);
  //   try {
  //     setCurrentRoomId(roomId);
  //     setIsLiveStreaming(true);

  //     const peer = new Peer({
  //       initiator: true,
  //       trickle: false,
  //       stream: userStream,
  //       config: {
  //         iceServers: [
  //           { urls: "stun:stun.l.google.com:19302" },
  //           { urls: "stun:stun1.l.google.com:19302" },
  //         ],
  //       },
  //     });

  //     socket.emit("createRoom", { roomId });
  //     console.log("emit create room");
  //     // Handle viewer count updates
  //     // socket.on("viewerCount", (count) => {
  //     //   setViewerCount(count);
  //     // });
  //     console.log("on view count");
  //     // Handle viewer signals
  //     // socket.on("viewerSignal", ({ signal, viewerId }) => {
  //     //   peer.signal(signal);
  //     // });
  //     console.log("socket on viewSihnal");
  //     peer.on("signal", (data) => {
  //       socket.emit("hostSignal", { roomId, signalData: data });
  //     });
  //     console.log("peer on signal");
  //     peer.on("connect", () => {
  //       console.log("Peer connection established");
  //     });
  //     console.log("peer on connect");
  //     // peer.on("stream", (remoteStream) => {
  //     //   console.log("Received remote stream");
  //     //   if (ownerRoomVideoRef.current) {
  //     //     ownerRoomVideoRef.current.srcObject = remoteStream;
  //     //   }
  //     // });
  //     // console.log("peer on stream");
  //     peer.on("error", (err) => {
  //       console.error("Livestream peer error:", err);
  //       stopLiveStream();
  //     });

  //     // Handle call acceptance
  //     socket.on("viewerSignal", ({ signal, roomId }) => {
  //       console.log("Call answered by:", roomId);

  //       if (peer && !peer.destroyed) {
  //         peer.signal(signal);
  //       }
  //     });

  //     // Store peer reference
  //     peerConnectionRef.current = peer;

  //     return peer;
  //   } catch (error) {
  //     console.error("Error starting livestream:", error);
  //     setIsLiveStreaming(false);
  //     return false;
  //   }
  // };

  // const joinLiveStream = (roomId) => {
  //   console.log("join live 1 ");
  //   try {
  //     setCurrentRoomId(roomId);
  //     setIsJoinedStream(true);
  //     const cleanup = () => {
  //       socket.off("receiveHostSignal");
  //       if (peerConnectionRef.current) {
  //         peerConnectionRef.current.destroy();
  //       }
  //       setIsJoinedStream(false);
  //     };

  //     socket.on("receiveHostSignal", ({ signalData }) => {
  //       console.log("connect romom ");
  //       //cau hinh Cấu hình TURN/STUN server
  //       const peer = new Peer({
  //         initiator: false,
  //         trickle: false,
  //         config: {
  //           iceServers: [
  //             { urls: "stun:stun.l.google.com:19302" },
  //             { urls: "stun:stun1.l.google.com:19302" },
  //           ],
  //         },
  //       });

  //       peer.on("signal", (signalData) => {
  //         socket.emit("hostSignal", { roomId, signalData });
  //       });

  //       peer.on("stream", (remoteStream) => {
  //         if (clientViewVideoRef.current) {
  //           clientViewVideoRef.current.srcObject = remoteStream;
  //         }
  //       });

  //       peer.on("error", (err) => {
  //         console.error("Viewer peer error:", err);
  //         cleanup();
  //       });

  //       peer.signal(signalData);
  //       peerConnectionRef.current = peer;
  //     });

  //     socket.once("hostLeft", () => {
  //       console.log("Host ended the livestream");
  //       cleanup();
  //     });

  //     return () => cleanup();
  //   } catch (error) {
  //     console.error("Error joining livestream:", error);
  //     setIsJoinedStream(false);
  //   }
  // };
  useEffect(() => {
    ///handle socket
    const handleSocketEvents = () => {
      //step1 on set id usser

      //step2 on setmmedia friends

      //ste[ 3 on off call video]

      //socket on loading initial call video
      socket.on("viewerJoined", ({ signalData }) => {
        setCall(signalData);
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
  //new
  const startLiveStream = (roomId) => {
    if (!userStream) {
      console.log("No media stream available");
      return false;
    }

    setCurrentRoomId(roomId);
    setIsLiveStreaming(true);
    socket.emit("createRoom", { roomId });
    try {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: userStream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      });
      socket.emit("hostSend", { roomId, signalData: userLiveStream });
      peer.on("signal", (data) => {
        console.log("Signaling:", data);
        socket.emit("hostSend", { roomId, signalData: data });
      });

      // socket.on("updateLiveRooms", (rooms) => {
      //   if (rooms) {
      //     peer.on("signal", (data) => {
      //       console.log("Signaling:", data);
      //       socket.emit("hostSend", { roomId, signalData: data });
      //     });
      //   }
      // });
      peer.on("connect", () => {
        console.log("Peer connection established");
      });

      peer.on("stream", (remoteStream) => {
        console.log("Received remote stream");
        if (clientViewVideoRef.current) {
          clientViewVideoRef.current.srcObject = remoteStream;
        }
      });
      socket.on("viewerJoined", ({ viewerId, signal }) => {
        alert(viewerId);
        peer.signal(signal);
      });
      peer.on("error", (err) => {
        console.error("Livestream peer error:", err);
        stopLiveStream();
      });
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

  const joinLiveStream = (roomId) => {
    setCurrentRoomId(roomId);
    setIsJoinedStream(true);

    const cleanup = () => {
      socket.off("receiveHostSignal");
      if (peerConnectionRef.current) {
        peerConnectionRef.current.destroy();
      }
      setIsJoinedStream(false);
    };

    socket.emit("joinRoom", { roomId });
    // socket.emit("viewerReceived", { roomId, signal: {} });
    console.log(" lap dc connect vs host");
    const peer = new Peer({
      initiator: false,
      trickle: false,
      // config: {
      //   iceServers: [
      //     { urls: "stun:stun.l.google.com:19302" },
      //     { urls: "stun:stun1.l.google.com:19302" },
      //   ],
      // },
    });
    socket.emit("viewerJoin", { roomId, signal: userLiveStream });
    peer.on("signal", (signalData) => {
      console.log("thiet lap join live");
      socket.emit("viewerJoin", { roomId, signal: signalData });
    });

    peer.on("stream", (remoteStream) => {
      console.log("nhận data tu host");
      if (clientViewVideoRef.current) {
        clientViewVideoRef.current.srcObject = remoteStream;
      }
    });
    peer.signal(call);
    // peer.signal(strea);
    peerConnectionRef.current = peer;
    peer.on("error", (err) => {
      console.error("Viewer peer error:", err);
      cleanup();
    });
    socket.once("hostLeft", () => {
      console.log("Host ended the livestream");
      cleanup();
    });
  };

  const stopLiveStream = () => {
    if (currentRoomId) {
      socket.emit("endLivestream", { roomId: currentRoomId });
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.destroy();
    }
    setIsLiveStreaming(false);
    setCurrentRoomId(null);
    // setViewerCount(0);
  };

  ///end livestream feature
  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicActive;
        setIsMicActive(!isMicActive);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoActive;
        setIsVideoActive(!isVideoActive);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });

        const videoTrack = displayStream.getVideoTracks()[0];

        for (const peer of Object.values(peers)) {
          const sender = peer
            .getSenders()
            .find((s) => s.track?.kind === "video");
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        }

        videoTrack.onended = () => {
          toggleScreenShare();
        };

        if (ownerRoomVideoRef.current) {
          ownerRoomVideoRef.current.srcObject = displayStream;
        }
        setIsScreenSharing(true);
      } else {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        const videoTrack = userStream.getVideoTracks()[0];

        for (const peer of Object.values(peers)) {
          const sender = peer
            .getSenders()
            .find((s) => s.track?.kind === "video");
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        }

        if (ownerRoomVideoRef.current) {
          ownerRoomVideoRef.current.srcObject = userStream;
        }
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error("Error sharing screen:", err);
      setIsScreenSharing(false);
    }
  };
  return (
    <LivestreamContext.Provider
      value={{
        startLiveStream,
        stopLiveStream,
        joinLiveStream,
        roomInfo,
        setRoomInfo,
        ownerRoomVideoRef,
        clientViewVideoRef,
        userLiveStream,
      }}
    >
      {children}
    </LivestreamContext.Provider>
  );
};
