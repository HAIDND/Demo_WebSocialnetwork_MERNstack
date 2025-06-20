import React, { useContext, useEffect, useState } from "react";
import { Box, Typography, Button, Avatar, Grid } from "@mui/material";

import { CurrentUser } from "~/context/GlobalContext";
import {
  getListFriend,
  removeFriend,
} from "~/services/friendServices/friendService";
import { useNavigate } from "react-router-dom";
import YesNoDialog from "~/components/Elements/YesNoDialog";

const FriendRequestCard = ({ request, handleDeleteFriend }) => {
  const navigate = useNavigate();
  ///yesno dialog
  const [yesno, setYesNo] = useState(false);
  const [idFriend, setIdFriend] = useState(null);
  const clickDelete = (id) => {
    setIdFriend(id);
    setYesNo(true);
  };
  return (
    <>
      <Box
        sx={{
          width: 200,
          minHeight: 225, // Đặt chiều cao tối thiểu để đồng nhất
          border: "1px solid #ddd",
          borderRadius: 2,
          boxShadow: 1,
          p: 2,
          textAlign: "center",
          mb: 2,
          mt: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between", // Đẩy các nút xuống cuối thẻ
        }}
        onClick={() => {
          navigate(`/profile/${request._id}`);
        }}
      >
        <Box>
          <Avatar
            src={request.avatar}
            alt={request.name}
            sx={{ width: 80, height: 80, margin: "0 auto" }}
          />
          <Typography variant="body1" fontWeight="600" mt={1}>
            {request.username}
          </Typography>
          {request.mutualFriends && (
            <Typography variant="caption" color="textSecondary">
              {request.mutualFriends} bạn chung
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={(event) => {
              event.stopPropagation();
              clickDelete(request?._id);
            }}
            sx={{ textTransform: "none" }}
          >
            Delete
          </Button>
        </Box>
      </Box>{" "}
      <YesNoDialog
        yesno={yesno}
        setYesNo={setYesNo}
        onConfirm={() => handleDeleteFriend(request?._id)}
        title={"Xác nhận xóa"}
        message={"Bạn có chắc chắn muốn xóa mục này không?"}
      />
    </>
  );
};

const FriendRequestList = ({ requests, handleDeleteFriend }) => {
  console.log(requests);
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="600" mb={2}>
        List Friends
      </Typography>
      <Typography
        variant="body2"
        color="primary"
        sx={{ cursor: "pointer", mt: 2 }}
        onClick={() => console.log("View all clicked")}
      >
        {`You have ${requests.length}  friends`}
      </Typography>
      <Grid container spacing={2}>
        {requests.map((request) => (
          <Grid item key={request._id}>
            <FriendRequestCard
              request={request}
              handleDeleteFriend={handleDeleteFriend}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
// Component chính
const FriendList = () => {
  const [reload, setReload] = useState(false);
  const [data, setData] = useState([]);
  const { currentUser } = useContext(CurrentUser);
  // Hàm xác nhận hành động được gọi từ popup

  const handleDeleteFriend = async (userId) => {
    try {
      const response = await removeFriend(userId).then((data) => {
        alert(data?.message);
        setReload(!reload);
      });
    } catch (error) {
      console.log(error);
    }
  };

  //caall api getList

  useEffect(() => {
    try {
      getListFriend().then((result) => {
        setData(result);
      });
    } catch (error) {
      console.log(error);
    }
  }, [reload]);

  return (
    <Grid container>
      <FriendRequestList
        requests={data}
        handleDeleteFriend={handleDeleteFriend}
      />
    </Grid>
  );
};

export default FriendList;
