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
} from "@mui/material";
import { Settings, Favorite, Comment } from "@mui/icons-material";

import { CurrentUser } from "~/context/GlobalContext";
import {
  createComment,
  deleteComment,
  editComment,
  getPost,
  likePost,
  unLikePost,
} from "~/services/postServices/postService";

import EditPostDialog from "~/pages/NewFeed/EditPostDialog";
import CommentList from "~/pages/NewFeed/Comment";
export default function PostPrivate({ visibility }) {
  const [showComments, setShowComments] = useState({});
  const [postList, setPostList] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const { currentUser } = useContext(CurrentUser);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPost();
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

  console.log(postList);

  //updatye
  const [open, setOpen] = useState(false);

  const handleShowComments = (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };
  return (
    <>
      {postList
        .filter((item) => item?.visibility === "private")
        .map((item) => (
          <Card
            key={item._id}
            sx={{
              maxWidth: 800,
              margin: "auto",
              mt: 3,
              mb: 3,
              bgcolor: "background.paper",
            }}
          >
            <CardHeader
              avatar={<Avatar src={item?.userId?.avatar} />}
              title={item?.userId?.username}
              subheader={`${item?.createdAt} role  ${item?.visibility}`}
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

            {item?.image && (
              <CardMedia component="img" image={item?.image} alt="Post Image" />
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
                curentUserID={currentUser?.userId}
                comments={item?.comments || []}
                postID={item._id}
                setPostList={setPostList}
              />
            )}
          </Card>
        ))}{" "}
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
