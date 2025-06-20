import React, { useContext, useEffect, useState } from "react";
import { Avatar, Box, Typography, Button, Chip, Grid } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";

import { useLocation, useParams } from "react-router-dom";
import PostInGroup from "./CRUDPostGroup";
import CreatePostInGroup from "./createPost";
import { CurrentUser } from "~/context/GlobalContext";
import {
  addMemberToGroup,
  joinToGroup,
  leaveGroup,
  listGroupAll,
} from "~/services/groupServices/groupService";
import GroupChat from "./GroupChat";

const DetailGroup = () => {
  //lấy id
  const { id } = useParams();

  const location = useLocation();
  const [groupData, setGroupData] = useState(location.state?.groupData);

  const { currentUser } = useContext(CurrentUser);
  const [isJoin, setJoin] = useState([]);
  const [reload, setReload] = useState(true);

  // const checkJoin = () => {
  //   return groupData.members.includes(currentUser?.userId);
  // };
  // // alert(checkJoin());
  // useEffect(() => {
  //   setJoin(checkJoin());
  // }, [isJoin]);

  //handle join gruop
  const handleJoinGroup = async () => {
    try {
      const response = await joinToGroup(id).then((data) => {
        if (data) {
          console.log(data);
          setReload(!reload);
        }
      });
    } catch (error) {
      alert(error);
    }
  };
  //handle leave group
  const handleLeaveGroup = async () => {
    try {
      const response = await leaveGroup(id).then((data) => {
        if (data) {
          setReload(!reload);
          console.log(data?.message);
        } else alert("Error");
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <Grid container>
        <Grid
          item
          flex={2}
          sx={{ overflow: "auto" }}
          display={{ xs: "none", md: "block" }}
        ></Grid>
        <Grid
          item
          flex={4}
          sx={{
            mt: 12,
            height: "100%",
            overflow: "auto",
            marginRight: 5,
            marginLeft: 5,
          }}
        >
          <Box
            sx={{
              padding: 3,
              mb: 5,
              boxShadow: 2,
              borderRadius: 2,
              border: "1px solid #CCC",
              bgcolor: "background.paper",
              display: "flex",
              alignItems: "center",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            {/* Avatar của group */}
            <Avatar
              sx={{ width: 80, height: 80 }}
              src={groupData?.avatar || "/default-avatar.png"}
              alt={groupData?.name}
            >
              <GroupIcon fontSize="large" />
            </Avatar>

            {/* Thông tin chi tiết của group */}
            <Box sx={{ flexGrow: 1 }}>
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
                sx={{ mt: 1 }}
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
              />
              <GroupChat />
            </Box>

            {/* Button tham gia group */}
            {/* {!isJoin ? (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    handleJoinGroup();
                                    setJoin(true);
                                    setReload(!reload);
                                }}
                            >
                                Join Group
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    handleLeaveGroup();
                                    setJoin(false);
                                    setReload(!reload);
                                }}
                            >
                                Leave group
                            </Button>
                        )} */}
          </Box>
          <CreatePostInGroup groupID={id} />
          <PostInGroup groupID={id} />
        </Grid>
        <Grid
          item
          flex={2}
          sx={{ overflow: "auto", mt: 12 }}
          display={{ xs: "none", md: "block" }}
        >
          {/* <GroupChat /> */}
        </Grid>
      </Grid>
    </>
  );
};

export default DetailGroup;
