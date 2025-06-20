import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles"; // Import hook theme
import { CurrentUser } from "~/context/GlobalContext";
import {
  acceptFriendRequest,
  getListFriendRequest,
  rejectFriendRequest,
} from "~/services/friendServices/friendService";

const RightRequest = () => {
  const { currentUser } = useContext(CurrentUser);
  const [requests, setRequests] = useState([]);
  const [reload, setReload] = useState(false);
  const theme = useTheme(); // Truy cập theme

  // Hàm xử lý chấp nhận yêu cầu kết bạn
  const handleAccept = async (id) => {
    try {
      const result = await acceptFriendRequest(id);
      if (result) {
        setRequests((prevRequests) =>
          prevRequests.filter((item) => item._id !== id)
        );
      } else {
        alert("Không thể chấp nhận yêu cầu.");
      }
    } catch (err) {
      console.error("Error accepting request:", err);
    }
    setReload(!reload);
  };

  // Hàm xử lý từ chối yêu cầu kết bạn
  const handleReject = async (id) => {
    try {
      const result = await rejectFriendRequest(id);
      if (result) {
        setRequests((prevRequests) =>
          prevRequests.filter((item) => item._id !== id)
        );
      } else {
        alert("Không thể từ chối yêu cầu.");
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
    setReload(!reload);
  };

  // Gọi API lấy danh sách yêu cầu kết bạn
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getListFriendRequest();
        setRequests(result);
      } catch (error) {
        console.log("Error fetching friend requests:", error);
      }
    };
    fetchData();
  }, [reload]);

  // Chỉ render component nếu requests không rỗng
  if (
    requests.filter((request) => request.status !== "accepted").length === 0
  ) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(2),
        width: 360,
        padding: theme.spacing(3),
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[3],
        maxWidth: 300,
        ml: theme.spacing(7),
        mb: 5,
      }}
    >
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          color: theme.palette.text.primary,
          marginBottom: theme.spacing(0),
        }}
      >
        Friend Requests
      </Typography>
      {requests
        .filter((request) => request.status !== "accepted")
        .map((request) => (
          <Card key={request._id} sx={{ marginBottom: theme.spacing(0) }}>
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                padding: theme.spacing(2),
              }}
            >
              <Avatar
                alt={request.requester?.username}
                src={request.requester?.avatar}
                sx={{ marginRight: theme.spacing(0) }}
              />
              <Box sx={{ flexGrow: 1, ml: 1 }}>
                <Typography
                  variant="body1"
                  sx={{ color: theme.palette.text.primary }}
                >
                  {request.requester.username}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {request.requester.email}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: theme.spacing(1),
                    marginTop: theme.spacing(1),
                  }}
                >
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleAccept(request.requester)}
                    sx={{
                      minWidth: 80,
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleReject(request.requester)}
                    sx={{
                      minWidth: 100,
                    }}
                  >
                    Deny
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
    </Box>
  );
};

export default RightRequest;
