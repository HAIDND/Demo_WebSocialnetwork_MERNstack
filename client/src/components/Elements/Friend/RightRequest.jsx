import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  useMediaQuery,
  Grid,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
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
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleAccept = async (id) => {
    try {
      const result = await acceptFriendRequest(id);
      if (result) {
        setRequests((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error("Error accepting request:", err);
    }
    setReload(!reload);
  };

  const handleReject = async (id) => {
    try {
      const result = await rejectFriendRequest(id);
      if (result) {
        setRequests((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
    setReload(!reload);
  };

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

  const filteredRequests = requests.filter(
    (request) => request.status !== "accepted"
  );

  if (filteredRequests.length === 0) return null;

  return (
    <Box
      sx={{
        width: isSmallScreen ? "100%" : 360,
        px: 2,
        py: 3,
        mx: "auto",
        backgroundColor: theme.palette.background.paper,
        borderRadius: 4,
        boxShadow: 4,
      }}
    >
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: theme.palette.primary.main,
          mb: 3,
        }}
      >
        Friend Requests
      </Typography>

      <Grid container spacing={2}>
        {filteredRequests.map((request) => (
          <Grid item xs={12} key={request._id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 2,
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Avatar
                  src={request.requester?.avatar}
                  alt={request.requester?.username}
                  sx={{ width: 48, height: 48 }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {request.requester?.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {request.requester?.email}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      mt: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleAccept(request.requester)}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleReject(request.requester)}
                    >
                      Deny
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RightRequest;
