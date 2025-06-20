import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { getInfo, readUser } from "~/services/userServices/userService";
import { CurrentUser } from "~/context/GlobalContext";
import { useParams } from "react-router-dom";
import {
  addFriendAPI,
  getListFriend,
  removeFriend,
} from "~/services/friendServices/friendService";
import ChatWindow from "~/pages/Chatting/ChatWindow";
import PostPrivate from "./PostPrivate";

const Profile = () => {
  const [reload, setReload] = useState(false);
  const { currentUser } = useContext(CurrentUser);
  const { userId } = useParams();
  const [profile, setProfile] = useState({});
  const [listFriend, setListFriend] = useState([]);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    readUser(userId || currentUser?.userId).then((data) => {
      if (data) setProfile(data);
    });
    getListFriend().then((data) => {
      if (data) setListFriend(data);
    });
  }, [userId, reload]);

  const handleAddFriend = async () => {
    try {
      const response = await addFriendAPI(userId);
      if (response) {
        alert(response.message);
        setReload(!reload);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteFriend = async () => {
    try {
      const response = await removeFriend(userId);
      alert(response?.message);
      setReload(!reload);
    } catch (error) {
      console.log(error);
    }
  };

  const [openChat, setOpenChat] = useState(false);
  const handleOpenChat = () => setOpenChat(true);
  const handleCloseChat = () => setOpenChat(false);

  return (
    <Grid container justifyContent="center" sx={{ px: 2, mb: 8, ml: 12 }}>
      <Grid item xs={12} md={10} lg={8}>
        <Paper
          elevation={4}
          sx={{
            mt: 12,
            p: 4,
            borderRadius: 4,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        >
          <Grid container spacing={3} justifyContent="center">
            {/* Avatar */}
            <Grid item xs={12} textAlign="center">
              <Avatar
                src={profile?.avatar}
                alt={profile?.username}
                sx={{
                  width: 120,
                  height: 120,
                  mx: "auto",
                  boxShadow: 3,
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  mt: 2,
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                }}
              >
                {profile?.username}
              </Typography>
            </Grid>

            {/* Actions */}
            {currentUser?.userId !== userId && (
              <Grid item xs={12} textAlign="center">
                {listFriend.some((friend) => friend?._id === userId) ? (
                  <Button
                    variant="outlined"
                    color="secondary"
                    sx={{ mr: 1, borderRadius: 3 }}
                    onClick={handleDeleteFriend}
                  >
                    Unfriend
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mr: 1, borderRadius: 3 }}
                    onClick={handleAddFriend}
                  >
                    Add Friend
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="success"
                  sx={{ borderRadius: 3 }}
                  onClick={handleOpenChat}
                >
                  Chat
                </Button>
              </Grid>
            )}

            {/* Thông tin cá nhân */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: theme.palette.action.hover,
                }}
              >
                <Grid container spacing={2}>
                  <InfoRow label="Email" value={profile?.email} />
                  <InfoRow label="Phone" value={profile?.phone} />
                  <InfoRow label="Date of Birth" value={profile?.dateOfBirth} />
                  <InfoRow label="Gender" value={profile?.gender} />
                </Grid>
              </Box>
            </Grid>
          </Grid>

          {openChat && (
            <ChatWindow onClose={handleCloseChat} friend={profile} />
          )}
        </Paper>

        {/* Bài viết riêng tư */}
        {currentUser?.userId === userId && (
          <Box mt={5}>
            <PostPrivate visibility="private" />
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

const InfoRow = ({ label, value }) => (
  <Grid item xs={12} sm={6}>
    <Typography variant="body1">
      <strong>{label}:</strong> {value || "N/A"}
    </Typography>
  </Grid>
);

export default Profile;
