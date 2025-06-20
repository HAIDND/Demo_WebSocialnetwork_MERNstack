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
  likePost,
  unLikePost,
} from "~/services/postServices/postService";
import { CurrentUser } from "~/context/GlobalContext";
import EditPostDialog from "./EditPostDialog";
import CommentList from "~/pages/NewFeed/Comment";
import PostItem from "~/components/Elements/Post/PostItem";
import { getNewsfeedSuggest } from "~/services/RecommendServices/NewsfeedSuggest";

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
  const [showComments, setShowComments] = useState({});
  const [postList, setPostList] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const { currentUser, setCurrentUser, currentUserInfo, setCurrentUserInfo } =
    useContext(CurrentUser);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPost();
        const recommend = await getNewsfeedSuggest();

        console.log("recommend", recommend);
        console.log("Danh sách bài post:", data);
        const mergedUniquePosts = [...recommend, ...data].reduce(
          (acc, current) => {
            // Kiểm tra nếu _id đã tồn tại trong acc thì bỏ qua
            if (!acc.find((item) => item._id === current._id)) {
              acc.push(current);
            }
            return acc;
          },
          []
        );
        console.log("mergedUniquePosts", mergedUniquePosts);
        setPostList(mergedUniquePosts);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bài post:", error);
      }
    })();
  }, [currentUser]);

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
      setPostList((prevList) =>
        prevList.map((post) =>
          post._id === postId ? { ...post, likes: data.likes } : post
        )
      );

      // If already liked, un-like
      if (data.message === "You already liked this post") {
        await unLikePost({ postId }, currentUser?.token);
      }

      // Re-fetch the updated list of posts after the like/unlike action
      const updatedData = await getPost(currentUser?.userId);
      setPostList(updatedData);
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
    <>
      {postList.map((item, index) => (
        <Fade in={true} timeout={300 + index * 100} key={item._id}>
          <StyledCard>
            <CardHeader
              avatar={<StyledAvatar src={item?.userId?.avatar} />}
              title={
                <GradientText variant="h6">
                  {item?.userId?.username}
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
                    {item?.createdAt}
                  </Typography>
                  <VisibilityChip
                    icon={getVisibilityIcon(item?.visibility)}
                    label={item?.visibility}
                    size="small"
                    visibility={item?.visibility}
                  />
                </Box>
              }
              action={
                item?.userId?._id === currentUser?.userId && (
                  <Zoom in={true} timeout={500}>
                    <StyledIconButton
                      size="small"
                      onClick={(event) =>
                        handleMenuOpen(
                          event,
                          item._id,
                          item.content,
                          item.image
                        )
                      }
                    >
                      <Settings />
                    </StyledIconButton>
                  </Zoom>
                )
              }
            />

            {open && selectedPostId === item._id && (
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
                {item.content}
              </Typography>

              {item?.location && (
                <LocationBox
                  onClick={() =>
                    handleLocationClick(item.location, item.coordinates)
                  }
                >
                  <LocationOn fontSize="small" color="primary" />
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{ fontWeight: 500 }}
                  >
                    {item.location}
                  </Typography>
                </LocationBox>
              )}
            </CardContent>

            <StyledDivider />

            {item?.images && item.images.length > 0 && (
              <ImageGrid imageCount={item.images.length}>
                {item.images.slice(0, 4).map((image, imageIndex) => (
                  <Box
                    key={image._id || imageIndex}
                    sx={{
                      position: "relative",
                      gridColumn:
                        item.images.length === 3 && imageIndex === 2
                          ? "1 / -1"
                          : item.images.length > 3 && imageIndex === 3
                          ? "2 / 3"
                          : "auto",
                      gridRow:
                        item.images.length > 3 && imageIndex === 3
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
                        height: item.images.length === 1 ? 400 : 200,
                        objectFit: "cover",
                        borderRadius: 3,
                      }}
                    />
                    {imageIndex === 3 && item.images.length > 4 && (
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
                        +{item.images.length - 4} more
                      </Box>
                    )}
                  </Box>
                ))}
              </ImageGrid>
            )}

            <CardActions disableSpacing sx={{ px: 2, pb: 2 }}>
              <LikeButton
                onClick={() => likePosts(item._id)}
                isLiked={item?.likes?.includes(currentUser?.userId)}
              >
                {item?.likes?.includes(currentUser?.userId) ? (
                  <Favorite color="error" />
                ) : (
                  <FavoriteBorder />
                )}
              </LikeButton>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: item?.likes?.includes(currentUser?.userId)
                    ? "error.main"
                    : "text.secondary",
                }}
              >
                {item?.likes?.length || 0} Likes
              </Typography>

              <StyledIconButton onClick={() => handleShowComments(item._id)}>
                <ChatBubbleOutline />
              </StyledIconButton>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "text.secondary" }}
              >
                {item?.comments?.length || 0} Comments
              </Typography>
            </CardActions>

            <Slide
              in={showComments[item?._id]}
              direction="up"
              mountOnEnter
              unmountOnExit
            >
              <Box>
                {showComments[item?._id] && (
                  <CommentList
                    currentUserID={currentUser?.userId}
                    comments={item?.comments || []}
                    postID={item._id}
                    setPostList={setPostList}
                  />
                )}
              </Box>
            </Slide>
          </StyledCard>
        </Fade>
      ))}

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
    </>
  );
}

const newPostStyle = ({}) => {
  return (
    <Box>
      {postList.map((post, index) => (
        <div
          key={post._id}
          // ref={index === postList.length - 1 ? lastPostElementRef : null}
        >
          <PostItem
            post={post}
            isOwner={post.userId._id === currentUserInfo.userId}
          />
        </div>
      ))}
      {/* 
          {loading && (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          )}

          {!hasMore && posts.length > 0 && (
            <Typography align="center" color="text.secondary" sx={{ p: 2 }}>
              Đã tải hết tất cả bài đăng
            </Typography>
          )} */}
    </Box>
  );
};

const OldPost = ({ postList }) => {
  return (
    <Box>
      {postList.map((item) => (
        <Card
          key={item._id}
          sx={{
            maxWidth: 800,
            margin: "auto",
            mt: 3,
            bgcolor: "background.paper",
            border: "1px solid #ddd",
            borderRadius: 2,
            boxShadow: 1,
            p: 2,
            mb: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <CardHeader
            avatar={<Avatar src={item?.userId?.avatar} />}
            title={item?.userId?.username}
            subheader={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <span>{item?.createdAt}</span>
                {item?.visibility === "public" && <Public fontSize="small" />}
                {item?.visibility === "private" && <Lock fontSize="small" />}
                {item?.visibility === "friends" && <People fontSize="small" />}
              </Box>
            }
            action={
              item?.userId?._id === currentUser?.userId && (
                <IconButton
                  size="small"
                  onClick={(event) =>
                    handleMenuOpen(event, item._id, item.content, item.image)
                  }
                >
                  <Settings />
                </IconButton>
              )
            }
          />

          {open && selectedPostId === item._id && (
            <EditPostDialog
              open={open}
              onClose={handleCloseDialog}
              postId={selectedPostId}
              postContent={selectedPostContent}
              postImage={selectedPostImage}
              setPostList={setPostList}
            />
          )}
          <Divider />

          <CardContent>
            <Typography variant="body2">{item.content}</Typography>
          </CardContent>
          <Divider />
          {item?.images.map((image) => (
            <CardMedia
              key={image.url}
              component="img"
              image={image?.url}
              alt="Post Image"
            />
          ))}

          <CardActions disableSpacing>
            <IconButton onClick={() => likePosts(item._id)}>
              <Favorite
                color={
                  item?.likes?.includes(currentUser?.userId)
                    ? "error"
                    : "inherit"
                }
              />
            </IconButton>
            <Typography variant="body2">
              {item?.likes?.length || 0} Likes
            </Typography>

            <IconButton onClick={() => handleShowComments(item._id)}>
              <Comment />
            </IconButton>
            <Typography variant="body2">
              {item?.comments?.length || 0} Comments
            </Typography>
          </CardActions>

          {showComments[item?._id] && (
            <CommentList
              currentUserID={currentUser?.userId}
              comments={item?.comments || []}
              postID={item._id}
              setPostList={setPostList}
            />
          )}
        </Card>
      ))}
    </Box>
  );
};
