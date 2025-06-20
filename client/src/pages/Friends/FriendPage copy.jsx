import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { Grid, Card, CardContent, IconButton, Typography } from "@mui/material";
import { People, PersonAdd, Explore } from "@mui/icons-material";

import Sidebar from "~/pages/DefaultLayout/Sidebar/index";
import FriendRequest from "./FriendRequest";
import FriendList from "./FriendList";
import ExploreFriend from "./ExploreFriend";

// Component chính
const FriendPage = () => {
  const cardItems = [
    { id: 1, name: "My Friends", path: "myfriend", icon: <People /> },
    { id: 2, name: "Request", path: "request", icon: <PersonAdd /> },
    {
      id: 3,
      name: "Explore Friends",
      path: "exploreFriend",
      icon: <Explore />,
    },
  ];

  //naviagte
  const navigate = useNavigate();
  const [path, setPath] = useState("");
  const handleCardClick = (path) => {
    setPath(path); // Chuyển hướng đến đường dẫn tương ứng
  };
  return (
    <Grid container>
      <Grid
        item
        flex={2}
        sx={{ overflow: "auto" }}
        display={{ xs: "none", md: "block" }}
      >
        <Sidebar />
      </Grid>
      <Grid
        item
        flex={5}
        sx={{ mt: 5, padding: 10, mr: 5 }}
        container
        spacing={3}
        justifyContent="center"
      >
        {cardItems.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.id}>
            <Card
              onClick={() => handleCardClick(item.path)}
              sx={{
                height: 200,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  transform: "scale(1.05)",
                  transition: "transform 0.2s",
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <IconButton
                  size="large"
                  sx={{
                    color: "#1976d2",
                    backgroundColor: "#e3f2fd",
                    marginBottom: 2,
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

        {path == "request" && <FriendRequest />}
        {path == "myfriend" && <FriendList />}
        {path == "exploreFriend" && <ExploreFriend />}
      </Grid>
    </Grid>
  );
};

export default FriendPage;
