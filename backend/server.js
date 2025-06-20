const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const friendRoutes = require("./routes/friendRoutes");
const postRoutes = require("./routes/postRoutes");
const groupRoutes = require("./routes/groupRoutes");
const path = require("path");
const chatRoutes = require("./routes/userMessage.route");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatbotRoutes = require("./routes/chatbot.route");
const locationRoutes = require("./routes/locationRoutes");
const http = require("http");
const { Server } = require("socket.io");
//add 8-4
const { AccessToken } = require("livekit-server-sdk");
const apiKey = "devkey";
const apiSecret = "devsecret";

const mongoose = require("mongoose");
const { setupSocket } = require("./socketIO/socket");
const groupMessageRoute = require("./routes/groupMessage.route");
const googleAuthRoute = require("./utils/googleAuth.route");
const neo4jRecommendRoutes = require("./routes/neo4jRecommend.route");

dotenv.config();
//âsad
const corsOptions = {
  // origin: process.env.CORS_ORIGIN,
  origin: "http://localhost:5173",
  // // URL của frontend  " http://localhost:5173"  ||
  credentials: true, // Cho phép cookie
};
// Kết nối tới MongoDB
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((error) => console.error("MongoDB connection error:", error));
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

app.use(cors(corsOptions));

app.use(express.json()); // Xử lý dữ liệu JSON từ raw
app.use(express.urlencoded({ extended: true })); // Xử lý dữ liệu từ form-data

// Route cơ bản
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/chat", chatRoutes); // Prefix /api/chat cho các route chat
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/recommnend", neo4jRecommendRoutes);
// Routes
app.use("/api/locations", locationRoutes);
// Routes
app.use("/api/groupmessage", groupMessageRoute);
app.use("/api/google", googleAuthRoute);
// Socket.io event handling
app.get("/getToken", (req, res) => {
  const { identity, room } = req.query;

  const at = new AccessToken(apiKey, apiSecret, {
    identity,
  });

  at.addGrant({ roomJoin: true, room });

  res.json({ token: at.toJwt() });
});
// Initialize socket.io
setupSocket(server);
// Khởi động server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
