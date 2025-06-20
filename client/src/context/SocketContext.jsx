import { createContext, useContext, useEffect, useRef, useState } from "react";
import sockets from "./SocketInitial"; // Import socket từ file trên
import { CurrentUser } from "~/context/GlobalContext";
import { callSound, notifiSound } from "~/assets/RingNotifi/audioNotifi";

import CallVideos from "~/pages/Chatting/CallVideos";
import { VideoCallProvider } from "./VideoCallContext";
import { readUser } from "~/services/userServices/userService";
export const SocketContext = createContext();

export const SocketProvider = ({ children, userId }) => {
  const { currentUserInfo, setCurrentUser, setCurrentUserInfo } =
    useContext(CurrentUser);
  useEffect(() => {
    const storedToken = sessionStorage.getItem("jwt");
    const tokenData = storedToken ? JSON.parse(storedToken) : null;
    function setuser() {
      setCurrentUser(tokenData);
    }
    readUser(tokenData?.userId).then((data) => {
      if (data) {
        setCurrentUserInfo(data);
        setuser();
      } else {
        alert("No profile");
      }
    });
  }, []);
  //socket global state
  const [rootSocketID, setRootSocketID] = useState(null);

  const LoginSocket = (userId) => {
    socket.emit("userLogin", userId);
  };
  const LogoutSocket = (userId) => {
    socket.emit("userLogout", userId);
  };
  useEffect(() => {
    socket.on("socketId", (id) => {
      setRootSocketID(id);
      const storedToken = sessionStorage.getItem("jwt");
      const tokenData = storedToken ? JSON.parse(storedToken) : null;
      readUser(tokenData.userId).then((data) => {
        if (data) {
          LoginSocket(data?.email);
        } else {
          alert("No profile");
        }
      });
    });
  }, [currentUserInfo]);
  const handleSetOppenent = (friendID) => {
    setOpponent(friendID);
  };
  const socket = sockets;
  socket.connect();
  const [haveNewMess, setHaveNewMess] = useState(true);

  //efectnotifi mess
  useEffect(() => {
    const handleListenMessage = ({ senderId, message }) => {
      console.log("new mess is " + message);
      callSound.play();
    };
    socket.on("notification", (notification) => {
      // Hiển thị thông báo popup/toast/reload
      notifiSound.play();
      console.log("📥 Notification mới:", notification);
    });
    socket.on("private_message", handleListenMessage);
    return () => {
      socket.off("private_message");
      socket.off("notification");
    };
  }, [haveNewMess]);
  return (
    <SocketContext.Provider
      value={{
        socket,
        LoginSocket,
        LogoutSocket,
        setHaveNewMess,
        haveNewMess,
        handleSetOppenent,
        rootSocketID,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
