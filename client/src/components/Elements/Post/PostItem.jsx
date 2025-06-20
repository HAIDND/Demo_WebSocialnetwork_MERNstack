import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  TextField,
  Button,
  IconButton,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Divider,
  Paper,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  Collapse,
  Badge,
} from "@mui/material";
import {
  PhotoCamera,
  VideoCall,
  LocationOn,
  Public,
  People,
  Lock,
  Send,
  ThumbUp,
  Favorite,
  ThumbDown,
  EmojiEmotions,
  Star,
  Comment,
  Share,
  Settings,
  Close,
  Add,
  GpsFixed,
  Place,
} from "@mui/icons-material";

// Mock data và utilities
const mockUser = {
  id: 1,
  name: "Nguyễn Văn A",
  avatar:
    "https://ui-avatars.io/api/?name=Nguyen+Van+A&background=1976d2&color=fff",
};

const emotions = [
  { value: "happy", label: "😊 Vui vẻ", icon: "😊" },
  { value: "love", label: "😍 Yêu thích", icon: "😍" },
  { value: "sad", label: "😢 Buồn", icon: "😢" },
  { value: "angry", label: "😠 Tức giận", icon: "😠" },
  { value: "excited", label: "🤩 Hứng thú", icon: "🤩" },
];

const privacyOptions = [
  { value: "public", label: "Công khai", icon: <Public /> },
  { value: "friends", label: "Bạn bè", icon: <People /> },
  { value: "private", label: "Riêng tư", icon: <Lock /> },
];

const reactions = [
  { type: "like", icon: "👍", color: "#1976d2" },
  { type: "love", icon: "❤️", color: "#e91e63" },
  { type: "dislike", icon: "👎", color: "#757575" },
  { type: "wow", icon: "😮", color: "#ff9800" },
  { type: "perfect", icon: "⭐", color: "#4caf50" },
];
{
  /* <PostItem post={post} isOwner={post.user.id === mockUser.id} /> */
}
export default function PostItem({ post, isOwner }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentImage, setCommentImage] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [userReaction, setUserReaction] = useState(null);
  const commentInputRef = useRef();

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return "Vừa xong";
  };

  const handleReaction = (reactionType) => {
    setUserReaction(userReaction === reactionType ? null : reactionType);
  };

  // Hàm xử lý điều hướng đến bản đồ
  const handleLocationClick = (location, coordinates) => {
    // Nếu có tọa độ cụ thể (lat, lng)
    if (coordinates && coordinates.lat && coordinates.lng) {
      // Mở Google Maps với tọa độ
      const googleMapsUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
      window.open(googleMapsUrl, "_blank");
    } else if (location) {
      // Nếu chỉ có tên địa điểm, tìm kiếm trên Google Maps
      const encodedLocation = encodeURIComponent(location);
      const googleMapsSearchUrl = `https://www.google.com/maps/search/${encodedLocation}`;
      window.open(googleMapsSearchUrl, "_blank");
    }
  };

  // Hàm mở bản đồ trong modal (tùy chọn)
  const handleLocationClickInModal = (location, coordinates) => {
    // Có thể tích hợp với Google Maps API hoặc Leaflet
    // Ví dụ: mở một modal chứa bản đồ
    console.log("Opening map for:", location, coordinates);

    // Nếu muốn nhúng bản đồ trong ứng dụng thay vì mở tab mới
    // Có thể sử dụng Google Maps Embed API
    if (coordinates && coordinates.lat && coordinates.lng) {
      const embedUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${coordinates.lat},${coordinates.lng}`;
      // Mở modal với iframe chứa bản đồ
    }
  };

  const loadComments = async () => {
    setLoadingComments(true);
    // Simulate API call
    setTimeout(() => {
      const mockComments = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        user: {
          name: `User ${i + 1}`,
          avatar: `https://ui-avatars.io/api/?name=User+${
            i + 1
          }&background=random`,
        },
        content: `This is comment ${i + 1} for the post`,
        timestamp: new Date(
          Date.now() - Math.random() * 86400000
        ).toISOString(),
        image: i % 3 === 0 ? "https://picsum.photos/200/200?random=" + i : null,
      }));
      setComments(mockComments);
      setLoadingComments(false);
    }, 500);
  };

  const handleComment = () => {
    if (!newComment.trim() && !commentImage) return;

    const comment = {
      id: Date.now(),
      user: mockUser,
      content: newComment,
      timestamp: new Date().toISOString(),
      image: commentImage ? URL.createObjectURL(commentImage) : null,
    };

    setComments([comment, ...comments]);
    setNewComment("");
    setCommentImage(null);
  };

  const toggleComments = () => {
    if (!showComments && comments.length === 0) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  return (
    <Card sx={{ m: 2, borderRadius: 2, boxShadow: 4 }}>
      <CardContent>
        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Box display="flex" alignItems="center">
            <Avatar src={post?.userId?.avatar} sx={{ mr: 2 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {post?.userId?.username}
                {post?.emotion && (
                  <Chip
                    size="small"
                    label={post?.emotion.label}
                    sx={{ ml: 1, height: 20 }}
                  />
                )}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="caption" color="text.secondary">
                  {formatTimeAgo(post.updatedAt)}
                </Typography>
                {privacyOptions.find((p) => p.value === post.visibility)?.icon}

                {/* Location với khả năng click để mở bản đồ */}
                {post.location && (
                  <>
                    <LocationOn fontSize="small" />
                    <Typography
                      variant="caption"
                      sx={{
                        cursor: "pointer",
                        color: "primary.main",
                        textDecoration: "underline",
                        "&:hover": {
                          color: "primary.dark",
                        },
                      }}
                      onClick={() =>
                        handleLocationClick(post.location, post?.coordinates)
                      }
                      title="Click để xem trên bản đồ"
                    >
                      {post.location}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          </Box>
          {isOwner && (
            <IconButton size="small">
              <Settings />
            </IconButton>
          )}
        </Box>

        {/* Content */}
        {post.content && (
          <Typography variant="body1" sx={{ mb: 2 }}>
            {post.content}
          </Typography>
        )}

        {/* Media */}
        {post.images && post.images.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={1}>
              {post.images.length % 2
                ? post.images.map((file, index) => (
                    <>
                      <Grid
                        item
                        xs={post.images.length === 1 ? 12 : 6}
                        key={index}
                      >
                        {index === 1 ? (
                          <></>
                        ) : (
                          <img
                            src={file.url}
                            alt=""
                            style={{
                              width: "100%",
                              maxHeight: post.images.length === 1 ? 400 : 200,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                        )}
                      </Grid>
                      <Grid
                        item
                        xs={post.images.length === 1 ? 12 : 6}
                        key={index}
                      >
                        {index === 1 && (
                          <img
                            src={file.url}
                            controls
                            style={{
                              width: "100%",
                              maxHeight: post.images.length === 1 ? 400 : 400,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                        )}
                      </Grid>
                    </>
                  ))
                : post.images.map((file, index) => (
                    <Grid
                      item
                      xs={post.images.length === 1 ? 12 : 6}
                      key={index}
                    >
                      {file.type === "video" ? (
                        <video
                          src={file.url}
                          controls
                          style={{
                            width: "100%",
                            maxHeight: post.images.length === 1 ? 400 : 200,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      ) : (
                        <img
                          src={file.url}
                          alt=""
                          style={{
                            width: "100%",
                            maxHeight: post.images.length === 1 ? 400 : 200,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      )}
                    </Grid>
                  ))}
            </Grid>
          </Box>
        )}

        {/* Location Card - Hiển thị thông tin địa điểm chi tiết hơn */}
        {(post.location || post.coordinates) && (
          <Card
            sx={{
              mb: 2,
              cursor: "pointer",
              border: "1px solid",
              borderColor: "divider",
              "&:hover": {
                borderColor: "primary.main",
                boxShadow: 1,
              },
            }}
            onClick={() => handleLocationClick(post.location, post.coordinates)}
          >
            <CardContent sx={{ py: 1.5 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOn color="primary" />
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {post.location || "Vị trí được chia sẻ"}
                  </Typography>
                  {post?.coordinates && (
                    <Typography variant="caption" color="text.secondary">
                      {post.coordinates.lat.toFixed(6)},{" "}
                      {post.coordinates.lng.toFixed(6)}
                    </Typography>
                  )}
                </Box>
                <Box ml="auto">
                  <Typography variant="caption" color="text.secondary">
                    Xem trên bản đồ
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Reactions */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Box display="flex" gap={1}>
            {reactions.map((reaction) => (
              <Button
                key={reaction.type}
                size="small"
                variant={userReaction === reaction.type ? "contained" : "text"}
                onClick={() => handleReaction(reaction.type)}
                sx={{
                  minWidth: "auto",
                  color:
                    userReaction === reaction.type ? "white" : reaction.color,
                  bgcolor:
                    userReaction === reaction.type
                      ? reaction.color
                      : "transparent",
                }}
              >
                {reaction.icon}
              </Button>
            ))}
          </Box>
          <Box display="flex" gap={1}>
            <Button
              size="small"
              startIcon={<Comment />}
              onClick={toggleComments}
            >
              Bình luận ({post.commentsCount})
            </Button>
            <Button size="small" startIcon={<Share />}>
              Chia sẻ
            </Button>
            {/* Thêm nút xem bản đồ riêng */}
            {(post.location || post.coordinates) && (
              <Button
                size="small"
                startIcon={<LocationOn />}
                onClick={() =>
                  handleLocationClick(post.location, post?.coordinates)
                }
              >
                Bản đồ
              </Button>
            )}
          </Box>
        </Box>

        {/* Comments Section */}
        <Collapse in={showComments}>
          <Divider sx={{ mb: 2 }} />

          {/* Comment Input */}
          <Box display="flex" gap={1} mb={2}>
            <Avatar src={mockUser.avatar} size="small" />
            <Box flex={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="Viết bình luận..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                multiline
                maxRows={3}
              />
              {commentImage && (
                <Box mt={1}>
                  <img
                    src={URL.createObjectURL(commentImage)}
                    alt=""
                    style={{ maxWidth: 200, maxHeight: 150, borderRadius: 8 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setCommentImage(null)}
                  >
                    <Close />
                  </IconButton>
                </Box>
              )}
              <Box display="flex" justifyContent="space-between" mt={1}>
                <input
                  type="file"
                  ref={commentInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => setCommentImage(e.target.files[0])}
                />
                <Button
                  size="small"
                  startIcon={<PhotoCamera />}
                  onClick={() => commentInputRef.current?.click()}
                >
                  Ảnh
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleComment}
                  disabled={!newComment.trim() && !commentImage}
                >
                  Gửi
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Comments List */}
          {loadingComments ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : (
            <Box maxHeight={300} overflow="auto">
              {comments.map((comment) => (
                <Box key={comment.id} display="flex" gap={1} mb={2}>
                  <Avatar
                    src={comment.user.avatar}
                    sx={{ width: 32, height: 32 }}
                  />
                  <Box>
                    <Paper
                      sx={{ p: 1, border: "1px solid white", borderShadow: 1 }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        {comment.user.name}
                      </Typography>
                      <Typography variant="body2">{comment.content}</Typography>
                    </Paper>
                    {comment.image && (
                      <img
                        src={comment.image}
                        alt=""
                        style={{
                          maxWidth: 200,
                          maxHeight: 150,
                          borderRadius: 8,
                          marginTop: 8,
                        }}
                      />
                    )}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      {formatTimeAgo(comment.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
}
