import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Rating,
  useTheme,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getRecommendCollaborate } from "~/utils/RecommendAPI";
function RecommendExtension() {
  const [recommendations, setRecommendations] = useState([]);
  const theme = useTheme(); // Truy cập theme
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await getRecommendCollaborate();
        if (res) {
          console.log("effect mounted data loca", res);
          const data = res.recommendations.filter((i) => i.locationInfo);
          setRecommendations(data);
        } else {
          console.log("No list friend");
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      }
    };

    fetchRecommendations();
  }, []);
  if (recommendations.length < 1) return null;
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
      <Typography variant="h5" sx={{ textAlign: "center" }} color="primary">
        Travel recommendations
      </Typography>

      <List>
        {recommendations.map((item, index) => (
          <RecommendationItem key={index} item={item} />
        ))}
      </List>
    </Box>
  );
}
export default RecommendExtension;
function RecommendationItem({ item }) {
  const navigate = useNavigate();
  const handleItemClick = (item) => {
    navigate("/recommendpage", { state: { item } });
  };
  return (
    <ListItem
      sx={{
        display: "flex",
        alignItems: "flex-start",
        cursor: "pointer",
      }}
      onClick={() => handleItemClick(item)}
    >
      <ListItemAvatar>
        <Avatar
          alt={item?.locationInfo?.imageUrl}
          src={item?.locationInfo?.imageUrl}
          sx={{ width: 60, height: 60, mr: 2 }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography fontWeight="bold">{item?.locationInfo?.name}</Typography>
        }
        secondary={
          <>
            <Rating
              value={parseFloat(item?.locationInfo?.rating)}
              precision={0.1}
              readOnly
              size="small"
            />
            <Typography
              variant="body2"
              sx={{ display: "block", mt: 0.5 }}
              color="text.secondary"
            >
              {item?.locationInfo?.description.slice(0, 90)}...
            </Typography>
          </>
        }
      />
    </ListItem>
  );
}
