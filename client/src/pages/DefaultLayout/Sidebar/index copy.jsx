import React, { useContext } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  Newspaper as NewspaperIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Chat,
  Camera,
  Recommend,
} from "@mui/icons-material"; // Import icon từ MUI

// Import context
import { CurrentUser } from "~/context/GlobalContext";

const Sidebar = () => {
  const { currentUserInfo, currentUser, isMobile } = useContext(CurrentUser);
  const theme = useTheme();
  const listMenu = [
    { title: "Newsfeed", path: "/newsfeed", icon: <NewspaperIcon /> },
    {
      title: "Profile",
      path: `/profile/${currentUser?.userId}`,
      icon: <PersonIcon />,
    },
    { title: "Friends", path: "/friends", icon: <PeopleIcon /> },
    { title: "Groups", path: "/groups", icon: <GroupIcon /> },
    { title: "Settings", path: "/settings", icon: <SettingsIcon /> },
    // { title: "ChatRealtime", path: "/chat", icon: <Chat /> },
    // { title: "Live stream", path: "/livestream", icon: <Camera /> },
    {
      title: "Recommend Location",
      path: "/recommendpage",
      icon: <Recommend />,
    },
  ];
  return (
    <Box
      sx={{
        mt: 10,
        width: 240,
        position: "fixed",
        backgroundColor: theme.palette.background.paper,
        // boxShadow: theme.shadows[3],
        color: theme.palette.text.primary,
        height: "100%",
        display: isMobile ? "none" : "block",
      }}
    >
      <List>
        {listMenu.map(({ title, path, icon }) => (
          <ListItem
            component={Link}
            to={path}
            key={title}
            sx={{
              padding: 2,
              "&:hover": { backgroundColor: theme.palette.text.secondary },
            }}
          >
            <ListItemIcon
              sx={{
                "&:hover": "red",
              }}
            >
              {icon}
            </ListItemIcon>
            <ListItemText primary={title} sx={{ fontWeight: "bold" }} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
