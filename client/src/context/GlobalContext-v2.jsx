import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import {
  notifiSound,
  callSound,
  notifiGlobalSound,
} from "~/assets/RingNotifi/audioNotifi";

import socket from "./SocketInitial";

// Định nghĩa types cho reducer
const SOCKET_ACTIONS = {
  CONNECT: "CONNECT",
  DISCONNECT: "DISCONNECT",
  NEW_NOTIFICATION: "NEW_NOTIFICATION",
  NEW_MESSAGE: "NEW_MESSAGE",
  INCOMING_CALL: "INCOMING_CALL",
  CALL_ACCEPTED: "CALL_ACCEPTED",
  CALL_REJECTED: "CALL_REJECTED",
  CALL_ENDED: "CALL_ENDED",
  MARK_NOTIFICATION_READ: "MARK_NOTIFICATION_READ",
  MARK_MESSAGE_READ: "MARK_MESSAGE_READ",
  CLEAR_NOTIFICATIONS: "CLEAR_NOTIFICATIONS",
};
// Initial state
const initialState = {
  connected: false,
  notifications: [],
  messages: [],
  currentCall: null,
  unreadNotifications: 0,
  unreadMessages: 0,
};
// Reducer để quản lý state
function socketReducer(state, action) {
  switch (action.type) {
    case SOCKET_ACTIONS.CONNECT:
      return { ...state, connected: true };

    case SOCKET_ACTIONS.DISCONNECT:
      return { ...state, connected: false };

    case SOCKET_ACTIONS.NEW_NOTIFICATION:
      notifiSound.play();
      return {
        ...state,
        notifications: [
          ...state.notifications,
          { ...action.payload, id: Date.now(), read: false },
        ],
        unreadNotifications: state.unreadNotifications + 1,
      };

    case SOCKET_ACTIONS.NEW_MESSAGE:
      return {
        ...state,
        messages: [
          ...state.messages,
          { ...action.payload, id: Date.now(), read: false },
        ],
        unreadMessages: state.unreadMessages + 1,
      };

    case SOCKET_ACTIONS.INCOMING_CALL:
      return {
        ...state,
        currentCall: { ...action.payload, status: "incoming" },
      };

    case SOCKET_ACTIONS.CALL_ACCEPTED:
      return {
        ...state,
        currentCall: { ...state.currentCall, status: "active" },
      };

    case SOCKET_ACTIONS.CALL_REJECTED:
    case SOCKET_ACTIONS.CALL_ENDED:
      return {
        ...state,
        currentCall: null,
      };

    case SOCKET_ACTIONS.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map((notif) =>
          notif.id === action.payload ? { ...notif, read: true } : notif
        ),
        unreadNotifications: Math.max(0, state.unreadNotifications - 1),
      };

    case SOCKET_ACTIONS.MARK_MESSAGE_READ:
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload ? { ...msg, read: true } : msg
        ),
        unreadMessages: Math.max(0, state.unreadMessages - 1),
      };

    case SOCKET_ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
        unreadNotifications: 0,
      };

    default:
      return state;
  }
}

// Context
const SocketContext = createContext();
// Provider component
export function SocketProvider({ children }) {
  const [state, dispatch] = useReducer(socketReducer, initialState);

  useEffect(() => {
    // Kết nối socket
    socket.connect();

    // Lắng nghe các events từ server
    socket.on("connect", () => {
      dispatch({ type: SOCKET_ACTIONS.CONNECT });
    });

    socket.on("disconnect", () => {
      dispatch({ type: SOCKET_ACTIONS.DISCONNECT });
    });

    socket.on("notification", (data) => {
      dispatch({ type: SOCKET_ACTIONS.NEW_NOTIFICATION, payload: data });
    });

    socket.on("message", (data) => {
      dispatch({ type: SOCKET_ACTIONS.NEW_MESSAGE, payload: data });
    });

    socket.on("incoming_call", (data) => {
      dispatch({ type: SOCKET_ACTIONS.INCOMING_CALL, payload: data });
    });

    socket.on("call_ended", () => {
      dispatch({ type: SOCKET_ACTIONS.CALL_ENDED });
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, []);

  // Actions
  const actions = {
    markNotificationRead: (id) => {
      dispatch({ type: SOCKET_ACTIONS.MARK_NOTIFICATION_READ, payload: id });
    },
    markMessageRead: (id) => {
      dispatch({ type: SOCKET_ACTIONS.MARK_MESSAGE_READ, payload: id });
    },
    clearNotifications: () => {
      dispatch({ type: SOCKET_ACTIONS.CLEAR_NOTIFICATIONS });
    },
    acceptCall: () => {
      dispatch({ type: SOCKET_ACTIONS.CALL_ACCEPTED });
      socket.emit("accept_call", { callId: state.currentCall?.id });
    },
    rejectCall: () => {
      dispatch({ type: SOCKET_ACTIONS.CALL_REJECTED });
      socket.emit("reject_call", { callId: state.currentCall?.id });
    },
    endCall: () => {
      dispatch({ type: SOCKET_ACTIONS.CALL_ENDED });
      socket.emit("end_call", { callId: state.currentCall?.id });
    },
  };

  return (
    <SocketContext.Provider value={{ state, actions, socket }}>
      {children}
    </SocketContext.Provider>
  );
}
// Hook để sử dụng context
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
