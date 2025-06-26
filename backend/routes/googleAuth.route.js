const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const express = require("express");
const googleAuthRoute = express.Router();
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

// Google OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Import models and services
const User = require("../models/User");
const { createUser } = require("../controllers/neo4j/Neo4jUserController");

// Google Auth Route
googleAuthRoute.post("/auth", async (req, res) => {
  const { token } = req.body;

  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    // Check if user already exists in MongoDB
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      // User doesn't exist, create new user in MongoDB
      user = await User.create({
        username: name,
        email: email,
        avatar: picture,
        authType: "google",
        googleId: sub, // Store Google ID for reference
      });

      isNewUser = true;
      console.log("New Google user created:", email);

      // Create user node in Neo4j for new users only
      try {
        await createUser(user);
        console.log("Neo4j user node created for:", email);
      } catch (neo4jError) {
        console.error("Error creating Neo4j user node:", neo4jError);
        // Continue execution even if Neo4j fails
      }
    } else {
      console.log("Existing user logged in:", email);

      // Optionally update user info if needed
      if (user.username !== name || user.avatar !== picture) {
        user.username = name;
        user.avatar = picture;
        await user.save();
        console.log("User info updated:", email);
      }
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        authType: user.authType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Extended to 7 days for better UX
    );

    // Return response
    res.json({
      token: jwtToken,
      userId: user._id,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        authType: user.authType,
      },
      isNewUser: isNewUser,
    });
  } catch (err) {
    console.error("Google login error:", err);

    // More specific error handling
    if (err.message && err.message.includes("Token used too early")) {
      return res
        .status(400)
        .json({ error: "Token chưa hợp lệ, vui lòng thử lại" });
    }

    if (err.message && err.message.includes("Token used too late")) {
      return res
        .status(400)
        .json({ error: "Token đã hết hạn, vui lòng đăng nhập lại" });
    }

    res.status(400).json({
      error: "Đăng nhập Google thất bại",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Temporary User Schema for OTP verification (if needed for other auth methods)
const TempUserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Auto-delete after 5 minutes
  },
});

const TempUser = mongoose.model("TempUser", TempUserSchema);

// Optional: Add a route to get user profile
googleAuthRoute.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token không được cung cấp" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "Người dùng không tồn tại" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(401).json({ error: "Token không hợp lệ" });
  }
});

// Optional: Add a logout route
googleAuthRoute.post("/logout", (req, res) => {
  // Since JWT is stateless, we just return success
  // In a production app, you might want to maintain a blacklist of tokens
  res.json({ message: "Đăng xuất thành công" });
});

module.exports = googleAuthRoute;
