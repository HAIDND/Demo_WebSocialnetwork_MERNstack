import React, { useEffect, useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { getFriendSuggestionList } from "~/services/RecommendServices/FriendSuggest";
import { useNavigate } from "react-router-dom";

const FriendSuggestionList = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const navigateToProfile = (id) => {
    navigate(`/profile/${id}`);
  };
  useEffect(() => {
    async function fetchSuggestions() {
      const result = await getFriendSuggestionList();
      if (result?.success) {
        setSuggestions(result.data);
      }
      setLoading(false);
    }

    fetchSuggestions();
  }, []);

  if (loading) return <CircularProgress />;
  if (suggestions.length == 0) return null;
  return (
    <Box sx={{ p: 2 }}>
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
        {suggestions.map((user) => (
          <Card
            key={user.id}
            sx={{
              margin: 1,
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
                src={user?.avatar}
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
                //  variant={addedFriends.has(user.id) ? "outlined" : "contained"}
                startIcon={<PersonAddIcon />}
                fullWidth
                //disabled={addedFriends.has(user.id)}
                onClick={(e) => handleAddFriend(e, user.id, user.username)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1,
                }}
              >
                {/* {addedFriends.has(user.id) ? "Request Sent" : "Add Friend"} */}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Snackbar
        // open={snackbar.open}
        autoHideDuration={3000}
        // onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          // onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {/* {snackbar.message} */}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FriendSuggestionList;
