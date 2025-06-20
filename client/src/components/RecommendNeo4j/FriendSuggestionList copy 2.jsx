import React, { useEffect, useState } from "react";
import { getFriendSuggestionList } from "../services/friendAPI";
import {
  Box,
  Avatar,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const FriendSuggestionList = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Gợi ý kết bạn
      </Typography>
      <List>
        {suggestions.map((user) => (
          <React.Fragment key={user.id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar src={user.avatar || "/default-avatar.png"} />
              </ListItemAvatar>
              <ListItemText
                primary={user.username}
                secondary={`Bạn chung: ${user.mutualFriends}`}
              />
              <PersonAddIcon color="primary" sx={{ cursor: "pointer" }} />
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default FriendSuggestionList;
