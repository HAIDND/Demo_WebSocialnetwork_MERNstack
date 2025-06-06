import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  TextField,
  Box,
  Grid,
  Rating,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRecommend } from "./RecommendContext";
import RatingInLocation from "./RatingInLocation";
import RatingLocation from "./RatingLocation";
import { getRatingInLocation } from "./RecommendService";
import { useLocation } from "react-router-dom";
import { getRecommendContent } from "~/utils/RecommendAPI";

export default function CurrentPlace() {
  const { state, dispatch } = useRecommend();
  const [isShowRatings, setShowRatings] = useState(false);
  const [currentRating, setCurrentRating] = useState();
  const location = useLocation();
  const item = location.state?.item?.locationInfo;
  console.log(item);

  function handleShowRatings() {
    setShowRatings(!isShowRatings);
  }
  useEffect(() => {
    const fetchItem = async () => {
      if (item) {
        const data = await getRecommendContent(item?.id);
        dispatch({
          type: "recommend/clickLocation",
          payload: { current: item, recommendContent: data?.recommendations },
        });
      }
    };
    fetchItem();
    setShowRatings(false);
  }, [state.currentPlace, item]);
  if (!state.currentPlace) return <></>;

  const rating =
    typeof state.currentPlace.rating === "string"
      ? state.currentPlace.rating.replace("/5", "")
      : state.currentPlace.rating;

  return (
    <>
      <Card sx={{ width: "100%", m: 2, borderRadius: 3, boxShadow: 4 }}>
        <CardMedia
          component="img"
          height="400"
          image={state.currentPlace.imageUrl}
          alt={state.currentPlace.name}
        />
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {state.currentPlace.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {state.currentPlace.description}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Location: {state.currentPlace.name}
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              <Rating
                name="read-only"
                value={rating}
                precision={0.1}
                readOnly
                size="small"
              />
              {rating}
            </Typography>
            <RatingLocation />
          </Box>

          {isShowRatings && (
            <Box px={2} pb={2} sx={{ maxHeight: 300, overflowY: "auto" }}>
              <RatingInLocation />
            </Box>
          )}

          <Button
            variant="outlined"
            color="primary"
            onClick={handleShowRatings}
            sx={{ mt: 2 }}
          >
            {isShowRatings ? "Hide rating" : "Show rating"}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
