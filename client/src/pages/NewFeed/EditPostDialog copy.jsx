import React, { useState, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Typography, Input } from "@mui/material";
import { getPost, updatePost } from "~/services/postServices/postService"; // Make sure updatePost is defined

const EditPostDialog = ({ open, onClose, postContent, postImage, postId, setPostList }) => {
    const [content, setContent] = useState(postContent);
    const [image, setImage] = useState(postImage);
    const [selectedImage, setSelectedImage] = useState(null);

    // useEffect(() => {
    //     // Reset selected image and content when dialog opens
    //     setContent(postContent);
    //     // setImage(postImage);
    //     // setSelectedImage(null);
    // }, [open, postContent, postImage]);

    const handleContentChange = (event) => {
        setContent(event.target.value);
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const isImage = file.type.startsWith("image/");
            setSelectedImage(URL.createObjectURL(file));
            if (isImage) {
                setImage(file); // Set the image file to the state
            }
        }
    };

    const handleCompleteClick = async () => {
        if (selectedImage === null) {
            await updatePost(postId, content, image);
            const update = await getPost();
            setPostList(update); // Send either the selected image or existing image if no new one
            onClose(); // Close dialog after update
        } else {
            // Only update the post if the image is changed
            await updatePost(postId, content, image);
            const update = await getPost();
            setPostList(update); // Send either the selected image or existing image if no new one
            onClose(); // Close dialog after update
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogContent>
                <Typography variant="body2" gutterBottom>
                    Please edit your post below:
                </Typography>

                <TextField
                    label="Content"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={content}
                    onChange={handleContentChange}
                    style={{ marginBottom: "20px" }}
                />

                <Typography variant="body2" gutterBottom>
                    Upload Image:
                </Typography>
                <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleImageChange}
                    style={{ marginBottom: "20px" }}
                />

                {selectedImage && (
                    <div style={{ marginTop: "10px", marginBottom: "20px" }}>
                        <img
                            src={selectedImage}
                            alt="Preview"
                            style={{ width: "100%", maxHeight: "500px", objectFit: "cover" }}
                        />
                    </div>
                )}
                {/* Show the current image if no new image is selected */}
                {!selectedImage && image && (
                    <div style={{ marginTop: "10px", marginBottom: "20px" }}>
                        <img
                            src={image}
                            alt="Post Image"
                            style={{ width: "100%", maxHeight: "500px", objectFit: "cover" }}
                        />
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={handleCompleteClick} color="primary" variant="contained">
                    Complete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditPostDialog;
