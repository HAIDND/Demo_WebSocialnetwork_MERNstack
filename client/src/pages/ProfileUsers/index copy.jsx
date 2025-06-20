import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  Button,
  useTheme,
} from "@mui/material";

// import Sidebar from "~/components/Layouts/Sidebar";
import {
  getInfo,
  readUser,
  saveInfo,
} from "~/services/userServices/userService";
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
  // Lấy theme hiện tại
  const theme = useTheme();

  // Fetch user profile data from API
  useEffect(() => {
    readUser(userId || currentUser?.userId).then((data) => {
      if (data) {
        setProfile(data);
      } else {
        alert("No profile");
      }
    });
    getListFriend().then((data) => {
      if (data) {
        setListFriend(data);
      } else {
        console.log("No list friend");
      }
    });
  }, [userId, reload]);
  //add un friend
  const handleAddFriend = async () => {
    try {
      addFriendAPI(userId).then((response) => {
        if (response) {
          alert(response.message);
          setReload(!reload);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleDeleteFriend = async () => {
    try {
      const response = await removeFriend(userId).then((data) => {
        alert(data?.message);
        setReload(!reload);
      });
    } catch (error) {
      console.log(error);
    }
  };
  //chat windows
  const [openChat, setOpenChat] = useState(false);
  const handleOpenChat = () => {
    setOpenChat(true);
  };
  const handleCloseChat = () => {
    setOpenChat(false);
  };

  return (
    <Grid container sx={{ mb: 12 }}>
      <Grid
        item
        flex={2}
        sx={{ overflow: "auto" }}
        display={{ xs: "none", md: "block" }}
      >
        {/* <Sidebar /> */}
      </Grid>
      <Grid item flex={8} sx={{ mt: 12, height: "100%", overflow: "auto" }}>
        <Box
          component={Paper}
          sx={{
            maxWidth: 800,
            margin: "0 auto",
            padding: 4,
            borderRadius: 2,
            boxShadow: theme.shadows[5],
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            mb: 5,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            {/* Avatar */}
            <Grid item xs={12} sx={{ textAlign: "center" }}>
              <Avatar
                src={profile?.avatar}
                alt={`${profile?.userId} ${profile?.lastName}`}
                sx={{ width: 100, height: 100, margin: "0 auto" }}
              />
            </Grid>

            {/* Name */}
            <Grid item xs={12} sx={{ textAlign: "center" }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
              >
                {profile?.username}
              </Typography>
            </Grid>

            {/* Buttons */}
            <Grid container justifyContent="center" spacing={2} mt={2}>
              {currentUser?.userId !== userId && (
                <>
                  {listFriend.some((friend) => friend?._id === userId) ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      sx={{ mr: 1 }}
                      onClick={handleDeleteFriend}
                    >
                      Unfriend
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mr: 1 }}
                      onClick={handleAddFriend}
                    >
                      Addfriend
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleOpenChat}
                  >
                    Chat
                  </Button>
                  {openChat && (
                    <ChatWindow onClose={handleCloseChat} friend={profile} />
                  )}
                </>
              )}
            </Grid>
            {/* Other Details */}
            <Grid item xs={12}>
              <Typography variant="body1">
                <strong>Email:</strong> {profile?.email}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">
                <strong>Phone number:</strong> {profile?.phone}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">
                <strong>Date of birth:</strong> {profile?.dateOfBirth || ""}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">
                <strong>Gender:</strong> {profile?.gender}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        {currentUser?.userId === userId && (
          <PostPrivate visibility={"private"} />
        )}
      </Grid>
    </Grid>
  );
};

export default Profile;
