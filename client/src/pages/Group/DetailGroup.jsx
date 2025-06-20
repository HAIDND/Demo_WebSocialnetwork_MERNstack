import React, { useContext, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  Button,
  Chip,
  Grid,
  Stack,
  useTheme,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";

import { useLocation, useParams } from "react-router-dom";
import PostInGroup from "./CRUDPostGroup";
import CreatePostInGroup from "./createPost";
import { CurrentUser } from "~/context/GlobalContext";
import { joinToGroup, leaveGroup } from "~/services/groupServices/groupService";
import GroupChat from "./GroupChat";

const DetailGroup = () => {
  const { id } = useParams();
  const location = useLocation();
  const [groupData, setGroupData] = useState(location.state?.groupData);
  const { currentUser } = useContext(CurrentUser);

  const [isJoin, setJoin] = useState([]);
  const [reload, setReload] = useState(true);

  const theme = useTheme();

  const handleJoinGroup = async () => {
    try {
      const response = await joinToGroup(id);
      if (response) {
        setReload(!reload);
      }
    } catch (error) {
      alert(error);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const response = await leaveGroup(id);
      if (response) {
        setReload(!reload);
      } else alert("Error");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Grid container>
      {/* Sidebar trái (placeholder) */}
      <Grid
        item
        flex={2}
        sx={{ overflow: "auto" }}
        display={{ xs: "none", md: "block" }}
      />

      {/* Nội dung chính */}
      <Grid
        item
        flex={4}
        sx={{
          mt: 12,
          px: { xs: 2, md: 5 },
          overflow: "auto",
        }}
      >
        {/* Header nhóm */}
        <Box
          sx={{
            p: 3,
            mb: 5,
            boxShadow: 2,
            borderRadius: 3,
            border: "1px solid #CCC",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: 3,
          }}
        >
          {/* Avatar + Info */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{ width: 80, height: 80 }}
              src={groupData?.avatar || "/default-avatar.png"}
              alt={groupData?.name}
            >
              <GroupIcon fontSize="large" />
            </Avatar>

            <Stack spacing={1}>
              <Typography variant="h5" fontWeight="bold">
                {groupData?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <GroupIcon
                  sx={{ fontSize: 16, verticalAlign: "middle", mr: 0.5 }}
                />
                {groupData?.members?.length} members
              </Typography>
              <Chip
                label={
                  groupData?.privacy === "public"
                    ? "Public Group"
                    : "Private Group"
                }
                color={groupData?.privacy === "public" ? "success" : "warning"}
                icon={
                  groupData?.privacy === "public" ? (
                    <PublicIcon />
                  ) : (
                    <LockIcon />
                  )
                }
                size="small"
                sx={{ width: "fit-content" }}
              />
            </Stack>
          </Box>

          {/* Nút Join/Leave + Group Chat */}
          <Box
            sx={{
              ml: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "flex-start", md: "flex-end" },
              gap: 1,
            }}
          >
            <GroupChat />
            {/* <Button
              variant="contained"
              color="primary"
              onClick={isJoin ? handleLeaveGroup : handleJoinGroup}
              sx={{ mt: 1 }}
            >
              {isJoin ? "Leave Group" : "Join Group"}
            </Button> */}
          </Box>
        </Box>

        {/* Post */}
        <CreatePostInGroup groupID={id} />
        <PostInGroup groupID={id} />
      </Grid>

      {/* Sidebar phải: GroupChat (nếu muốn giữ ở đây) */}
      <Grid
        item
        flex={2}
        sx={{ overflow: "auto", mt: 12 }}
        display={{ xs: "none", md: "block" }}
      >
        {/* <GroupChat /> */}
      </Grid>
    </Grid>
  );
};

export default DetailGroup;
