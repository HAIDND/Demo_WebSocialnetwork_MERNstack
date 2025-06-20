import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
} from "@mui/icons-material";

// Mock data dựa trên format được cung cấp
const mockData = {
  success: true,
  data: [
    {
      id: "6853d0ce250566634baa3e14",
      username: "123",
      avatar: "",
      email: "123@gmail.com",
      mutualFriends: 8,
    },
    {
      id: "6853d0ce250566634baa3e15",
      username: "Alice Johnson",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b9b9b9b6?w=150&h=150&fit=crop&crop=face",
      email: "alice@gmail.com",
      mutualFriends: 12,
    },
    {
      id: "6853d0ce250566634baa3e16",
      username: "Bob Smith",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      email: "bob@gmail.com",
      mutualFriends: 5,
    },
    {
      id: "6853d0ce250566634baa3e17",
      username: "Emily Chen",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      email: "emily@gmail.com",
      mutualFriends: 15,
    },
    {
      id: "6853d0ce250566634baa3e18",
      username: "David Wilson",
      avatar: "",
      email: "david@gmail.com",
      mutualFriends: 3,
    },
    {
      id: "6853d0ce250566634baa3e19",
      username: "Sarah Davis",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      email: "sarah@gmail.com",
      mutualFriends: 20,
    },
  ],
  message: "Friend suggestions retrieved successfully",
};

const FriendSuggestionList = () => {
  const [addedFriends, setAddedFriends] = useState(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  // Simulate navigation - trong thực tế sẽ dùng react-router
  const navigateToProfile = (userId) => {
    // window.location.href = `/profile/${userId}`;
    console.log(`Navigate to /profile/${userId}`);
    setSnackbar({ open: true, message: `Navigating to profile ${userId}` });
  };

  const handleAddFriend = (e, userId, username) => {
    e.stopPropagation(); // Prevent card click navigation

    // Simulate API call
    setAddedFriends((prev) => new Set([...prev, userId]));
    setSnackbar({
      open: true,
      message: `Friend request sent to ${username}!`,
    });

    console.log(`Add friend request sent to user ${userId}`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "" });
  };

  const generateAvatarUrl = (username) => {
    // Tạo avatar mặc định dựa trên tên
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      username
    )}&background=1976d2&color=fff&size=150`;
  };

  if (!mockData.success || !mockData.data) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Failed to load friend suggestions</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        People you may know
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          pb: 2,
          "&::-webkit-scrollbar": {
            height: 8,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
            borderRadius: 4,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c1c1c1",
            borderRadius: 4,
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#a8a8a8",
          },
        }}
      >
        {mockData.data.map((user) => (
          <Card
            key={user.id}
            sx={{
              minWidth: 280,
              maxWidth: 280,
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 4,
              },
              display: "flex",
              flexDirection: "column",
            }}
            onClick={() => navigateToProfile(user.id)}
          >
            <Box sx={{ position: "relative", textAlign: "center", pt: 2 }}>
              <Avatar
                src={user.avatar || generateAvatarUrl(user.username)}
                sx={{
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 1,
                  border: "3px solid",
                  borderColor: "primary.main",
                }}
              />

              {user.mutualFriends > 0 && (
                <Chip
                  icon={<PeopleIcon />}
                  label={`${user.mutualFriends} mutual friends`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    fontSize: "0.7rem",
                  }}
                />
              )}
            </Box>

            <CardContent sx={{ flexGrow: 1, textAlign: "center", pt: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.username}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.email}
              </Typography>

              <Button
                variant={addedFriends.has(user.id) ? "outlined" : "contained"}
                startIcon={<PersonAddIcon />}
                fullWidth
                disabled={addedFriends.has(user.id)}
                onClick={(e) => handleAddFriend(e, user.id, user.username)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1,
                }}
              >
                {addedFriends.has(user.id) ? "Request Sent" : "Add Friend"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FriendSuggestionList;
