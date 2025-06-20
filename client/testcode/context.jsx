import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import {
  Bell,
  MessageCircle,
  Phone,
  PhoneCall,
  X,
  Check,
  Volume2,
} from "lucide-react";

// Socket.IO client mock (trong thực tế sẽ import từ socket.io-client)
class MockSocket {
  constructor() {
    this.listeners = {};
    this.connected = false;
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    console.log(`Emitting ${event}:`, data);
    // Simulate server response
    if (event === "join_room") {
      setTimeout(() => this.trigger("room_joined", { room: data.room }), 500);
    }
  }

  trigger(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  connect() {
    this.connected = true;
    setTimeout(() => this.trigger("connect"), 100);
  }

  disconnect() {
    this.connected = false;
    this.trigger("disconnect");
  }
}

// Tạo socket instance
const socket = new MockSocket();

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

// Component hiển thị trạng thái kết nối
function ConnectionStatus() {
  const { state } = useSocket();

  return (
    <div
      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
        state.connected
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full ${
          state.connected ? "bg-green-500" : "bg-red-500"
        }`}
      ></div>
      <span>{state.connected ? "Đã kết nối" : "Mất kết nối"}</span>
    </div>
  );
}

// Component thông báo
function NotificationPanel() {
  const { state, actions } = useSocket();
  const [showPanel, setShowPanel] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
      >
        <Bell className="w-6 h-6 text-blue-600" />
        {state.unreadNotifications > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {state.unreadNotifications}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-10">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Thông báo</h3>
            <button
              onClick={actions.clearNotifications}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Xóa tất cả
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {state.notifications.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">
                Không có thông báo nào
              </p>
            ) : (
              state.notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                    !notif.read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => actions.markNotificationRead(notif.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{notif.title}</p>
                      <p className="text-gray-600 text-xs">{notif.message}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Component tin nhắn
function MessagePanel() {
  const { state, actions } = useSocket();
  const [showPanel, setShowPanel] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
      >
        <MessageCircle className="w-6 h-6 text-green-600" />
        {state.unreadMessages > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {state.unreadMessages}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-10">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Tin nhắn</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {state.messages.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">
                Không có tin nhắn nào
              </p>
            ) : (
              state.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                    !msg.read ? "bg-green-50" : ""
                  }`}
                  onClick={() => actions.markMessageRead(msg.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{msg.sender}</p>
                      <p className="text-gray-600 text-xs">{msg.content}</p>
                    </div>
                    {!msg.read && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Component cuộc gọi
function CallPanel() {
  const { state, actions } = useSocket();

  if (!state.currentCall) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Phone className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {state.currentCall.status === "incoming"
              ? "Cuộc gọi đến"
              : "Đang gọi"}
          </h3>
          <p className="text-gray-600 mb-6">{state.currentCall.caller}</p>

          {state.currentCall.status === "incoming" ? (
            <div className="flex justify-center space-x-4">
              <button
                onClick={actions.rejectCall}
                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
              <button
                onClick={actions.acceptCall}
                className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full"
              >
                <PhoneCall className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center space-x-4">
              <button
                onClick={actions.endCall}
                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-2 text-green-600">
                <Volume2 className="w-5 h-5" />
                <span className="text-sm">Đang kết nối...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Component demo để test
function DemoControls() {
  const { state, socket } = useSocket();

  const sendTestNotification = () => {
    socket.trigger("notification", {
      title: "Thông báo mới",
      message: "Bạn có một thông báo mới từ hệ thống",
      type: "info",
    });
  };

  const sendTestMessage = () => {
    socket.trigger("message", {
      sender: "Nguyễn Văn A",
      content: "Xin chào! Bạn khỏe không?",
      timestamp: new Date().toISOString(),
    });
  };

  const simulateIncomingCall = () => {
    socket.trigger("incoming_call", {
      id: Date.now(),
      caller: "Trần Thị B",
      avatar: null,
    });
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-semibold mb-4">Demo Controls</h3>
      <div className="flex space-x-2 flex-wrap gap-2">
        <button
          onClick={sendTestNotification}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Gửi thông báo
        </button>
        <button
          onClick={sendTestMessage}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Gửi tin nhắn
        </button>
        <button
          onClick={simulateIncomingCall}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
        >
          Cuộc gọi đến
        </button>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <header className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                Socket.IO Notification Manager
              </h1>
              <div className="flex items-center space-x-4">
                <ConnectionStatus />
                <MessagePanel />
                <NotificationPanel />
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Tính năng</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Quản lý trạng thái kết nối Socket.IO</li>
                <li>• Thông báo real-time</li>
                <li>• Tin nhắn real-time</li>
                <li>• Quản lý cuộc gọi</li>
                <li>• Đếm thông báo chưa đọc</li>
                <li>• Context API cho state toàn cục</li>
              </ul>
            </div>

            <DemoControls />
          </div>
        </div>

        <CallPanel />
      </div>
    </SocketProvider>
  );
}

export default App;
