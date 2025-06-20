import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  IconButton,
  Typography,
  useTheme,
  Box,
  useMediaQuery,
} from "@mui/material";

import GroupsIcon from "@mui/icons-material/Groups";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
// import ChatIcon from "@mui/icons-material/Chat";

const GroupPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const cardItems = [
    { id: 1, name: "Create Group", icon: <AddIcon />, path: "/groups/create" },
    { id: 2, name: "My Group", icon: <GroupsIcon />, path: "/groups/mygroup" },
    {
      id: 3,
      name: "Explore Group",
      icon: <SearchIcon />,
      path: "/groups/explore",
    },
    // { id: 4, name: "Chat Group", icon: <ChatIcon />, path: "/groups/chat" },
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <Grid container>
      {/* Sidebar placeholder (ẩn trên mobile) */}
      <Grid
        item
        flex={2}
        display={{ xs: "none", md: "block" }}
        sx={{ minHeight: "100vh" }}
      ></Grid>

      {/* Content */}
      <Grid
        item
        flex={8}
        container
        spacing={4}
        justifyContent="center"
        sx={{ px: isMobile ? 2 : 10, mt: 12, mb: 6 }}
      >
        {cardItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card
              onClick={() => handleCardClick(item.path)}
              sx={{
                height: 180,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                borderRadius: 4,
                transition: "all 0.3s ease-in-out",
                boxShadow: 2,
                backgroundColor: theme.palette.background.paper,
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <IconButton
                  size="large"
                  sx={{
                    backgroundColor: theme.palette.primary.light,
                    // color: theme.palette.primary.main,
                    color: "#1976d2",
                    //backgroundColor: "#e3f2fd",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main,
                      color: "#fff",
                    },
                  }}
                >
                  {item.icon}
                </IconButton>
                <Typography variant="h6" fontWeight="600">
                  {item.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default GroupPage;
