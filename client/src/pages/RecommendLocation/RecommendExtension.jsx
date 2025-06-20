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
  useMediaQuery,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getRecommendCollaborate } from "~/utils/RecommendAPI";

function RecommendExtension() {
  const [recommendations, setRecommendations] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await getRecommendCollaborate();
        if (res) {
          const data = res.recommendations.filter((i) => i.locationInfo);
          setRecommendations(data);
        } else {
          console.log("No recommendations found");
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
        width: isMobile ? "100%" : 360,
        px: 2,
        py: 3,
        mx: "auto",
        backgroundColor: theme.palette.background.paper,
        borderRadius: 4,
        boxShadow: 4,
        mt: 4,
        mb: 4,
      }}
    >
      <Typography
        variant="h5"
        sx={{ textAlign: "center", fontWeight: 600 }}
        color="primary"
      >
        Travel Recommendations
      </Typography>

      <List disablePadding>
        {recommendations.map((item, index) => (
          <RecommendationItem key={index} item={item} />
        ))}
      </List>
    </Box>
  );
}

function RecommendationItem({ item }) {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleItemClick = () => {
    navigate("/recommendpage", { state: { item } });
  };

  const location = item?.locationInfo;

  return (
    <ListItem
      sx={{
        display: "flex",
        alignItems: "flex-start",
        cursor: "pointer",
        borderBottom: `1px solid ${theme.palette.divider}`,
        px: 1,
        py: 1.5,
        borderRadius: 1,
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
        },
      }}
      onClick={handleItemClick}
    >
      <ListItemAvatar>
        <Avatar
          alt={location?.name}
          src={location?.imageUrl}
          sx={{
            width: 60,
            height: 60,
            mr: 2,
            borderRadius: 2,
          }}
          variant="rounded"
        />
      </ListItemAvatar>

      <ListItemText
        primary={
          <Typography fontWeight="bold" fontSize="1rem">
            {location?.name}
          </Typography>
        }
        secondary={
          <>
            <Rating
              value={parseFloat(location?.rating || 0)}
              precision={0.1}
              readOnly
              size="small"
              sx={{ mt: 0.5 }}
            />
            <Typography variant="body2" sx={{ mt: 0.5 }} color="text.secondary">
              {location?.description
                ? location.description.slice(0, 90) + "..."
                : "No description available."}
            </Typography>
          </>
        }
        sx={{ ml: 1 }}
      />
    </ListItem>
  );
}

export default RecommendExtension;
