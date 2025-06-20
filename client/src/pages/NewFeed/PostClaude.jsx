import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  Menu,
  MenuItem,
  Box,
  CircularProgress,
  Typography,
  Alert,
} from "@mui/material";

import { CurrentUser } from "~/context/GlobalContext";
import { useNewsFeed } from "./NewsFeedContext";
import { likePost, unLikePost } from "~/services/postServices/postService";

import EditPostDialog from "./EditPostDialog";
import PostItem from "~/components/Elements/Post/PostItem";

export default function Post({ visibility }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedPostImage, setSelectedPostImage] = useState("");
  const [selectedPostContent, setSelectedPostContent] = useState("");
  const [open, setOpen] = useState(false);

  const { currentUser, currentUserInfo } = useContext(CurrentUser);

  const {
    posts,
    loading,
    hasMore,
    error,
    loadMorePosts,
    updatePostLikes,
    refreshPosts,
  } = useNewsFeed();

  // Ref cho infinite scroll
  const lastPostElementRef = useRef();
  const observer = useRef();

  // Infinite scroll observer
  const lastPostCallbackRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMorePosts]
  );

  // Like/Unlike post
  const likePosts = async (postId) => {
    try {
      const data = await likePost({ postId }, currentUser?.token);

      if (data.message === "You already liked this post") {
        // Nếu đã like thì unlike
        const unlikeData = await unLikePost({ postId }, currentUser?.token);
        updatePostLikes(postId, unlikeData.likes);
      } else {
        // Nếu chưa like thì like
        updatePostLikes(postId, data.likes);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // Menu handlers
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

  // Refresh posts when user changes
  useEffect(() => {
    if (currentUser?.userId) {
      refreshPosts();
    }
  }, [currentUser?.userId, refreshPosts]);

  // Error display
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" onClose={() => refreshPosts()}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <Box>
        {posts.map((post, index) => (
          <div
            key={post._id}
            ref={index === posts.length - 1 ? lastPostCallbackRef : null}
          >
            <PostItem
              post={post}
              isOwner={post.userId._id === currentUserInfo?.userId}
              onLike={() => likePosts(post._id)}
              onMenuOpen={(event) =>
                handleMenuOpen(event, post._id, post.content, post.image)
              }
            />
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        )}

        {/* End of posts message */}
        {!hasMore && posts.length > 0 && !loading && (
          <Typography align="center" color="text.secondary" sx={{ p: 2 }}>
            Đã tải hết tất cả bài đăng
          </Typography>
        )}

        {/* No posts message */}
        {!loading && posts.length === 0 && (
          <Typography align="center" color="text.secondary" sx={{ p: 4 }}>
            Chưa có bài đăng nào
          </Typography>
        )}
      </Box>

      {/* Menu for post actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => setOpen(true)}>Update</MenuItem>
      </Menu>

      {/* Edit Post Dialog */}
      {open && selectedPostId && (
        <EditPostDialog
          open={open}
          onClose={handleCloseDialog}
          postId={selectedPostId}
          postContent={selectedPostContent}
          postImage={selectedPostImage}
        />
      )}
    </>
  );
}
