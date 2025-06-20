import React from "react";
import { Link, Route, Router } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import GroupsIcon from "@mui/icons-material/Groups";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ChatIcon from "@mui/icons-material/Chat";
import {
  Grid,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";

import { Padding } from "@mui/icons-material";
import CreateGroup from "./CreateGroup";

function GroupPage() {
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

  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path);
  };
  return (
    <>
      <Grid container>
        <Grid
          item
          flex={2}
          sx={{ overflow: "auto" }}
          display={{ xs: "none", md: "block" }}
        ></Grid>
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
        </Grid>
      </Grid>
    </>
  );
}

export default GroupPage;
