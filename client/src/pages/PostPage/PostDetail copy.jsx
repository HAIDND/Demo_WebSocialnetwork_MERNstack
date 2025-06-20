import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  Divider,
  Button,
  List,
  TextField,
  Paper,
  MenuItem,
  Menu,
  ListItem,
  ListItemText,
  Box,
  CircularProgress,
  Chip,
  Fade,
  Zoom,
  Slide,
  Grid,
} from "@mui/material";
import {
  Settings,
  Favorite,
  Comment,
  Public,
  Lock,
  People,
  FavoriteBorder,
  ChatBubbleOutline,
} from "@mui/icons-material";
import { LocationOn } from "@mui/icons-material";
import { styled, keyframes } from "@mui/material/styles";

import {
  createComment,
  deleteComment,
  editComment,
  getPost,
  getPostById,
  likePost,
  unLikePost,
} from "~/services/postServices/postService";
import { CurrentUser } from "~/context/GlobalContext";
import EditPostDialog from "../NewFeed/EditPostDialog";
import CommentList from "~/pages/NewFeed/Comment";
import PostItem from "~/components/Elements/Post/PostItem";
import { useParams } from "react-router-dom";

// Animated gradient background keyframes
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Floating animation
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Pulse animation for like button
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 800,
  margin: "auto",
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 16,
  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.1)`,
  padding: theme.spacing(2),
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 12px 40px rgba(0, 0, 0, 0.15)`,
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
    backgroundSize: "200% 100%",
    animation: `${gradientShift} 3s ease infinite`,
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  border: `3px solid ${theme.palette.primary.main}`,
  boxShadow: `0 4px 12px rgba(0, 0, 0, 0.15)`,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.1)",
    animation: `${float} 2s ease-in-out infinite`,
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1),
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.secondary.light}20)`,
    transform: "scale(1.1)",
  },
}));

const LikeButton = styled(IconButton)(({ theme, isLiked }) => ({
  borderRadius: 12,
  padding: theme.spacing(1),
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  background: isLiked
    ? `linear-gradient(135deg, ${theme.palette.error.light}20, ${theme.palette.error.main}20)`
    : "transparent",
  "&:hover": {
    background: isLiked
      ? `linear-gradient(135deg, ${theme.palette.error.light}30, ${theme.palette.error.main}30)`
      : `linear-gradient(135deg, ${theme.palette.error.light}10, ${theme.palette.error.main}10)`,
    transform: "scale(1.1)",
  },
  "&:active": {
    animation: `${pulse} 0.3s ease`,
  },
}));

const VisibilityChip = styled(Chip)(({ theme, visibility }) => ({
  fontSize: "0.75rem",
  height: 24,
  background:
    visibility === "public"
      ? `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main})`
      : visibility === "private"
      ? `linear-gradient(135deg, ${theme.palette.error.light}, ${theme.palette.error.main})`
      : `linear-gradient(135deg, ${theme.palette.warning.light}, ${theme.palette.warning.main})`,
  color: "white",
  fontWeight: 600,
  "& .MuiChip-icon": {
    color: "white",
  },
}));

const LocationBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
  cursor: "pointer",
  padding: theme.spacing(0.5, 1),
  borderRadius: 8,
  transition: "all 0.3s ease",
  "&:hover": {
    background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.secondary.light}20)`,
    transform: "translateX(4px)",
  },
}));

const ImageGrid = styled(Box)(({ imageCount }) => ({
  display: "grid",
  gap: 8,
  padding: 8,
  gridTemplateColumns:
    imageCount === 1
      ? "1fr"
      : imageCount === 2
      ? "1fr 1fr"
      : imageCount === 3
      ? "1fr 1fr 1fr"
      : "1fr 1fr",
  "& img": {
    borderRadius: 12,
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "scale(1.02)",
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
    },
  },
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}40, transparent)`,
  height: 2,
  borderRadius: 1,
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  fontWeight: 600,
}));

export default function Post({ visibility }) {
  const { postId } = useParams();
  const [showComments, setShowComments] = useState({});
  const [currentPost, setPostList] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const { currentUser, setCurrentUser, currentUserInfo, setCurrentUserInfo } =
    useContext(CurrentUser);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPostById(postId);
        console.log("Danh sách bài post:", data);
        const posts = data.posts || [];
        setPostList(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bài post:", error);
      }
    })();
  }, [currentUser, postId]);

  const likePosts = async (postId) => {
    try {
      // Optimistic update
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });

      const data = await likePost({ postId }, currentUser?.token);

      // If already liked, un-like
      if (data.message === "You already liked this post") {
        await unLikePost({ postId }, currentUser?.token);
      }
      const updatedData = await getPostById(postId);
      setPostList(updatedData);
      // Re-fetch the updated list of posts after the like/unlike action
      //   const updatedData = await getPost(currentUser?.userId);
      //   setPostList(updatedData);
    } catch (error) {
      console.error("Error liking post:", error);
      // Revert optimistic update on error
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });
    }
  };

  const [selectedPostImage, setSelectedPostImage] = useState("");
  const [selectedPostContent, setSelectedPostContent] = useState("");

  const handleMenuOpen = (event, postId, postContent, postImage) => {
    setAnchorEl(event.currentTarget);
    setSelectedPostId(postId);
    setSelectedPostContent(postContent);
    setSelectedPostImage(postImage);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPostId(null);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setAnchorEl(null);
    setSelectedPostId(null);
  };

  const [open, setOpen] = useState(false);

  const handleShowComments = (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleLocationClick = (location, coordinates) => {
    if (coordinates && coordinates.lat && coordinates.lng) {
      const googleMapsUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
      window.open(googleMapsUrl, "_blank");
    } else if (location) {
      const encodedLocation = encodeURIComponent(location);
      const googleMapsSearchUrl = `https://www.google.com/maps/search/${encodedLocation}`;
      window.open(googleMapsSearchUrl, "_blank");
    }
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case "public":
        return <Public fontSize="small" />;
      case "private":
        return <Lock fontSize="small" />;
      case "friends":
        return <People fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Grid container>
      <Grid
        item
        flex={2}
        sx={{ overflow: "auto" }}
        display={{ xs: "none", md: "block" }}
      ></Grid>
      <Grid
        item
        flex={8}
        sx={{ overflow: "auto", mt: 12 }}
        display={{ xs: "none", md: "block" }}
      >
        <Box>
          <Fade in={true} timeout={300}>
            <StyledCard>
              <CardHeader
                avatar={<StyledAvatar src={currentPost?.userId?.avatar} />}
                title={
                  <GradientText variant="h6">
                    {currentPost?.userId?.username}
                  </GradientText>
                }
                subheader={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {currentPost?.createdAt}
                    </Typography>
                    <VisibilityChip
                      icon={getVisibilityIcon(currentPost?.visibility)}
                      label={currentPost?.visibility}
                      size="small"
                      visibility={currentPost?.visibility}
                    />
                  </Box>
                }
                action={
                  currentPost?.userId?._id === currentUser?.userId && (
                    <Zoom in={true} timeout={500}>
                      <StyledIconButton
                        size="small"
                        onClick={(event) =>
                          handleMenuOpen(
                            event,
                            currentPost._id,
                            currentPost.content,
                            currentPost.image
                          )
                        }
                      >
                        <Settings />
                      </StyledIconButton>
                    </Zoom>
                  )
                }
              />

              {open && selectedPostId === currentPost._id && (
                <EditPostDialog
                  open={open}
                  onClose={handleCloseDialog}
                  postId={selectedPostId}
                  postContent={selectedPostContent}
                  postImage={selectedPostImage}
                  setPostList={setPostList}
                />
              )}

              <StyledDivider />

              <CardContent>
                <Typography variant="body1" sx={{ lineHeight: 1.6, mb: 1 }}>
                  {currentPost.content}
                </Typography>

                {currentPost?.location && (
                  <LocationBox
                    onClick={() =>
                      handleLocationClick(
                        currentPost.location,
                        currentPost.coordinates
                      )
                    }
                  >
                    <LocationOn fontSize="small" color="primary" />
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{ fontWeight: 500 }}
                    >
                      {currentPost.location}
                    </Typography>
                  </LocationBox>
                )}
              </CardContent>

              <StyledDivider />

              {currentPost?.images && currentPost.images.length > 0 && (
                <ImageGrid imageCount={currentPost.images.length}>
                  {currentPost.images.slice(0, 4).map((image, imageIndex) => (
                    <Box
                      key={image._id || imageIndex}
                      sx={{
                        position: "relative",
                        gridColumn:
                          currentPost.images.length === 3 && imageIndex === 2
                            ? "1 / -1"
                            : currentPost.images.length > 3 && imageIndex === 3
                            ? "2 / 3"
                            : "auto",
                        gridRow:
                          currentPost.images.length > 3 && imageIndex === 3
                            ? "2 / 3"
                            : "auto",
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={image?.url}
                        alt={`Post Image ${imageIndex + 1}`}
                        sx={{
                          width: "100%",
                          height: currentPost.images.length === 1 ? 400 : 200,
                          objectFit: "cover",
                          borderRadius: 3,
                        }}
                      />
                      {imageIndex === 3 && currentPost.images.length > 4 && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                              "linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 3,
                            color: "white",
                            fontSize: "1.2rem",
                            fontWeight: "bold",
                          }}
                        >
                          +{currentPost.images.length - 4} more
                        </Box>
                      )}
                    </Box>
                  ))}
                </ImageGrid>
              )}

              <CardActions disableSpacing sx={{ px: 2, pb: 2 }}>
                <LikeButton
                  onClick={() => likePosts(currentPost._id)}
                  isLiked={currentPost?.likes?.includes(currentUser?.userId)}
                >
                  {currentPost?.likes?.includes(currentUser?.userId) ? (
                    <Favorite color="error" />
                  ) : (
                    <FavoriteBorder />
                  )}
                </LikeButton>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: currentPost?.likes?.includes(currentUser?.userId)
                      ? "error.main"
                      : "text.secondary",
                  }}
                >
                  {currentPost?.likes?.length || 0} Likes
                </Typography>

                <StyledIconButton
                  onClick={() => handleShowComments(currentPost._id)}
                >
                  <ChatBubbleOutline />
                </StyledIconButton>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "text.secondary" }}
                >
                  {currentPost?.comments?.length || 0} Comments
                </Typography>
              </CardActions>

              <Slide
                in={showComments[currentPost?._id]}
                direction="up"
                mountOnEnter
                unmountOnExit
              >
                <Box>
                  {showComments[currentPost?._id] && (
                    <CommentList
                      currentUserID={currentUser?.userId}
                      comments={currentPost?.comments || []}
                      postID={currentPost._id}
                      setPostList={setPostList}
                    />
                  )}
                </Box>
              </Slide>
            </StyledCard>
          </Fade>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              sx: {
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 2,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <MenuItem
              onClick={() => setOpen(true)}
              sx={{
                borderRadius: 1,
                mx: 0.5,
                "&:hover": {
                  background:
                    "linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(156, 39, 176, 0.1))",
                },
              }}
            >
              Update
            </MenuItem>
          </Menu>
        </Box>
      </Grid>
    </Grid>
  );
}
