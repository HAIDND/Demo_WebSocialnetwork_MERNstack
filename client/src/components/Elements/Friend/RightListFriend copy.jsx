import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Badge,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles"; // Import theme hook
import { getListFriend } from "~/services/friendServices/friendService"; // Giả sử bạn có hàm API này
import IsUserActive, { CheckUserActive } from "../IsUserActive";

const RightListFriend = () => {
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme(); // Truy cập theme

  // Gọi API lấy danh sách bạn bè
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

  // Xử lý điều hướng khi click vào bạn bè
  const handleFriendClick = (id) => {
    navigate(`/profile/${id}`);
  };

  // Nếu danh sách bạn bè rỗng, không render component
  if (friends.length === 0) {
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
        mb: 3,
        mt: 3,
      }}
    >
      <Typography
        variant="h5"
        sx={{ textAlign: "center", marginBottom: theme.spacing(0) }}
        color="primary"
      >
        My Friends
      </Typography>
      <List>
        {friends.map((friend) => (
          <FriendCardItem
            key={friend._id}
            friend={friend}
            handleFriendClick={handleFriendClick}
          /> // Sửa ở đây
        ))}
      </List>
    </Box>
  );
};

function FriendCardItem({ friend, handleFriendClick }) {
  const theme = useTheme(); // Truy cập theme
  const [isOnline, setIsOnline] = useState(null);
  // Gọi checkOnline() khi component mount
  useEffect(() => {}, [CheckUserActive(friend?.email)]); // Chỉ gọi lại khi friend.email thay đổi
  return (
    <ListItem
      key={friend._id}
      button
      onClick={() => handleFriendClick(friend._id)}
      sx={{
        "&:hover": { backgroundColor: theme.palette.action.hover },
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: "flex",
        alignItems: "center",
      }}
    >
      <ListItemAvatar>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          variant="dot"
          size="medium"
          color={CheckUserActive(friend?.email) ? "success" : "error"}
        >
          <Avatar alt={friend.name} src={friend.avatar} />
        </Badge>
      </ListItemAvatar>
      <ListItemText
        primary={friend.username}
        secondary={friend.email}
        primaryTypographyProps={{
          color: theme.palette.text.primary,
          fontWeight: "bold",
        }}
        secondaryTypographyProps={{ color: theme.palette.text.secondary }}
      />
    </ListItem>
  );
}
export default RightListFriend;
