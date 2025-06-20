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

    // { title: "ChatRealtime", path: "/chat", icon: <Chat /> },
    // { title: "Live stream", path: "/livestream", icon: <Camera /> },
    {
      title: "Recommend Location",
      path: "/recommendpage",
      icon: <Recommend />,
    },
    { title: "Settings", path: "/settings", icon: <SettingsIcon /> },
  ];

  return (
    <Box
      sx={{
        mt: 10,
        width: 290,
        position: "fixed",
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        height: "100%",
        display: isMobile ? "none" : "block",
        boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        transition: "all 0.3s ease-in-out",
      }}
    >
      <List>
        {listMenu.map(({ title, path, icon }) => (
          <ListItem
            component={Link}
            to={path}
            key={title}
            sx={{
              padding: "12px 20px",
              borderRadius: 2,
              mx: 1,
              my: 1,
              transition: "background-color 0.3s, transform 0.2s",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
                transform: "translateX(4px)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: theme.palette.text.secondary,
                minWidth: 36,
                transition: "color 0.3s",
                "&:hover": {
                  color: theme.palette.primary.main,
                },
              }}
            >
              {icon}
            </ListItemIcon>
            <ListItemText
              primary={title}
              primaryTypographyProps={{
                fontWeight: 500,
                sx: {
                  transition: "color 0.3s",
                  "&:hover": {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
