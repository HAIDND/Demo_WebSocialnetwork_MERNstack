import React, { useContext, useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  Avatar,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Home as HomeIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ListAlt,
} from "@mui/icons-material";

import { logout } from "~/services/authService/authService";
import GlobalContext, {
  CurrentUser,
  useGlobalContext,
} from "~/context/GlobalContext";
import SearchComponent from "./SearchComponent";
import NotificationPanel from "./Notifi";
import ChatList from "~/pages/Chatting/ChatList";
import ThemeSettings from "./ThemeSettings";
import { SocketContext } from "~/context/SocketContext";
import NotificationDemo from "~/components/Elements/Notifi/Notify";

// import SidebarMobile from "./SideBarMobile";

const Header = () => {
  const { LogoutSocket } = useContext(SocketContext);
  const {
    currentUser,
    setCurrentUser,
    currentUserInfo,
    setCurrentUserInfo,
    primaryColor,
    secondaryColor,
    darkMode,
    setPrimaryColor,
    setSecondaryColor,
    setDarkMode,
    isMobile,
  } = useContext(CurrentUser);
  const { messageState } = useGlobalContext();

  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [chatListOpen, setChatListOpen] = useState(false);
  const [anchorNotifi, setAnchorNotifi] = useState(null);
  const [settingsAnchorNotifi, setSettingsAnchorNotifi] = useState(null);
  const [isOpenNotification, setIsOpenNotification] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();

  // Xử lý logout
  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("darkMode");
    sessionStorage.removeItem("themeColor");
    sessionStorage.removeItem("themeSecondary");
    LogoutSocket(currentUserInfo?.email);
    logout();
    navigate("/login");
  }, [navigate]);

  // Xử lý mở/đóng menu
  const handleMenuOpen = (setter) => (event) => setter(event.currentTarget);
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSettingsAnchorEl(null);
  };
  // Xử lý mở/đóng Notifi
  const handleNotifiOpen = (setter) => (event) => setter(event.currentTarget);
  const handleCloseNotifi = () => {
    setAnchorNotifi(null);
    setSettingsAnchorNotifi(null);
  };
  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={1}
      sx={{
        padding: 1,
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Sidebar Mobile */}
        {isMobile && (
          <>
            <IconButton
              color="primary"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <ListAlt fontSize="large" />
            </IconButton>
            {sidebarOpen && (
              // <SidebarMobile close={() => setSidebarOpen(false)} />
              <></>
            )}
          </>
        )}

        {/* Logo */}
        <Link to="/home" style={{ textDecoration: "none" }}>
          <Typography
            variant="h5"
            color={theme.palette.primary.main}
            sx={{ display: "flex", alignItems: "center", fontWeight: "bold" }}
          >
            <IconButton color="primary">
              <HomeIcon fontSize="large" />
            </IconButton>
            {!isMobile && "Sociala"}
          </Typography>
        </Link>

        {/* Search */}
        {!isMobile && <SearchComponent />}

        {/* Icon Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => setChatListOpen(!chatListOpen)}>
            <MessageIcon fontSize="large" />
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ position: "absolute", top: 0, right: 0 }}
            >
              {messageState.unreadMessages.length}
            </Typography>
          </IconButton>
          {/* handleNotifiOpen(setSettingsAnchorNotifi) */}
          <IconButton onClick={() => setIsOpenNotification((prev) => !prev)}>
            <NotificationsIcon fontSize="large" />
          </IconButton>
          {isOpenNotification && <NotificationDemo open={isOpenNotification} />}
          {Boolean(settingsAnchorNotifi) && <NotificationPanel />}

          {!isMobile && (
            <IconButton onClick={handleMenuOpen(setSettingsAnchorEl)}>
              <SettingsIcon fontSize="large" />
            </IconButton>
          )}

          {/* Settings Menu */}
          <Menu
            anchorEl={settingsAnchorEl}
            open={Boolean(settingsAnchorEl)}
            onClose={handleCloseMenu}
            sx={{
              mt: 6,
              "& .MuiMenu-paper": {
                backgroundColor: theme?.palette?.background?.paper,
                boxShadow: 6,
              },
            }}
          >
            <ThemeSettings
              themeColor={primaryColor}
              setThemeColor={setPrimaryColor}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              themeSecondary={secondaryColor}
              setThemeSecondary={setSecondaryColor}
            />
          </Menu>

          {/* Avatar & Logout */}
          <IconButton>
            <Avatar src={currentUserInfo?.avatar} />
          </IconButton>
          <IconButton onClick={handleLogout}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>
      {chatListOpen && <ChatList />}
    </AppBar>
  );
};

export default Header;
