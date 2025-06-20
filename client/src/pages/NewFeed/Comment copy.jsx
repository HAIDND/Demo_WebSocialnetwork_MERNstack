import React, { useState } from "react";
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
} from "@mui/material";
import { Settings } from "@mui/icons-material";

import EditCommentPopup from "~/pages/NewFeed/EditCommentPopup";
import { createComment, deleteComment, editComment, getPost } from "~/services/postServices/postService";

export default function CommentList({ comments, postID, curentUserID, setPostList }) {
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
    const handleAddComment = async (postID, newComment) => {
        try {
            const data = await createComment({ postId: postID, comment: newComment });
            setPostList((prevList) =>
                prevList.map((post) => (post._id === postID ? { ...post, comments: data.comments } : post)),
            );
            const updatedData = await getPost(curentUserID);
            setPostList(updatedData);
        } catch (error) {
            console.error("Lỗi khi thêm comment:", error);
        }
    };
    ///handle dele update
    const handleDeleteComment = async (postID, commentId) => {
        try {
            // Assuming deleteComment is a function in your service that handles comment deletion.
            const data = await deleteComment(postID, commentId);
            if (!data.error) {
                // setPostList((prevList) =>
                //     prevList.map((post) =>
                //         post._id === postID
                //             ? { ...post, comments: post.comments.filter((comment) => comment._id !== commentId) }
                //             : post,
                //     ),
                // );
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
            // Assuming editComment is a function in your service that handles comment update.
            const data = await editComment({ commentId: commentId, postId: postID, comment: updatedComment });
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
        <Paper elevation={3} sx={{ padding: 2, bgcolor: "background.paper" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
                Comments
            </Typography>
            <Box sx={{ maxHeight: 150, overflowY: "auto", borderRadius: 1, padding: 1, bgcolor: "#33333" }}>
                <List>
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <React.Fragment key={comment._id}>
                                <ListItem alignItems="flex-start">
                                    <Avatar src={comment?.userId?.avatar} sx={{ mr: 1 }} />
                                    <ListItemText
                                        primary={
                                            <Typography component="span" variant="body1" fontWeight="bold">
                                                {comment?.userId?.username}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ display: "block", fontSize: "0.65rem" }}
                                                >
                                                    comment {comment?.createdAt}
                                                </Typography>
                                                <Typography variant="body2">{comment?.comment}</Typography>
                                            </>
                                        }
                                    />
                                    {comment?.userId?._id === curentUserID && (
                                        <Box sx={{ marginLeft: "auto" }}>
                                            <IconButton
                                                size="small"
                                                onClick={(event) => handleMenuOpen(event, comment._id)}
                                            >
                                                <Settings />
                                            </IconButton>
                                        </Box>
                                    )}
                                </ListItem>
                                <Divider />
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl) && selectedCommentId === comment._id}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem
                                        onClick={() => {
                                            // handleMenuClose();
                                            handleOpen(selectedCommentId);
                                            // handleMenuClose();
                                        }}
                                    >
                                        Update
                                    </MenuItem>{" "}
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
                                    <MenuItem
                                        onClick={() => {
                                            handleDeleteComment(postID, selectedCommentId);
                                            handleMenuClose();
                                        }}
                                    >
                                        Delete
                                    </MenuItem>
                                </Menu>
                            </React.Fragment>
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                            No comments yet.
                        </Typography>
                    )}
                </List>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    sx={{ mr: 1 }}
                />
                <Button variant="contained" onClick={handleSendComment}>
                    Send
                </Button>
            </Box>
        </Paper>
    );
}
