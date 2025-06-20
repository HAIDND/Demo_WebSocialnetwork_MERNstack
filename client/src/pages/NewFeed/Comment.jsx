import React, { useContext, useState } from "react";
import {
  Paper,
  List,
  ListItem,
  Avatar,
  ListItemText,
  IconButton,
  Divider,
  Box,
  Typography,
  TextField,
  Button,
  Menu,
  MenuItem,
  Chip,
  Fade,
  Slide,
  InputAdornment,
} from "@mui/material";
import {
  Settings,
  Send,
  Edit,
  Delete,
  ChatBubbleOutline,
  AccessTime,
} from "@mui/icons-material";
import { styled, keyframes } from "@mui/material/styles";

import EditCommentPopup from "~/pages/NewFeed/EditCommentPopup";
import {
  createComment,
  deleteComment,
  editComment,
  getPost,
  getPostById,
} from "~/services/postServices/postService";
import { CurrentUser } from "~/context/GlobalContext";

// Animations
const slideIn = keyframes`
    from {
        transform: translateX(-20px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
`;

const glow = keyframes`
    0% { box-shadow: 0 0 5px rgba(25, 118, 210, 0.3); }
    50% { box-shadow: 0 0 20px rgba(25, 118, 210, 0.6); }
    100% { box-shadow: 0 0 5px rgba(25, 118, 210, 0.3); }
`;

const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
`;

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
  borderRadius: 16,
  padding: theme.spacing(3),
  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.1)`,
  border: `1px solid ${theme.palette.divider}`,
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: "16px 16px 0 0",
  },
}));

const CommentHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1, 0),
}));

const CommentListContainer = styled(Box)(({ theme }) => ({
  maxHeight: 300,
  overflowY: "auto",
  borderRadius: 12,
  padding: theme.spacing(1),
  background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, rgba(255, 255, 255, 0.8) 100%)`,
  border: `1px solid ${theme.palette.divider}`,
  position: "relative",
  "&::-webkit-scrollbar": {
    width: 6,
  },
  "&::-webkit-scrollbar-track": {
    background: theme.palette.grey[100],
    borderRadius: 3,
  },
  "&::-webkit-scrollbar-thumb": {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: 3,
    "&:hover": {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
    },
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: 12,
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1.5),
  background: "rgba(255, 255, 255, 0.7)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  animation: `${slideIn} 0.5s ease-out`,
  "&:hover": {
    background: "rgba(255, 255, 255, 0.9)",
    transform: "translateY(-2px)",
    boxShadow: `0 8px 25px rgba(0, 0, 0, 0.1)`,
  },
  "&:last-child": {
    marginBottom: 0,
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  border: `2px solid ${theme.palette.primary.main}`,
  boxShadow: `0 4px 12px rgba(0, 0, 0, 0.15)`,
  marginRight: theme.spacing(1.5),
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.1)",
    animation: `${pulse} 1s ease-in-out`,
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: 10,
  padding: theme.spacing(0.75),
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.secondary.light}20)`,
    transform: "scale(1.1)",
  },
}));

const CommentInputContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6))`,
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  backdropFilter: "blur(10px)",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    background: "rgba(255, 255, 255, 0.9)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "rgba(255, 255, 255, 1)",
    },
    "&.Mui-focused": {
      background: "rgba(255, 255, 255, 1)",
      animation: `${glow} 2s ease-in-out infinite`,
    },
    "& fieldset": {
      borderColor: theme.palette.divider,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1, 2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: "white",
  fontWeight: 600,
  textTransform: "none",
  boxShadow: `0 4px 15px rgba(0, 0, 0, 0.2)`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
    transform: "translateY(-2px)",
    boxShadow: `0 6px 20px rgba(0, 0, 0, 0.3)`,
  },
  "&:active": {
    transform: "translateY(0)",
  },
}));

const TimeChip = styled(Chip)(({ theme }) => ({
  height: 20,
  fontSize: "0.7rem",
  background: `linear-gradient(135deg, ${theme.palette.grey[200]}, ${theme.palette.grey[100]})`,
  color: theme.palette.text.secondary,
  "& .MuiChip-icon": {
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    minWidth: 140,
  },
  "& .MuiMenuItem-root": {
    borderRadius: 8,
    margin: theme.spacing(0.5),
    transition: "all 0.2s ease",
    "&:hover": {
      background: `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.secondary.light}15)`,
    },
  },
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(4),
  color: theme.palette.text.secondary,
  "& .MuiSvgIcon-root": {
    fontSize: "3rem",
    marginBottom: theme.spacing(1),
    opacity: 0.5,
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  fontWeight: 700,
}));

export default function CommentList({
  comments,
  postID,

  setPostList,
  isDetail = false,
}) {
  const { currentUser } = useContext(CurrentUser);
  console.log(currentUser);
  const curentUserID = currentUser.userId;
  const [newComment, setNewComment] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [open, setOpen] = useState(false);

  const handleOpen = async (id) => {
    await setSelectedCommentId(id);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleMenuOpen = (event, commentId) => {
    setAnchorEl(event.currentTarget);
    setSelectedCommentId(commentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCommentId(null);
  };

  const handleSendComment = () => {
    if (newComment.trim()) {
      handleAddComment(postID, newComment);
      setNewComment("");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendComment();
    }
  };

  const handleAddComment = async (postID, newComment) => {
    try {
      const data = await createComment({ postId: postID, comment: newComment });
      setPostList((prevList) =>
        prevList.map((post) =>
          post._id === postID ? { ...post, comments: data.comments } : post
        )
      );
      const updatedData = await getPost(curentUserID);
      setPostList(updatedData);
      if (isDetail) {
        const updatedData = await getPostById(postID);
        setPostList([updatedData]);
      }
    } catch (error) {
      console.error("Lỗi khi thêm comment:", error);
    }
  };

  const handleDeleteComment = async (postID, commentId) => {
    try {
      const data = await deleteComment(postID, commentId);
      if (!data.error) {
        const updatedData = await getPost(curentUserID);
        setPostList(updatedData);
      } else {
        console.error("Error deleting comment:", data.message);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleEditComment = async (commentId, postID, updatedComment) => {
    try {
      const data = await editComment({
        commentId: commentId,
        postId: postID,
        comment: updatedComment,
      });
      if (!data.error) {
        const updatedData = await getPost(curentUserID);
        setPostList(updatedData);
      } else {
        console.error("Error editing comment:", data.message);
      }
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  return (
    <Fade in={true} timeout={500}>
      <StyledPaper>
        <CommentHeader>
          <ChatBubbleOutline color="primary" />
          <GradientText variant="h6">Comments ({comments.length})</GradientText>
        </CommentHeader>

        <CommentListContainer>
          <List disablePadding>
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <Fade in={true} timeout={300 + index * 100} key={comment._id}>
                  <div>
                    <StyledListItem>
                      <StyledAvatar src={comment?.userId?.avatar} />
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              component="span"
                              variant="subtitle2"
                              fontWeight="bold"
                              color="primary.main"
                            >
                              {comment?.userId?.username}
                            </Typography>
                            <TimeChip
                              icon={<AccessTime />}
                              label={comment?.createdAt}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 0.5,
                              lineHeight: 1.5,
                              color: "text.primary",
                            }}
                          >
                            {comment?.comment}
                          </Typography>
                        }
                      />
                      {comment?.userId?._id === curentUserID && (
                        <Box sx={{ marginLeft: "auto" }}>
                          <StyledIconButton
                            size="small"
                            onClick={(event) =>
                              handleMenuOpen(event, comment._id)
                            }
                          >
                            <Settings fontSize="small" />
                          </StyledIconButton>
                        </Box>
                      )}
                    </StyledListItem>

                    <StyledMenu
                      anchorEl={anchorEl}
                      open={
                        Boolean(anchorEl) && selectedCommentId === comment._id
                      }
                      onClose={handleMenuClose}
                      TransitionComponent={Fade}
                      transitionDuration={200}
                    >
                      <MenuItem
                        onClick={() => {
                          handleOpen(selectedCommentId);
                        }}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Edit fontSize="small" />
                        Update
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleDeleteComment(postID, selectedCommentId);
                          handleMenuClose();
                        }}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: "error.main",
                        }}
                      >
                        <Delete fontSize="small" />
                        Delete
                      </MenuItem>
                    </StyledMenu>

                    {open && (
                      <EditCommentPopup
                        open={open}
                        onClose={handleClose}
                        commentold={comment?.comment}
                        postID={postID}
                        commentId={selectedCommentId}
                        setPostList={setPostList}
                      />
                    )}
                  </div>
                </Fade>
              ))
            ) : (
              <EmptyState>
                <ChatBubbleOutline />
                <Typography variant="body2">
                  No comments yet. Be the first to comment!
                </Typography>
              </EmptyState>
            )}
          </List>
        </CommentListContainer>

        <Slide in={true} direction="up" timeout={600}>
          <CommentInputContainer>
            <StyledTextField
              fullWidth
              size="small"
              placeholder="Write a thoughtful comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={3}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <StyledIconButton
                      size="small"
                      onClick={handleSendComment}
                      disabled={!newComment.trim()}
                      sx={{
                        opacity: newComment.trim() ? 1 : 0.5,
                        background: newComment.trim()
                          ? "linear-gradient(135deg, #1976d2, #9c27b0)"
                          : "transparent",
                        color: newComment.trim() ? "white" : "inherit",
                      }}
                    >
                      <Send fontSize="small" />
                    </StyledIconButton>
                  </InputAdornment>
                ),
              }}
            />
          </CommentInputContainer>
        </Slide>
      </StyledPaper>
    </Fade>
  );
}
