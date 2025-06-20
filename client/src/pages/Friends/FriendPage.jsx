import React, { useState } from "react";
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
import { People, PersonAdd, Explore } from "@mui/icons-material";

import Sidebar from "~/pages/DefaultLayout/Sidebar/index";
import FriendRequest from "./FriendRequest";
import FriendList from "./FriendList";
import ExploreFriend from "./ExploreFriend";
import FriendSuggestionList from "~/components/RecommendNeo4j/FriendSuggestionList";

const FriendPage = () => {
  const cardItems = [
    { id: 1, name: "My Friends", path: "myfriend", icon: <People /> },
    { id: 2, name: "Requests", path: "request", icon: <PersonAdd /> },
    {
      id: 3,
      name: "Explore Friends",
      path: "exploreFriend",
      icon: <Explore />,
    },
  ];

  const [path, setPath] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleCardClick = (cardPath) => {
    setPath(cardPath);
  };

  return (
    <Grid container>
      {/* Sidebar (ẩn trên mobile) */}
      <Grid
        item
        flex={2}
        display={{ xs: "none", md: "block" }}
        sx={{ minHeight: "100vh", overflow: "auto" }}
      >
        <Sidebar />
      </Grid>

      {/* Content chính */}
      <Grid
        item
        flex={8}
        sx={{
          mt: 10,
          px: isMobile ? 2 : 10,
          mb: 5,
        }}
        container
        spacing={3}
        justifyContent="center"
      >
        {/* Card chọn chức năng */}
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
                boxShadow: path === item.path ? 6 : 2,
                transition: "all 0.3s ease-in-out",
                backgroundColor:
                  path === item.path
                    ? theme.palette.action.selected
                    : theme.palette.background.paper,
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
                    // backgroundColor: theme.palette.primary.light,
                    //color: theme.palette.primary.main,
                    color: "#1976d2",
                    backgroundColor: "#e3f2fd",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main,
                      color: "#fff",
                    },
                  }}
                >
                  {item.icon}
                </IconButton>
                <Typography
                  variant="h6"
                  fontWeight="600"
                  sx={{ color: theme.palette.text.primary }}
                >
                  {item.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Hiển thị content theo path */}
        <Grid item xs={12} mt={5}>
          {path === "request" && <FriendRequest />}
          {path === "myfriend" && <FriendList />}
          {path === "exploreFriend" && <ExploreFriend />}
          <FriendSuggestionList />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default FriendPage;
