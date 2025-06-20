import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Badge,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { getListFriend } from "~/services/friendServices/friendService";
import { CheckUserActive } from "../IsUserActive";

const RightListFriend = () => {
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const result = await getListFriend();
        setFriends(result);
      } catch (error) {
        console.error("Error fetching friend list:", error);
      }
    };
    fetchFriends();
  }, []);

  const handleFriendClick = (id) => {
    navigate(`/profile/${id}`);
  };

  if (friends.length === 0) return null;

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
        mt: 4,
        mb: 4,
      }}
    >
      <Typography
        variant="h5"
        align="center"
        sx={{
          fontWeight: 600,
          color: theme.palette.primary.main,
          mb: 3,
        }}
      >
        My Friends
      </Typography>

      <List disablePadding>
        {friends.map((friend) => (
          <FriendCardItem
            key={friend._id}
            friend={friend}
            handleFriendClick={handleFriendClick}
          />
        ))}
      </List>
    </Box>
  );
};

function FriendCardItem({ friend, handleFriendClick }) {
  const theme = useTheme();
  const isOnline = CheckUserActive(friend?.email);

  return (
    <ListItem
      button
      onClick={() => handleFriendClick(friend._id)}
      sx={{
        py: 1.5,
        px: 2,
        borderRadius: 3,
        mb: 1.5,
        boxShadow: 1,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
          transform: "scale(1.02)",
          boxShadow: 3,
        },
      }}
    >
      <ListItemAvatar>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          variant="dot"
          color={isOnline ? "success" : "default"}
        >
          <Avatar alt={friend.username} src={friend.avatar} />
        </Badge>
      </ListItemAvatar>

      <ListItemText
        primary={friend.username}
        secondary={friend.email}
        primaryTypographyProps={{
          fontWeight: 600,
          fontSize: "1rem",
        }}
        secondaryTypographyProps={{
          fontSize: "0.85rem",
          color: theme.palette.text.secondary,
        }}
        sx={{ ml: 1 }}
      />
    </ListItem>
  );
}

export default RightListFriend;
