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
} from "@mui/material";
import {
  Settings,
  Favorite,
  Comment,
  Public,
  Lock,
  People,
} from "@mui/icons-material";
import { LocationOn } from "@mui/icons-material";

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
export default function Post({ visibility }) {
  const [showComments, setShowComments] = useState({});
  const [postList, setPostList] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const { currentUser, setCurrentUser, currentUserInfo, setCurrentUserInfo } =
    useContext(CurrentUser);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPost();
        console.log("Danh sách bài post:", data);
        const posts = data.posts || [];
        setPostList(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bài post:", error);
      }
    })();
  }, [currentUser]);

  const likePosts = async (postId) => {
    try {
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
    }
  };

  const [selectedPostImage, setSelectedPostImage] = useState("");
  const [selectedPostContent, setSelectedPostContent] = useState("");
  const handleMenuOpen = (event, postId, postContent, postImage) => {
    setAnchorEl(event.currentTarget);
    setSelectedPostId(postId); // Lưu postId vào state
    setSelectedPostContent(postContent); // Lưu content
    setSelectedPostImage(postImage); // Lưu image
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPostId(null);
  };
  const handleCloseDialog = () => {
    setOpen(false);
    setAnchorEl(null);
    setSelectedPostId(null); // Đặt lại giá trị sau khi đóng
  };

  //updatye
  const [open, setOpen] = useState(false);

  const handleShowComments = (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };
  // Improved location click handler
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
  return (
    <>
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

            {/* Location display with click functionality */}
            {item?.location && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mt: 1,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                    borderRadius: 1,
                    padding: "4px",
                  },
                }}
                onClick={() =>
                  handleLocationClick(item.location, item.coordinates)
                }
              >
                <LocationOn fontSize="small" color="primary" />
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{
                    textDecoration: "underline",
                    "&:hover": {
                      textDecoration: "none",
                    },
                  }}
                >
                  {item.location}
                </Typography>
              </Box>
            )}
          </CardContent>
          <Divider />

          {/* Images display - maximum 4 images */}
          {item?.images && item.images.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gap: 1,
                p: 1,
                gridTemplateColumns:
                  item.images.length === 1
                    ? "1fr"
                    : item.images.length === 2
                    ? "1fr 1fr"
                    : item.images.length === 3
                    ? "1fr 1fr 1fr"
                    : "1fr 1fr",
              }}
            >
              {item.images.slice(0, 4).map((image, index) => (
                <Box
                  key={image._id || index}
                  sx={{
                    position: "relative",
                    gridColumn:
                      item.images.length === 3 && index === 2
                        ? "1 / -1"
                        : item.images.length > 3 && index === 3
                        ? "2 / 3"
                        : "auto",
                    gridRow:
                      item.images.length > 3 && index === 3 ? "2 / 3" : "auto",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={image?.url}
                    alt={`Post Image ${index + 1}`}
                    sx={{
                      width: "100%",
                      height: item.images.length === 1 ? 400 : 200,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                  {/* Show "+X more" overlay if there are more than 4 images */}
                  {index === 3 && item.images.length > 4 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 1,
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
            </Box>
          )}

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
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => setOpen(true)}>Update</MenuItem>
        {/* <MenuItem onClick={() => console.log("Delete Post")}>Delete</MenuItem> */}
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
  {
    postList.map((item) => (
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
          // textAlign: "center",
          mb: 2,
          // mt: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <CardHeader
          avatar={<Avatar src={item?.userId?.avatar} />}
          title={item?.userId?.username}
          // subheader={`${item?.createdAt} role  ${item?.visibility}`}
          subheader={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <span>{item?.createdAt}</span>
              {item?.visibility === "public" && <Public fontSize="small" />}
              {item?.visibility === "private" && <Lock fontSize="small" />}
              {item?.visibility === "friends" && <People fontSize="small" />}
              {/* <span>{item?.visibility}</span> */}
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
        {item?.images.map(
          (image) => (
            <CardMedia
              key={image.url}
              component="img"
              image={image?.url}
              alt="Post Image"
            />
          )
          // <CardMedia
          //   component="img"
          //   image={item?.images?.url}
          //   alt="Post Image"
          // />
        )}

        <CardActions disableSpacing>
          <IconButton onClick={() => likePosts(item._id)}>
            <Favorite
              color={
                item?.likes?.includes(currentUser?.userId) ? "error" : "inherit"
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
    ));
  }
};
