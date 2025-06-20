import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  IconButton,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Fade,
  Chip,
} from "@mui/material";
import {
  PhotoCamera,
  Delete,
  Close,
  Edit,
  Image as ImageIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { getPost, updatePost } from "~/services/postServices/postService";

// Styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 16,
    maxWidth: 600,
    width: "100%",
    margin: 16,
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2, 3),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  "& .MuiTypography-root": {
    fontWeight: 600,
    fontSize: "1.25rem",
  },
}));

const ImagePreviewContainer = styled(Paper)(({ theme }) => ({
  position: "relative",
  borderRadius: 12,
  overflow: "hidden",
  marginTop: theme.spacing(2),
  border: `2px solid ${theme.palette.divider}`,
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
}));

const ImagePreview = styled("img")({
  width: "100%",
  height: "auto",
  maxHeight: 400,
  objectFit: "cover",
  display: "block",
});

const UploadButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 2),
  textTransform: "none",
  fontWeight: 500,
  minHeight: 48,
  border: `2px dashed ${theme.palette.primary.main}`,
  backgroundColor: "transparent",
  "&:hover": {
    backgroundColor: theme.palette.primary.main + "10",
    border: `2px dashed ${theme.palette.primary.dark}`,
  },
}));

const EditPostDialog = ({
  open,
  onClose,
  postContent = "",
  postImage = null,
  postId,
  setPostList,
}) => {
  const [content, setContent] = useState(postContent);
  const [image, setImage] = useState(postImage);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setContent(postContent || "");
      setImage(postImage);
      setSelectedImage(null);
      setSelectedFile(null);
      setError("");
    }
  }, [open, postContent, postImage]);

  const handleContentChange = (event) => {
    setContent(event.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chọn file hình ảnh hợp lệ");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước file không được vượt quá 5MB");
        return;
      }

      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
  };

  const handleCompleteClick = async () => {
    // Validation
    if (!content.trim()) {
      setError("Nội dung bài viết không được để trống");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const imageToUpdate = selectedFile || image;
      await updatePost(postId, content.trim(), imageToUpdate);

      const updatedPosts = await getPost();
      setPostList(updatedPosts);

      onClose();
    } catch (err) {
      console.error("Error updating post:", err);
      setError("Có lỗi xảy ra khi cập nhật bài viết. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    onClose();
  };

  const currentDisplayImage = selectedImage || image;

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
    >
      <StyledDialogTitle>
        <Edit />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Chỉnh sửa bài viết
        </Typography>
        <IconButton
          onClick={handleClose}
          sx={{
            color: "inherit",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
          }}
        >
          <Close />
        </IconButton>
      </StyledDialogTitle>

      <DialogContent sx={{ p: 3, minHeight: 200 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{ fontWeight: 500, color: "text.primary" }}
          >
            Nội dung bài viết
          </Typography>
          <TextField
            placeholder="Chia sẻ suy nghĩ của bạn..."
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={content}
            onChange={handleContentChange}
            error={!!error && !content.trim()}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            {content.length}/500 ký tự
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{ fontWeight: 500, color: "text.primary", mb: 2 }}
          >
            Hình ảnh
          </Typography>

          {!currentDisplayImage ? (
            <UploadButton
              component="label"
              variant="outlined"
              startIcon={<PhotoCamera />}
              fullWidth
            >
              Chọn hình ảnh
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </UploadButton>
          ) : (
            <ImagePreviewContainer elevation={2}>
              <ImagePreview
                src={currentDisplayImage}
                alt="Preview"
                loading="lazy"
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  display: "flex",
                  gap: 1,
                }}
              >
                <IconButton
                  component="label"
                  size="small"
                  sx={{
                    backgroundColor: "rgba(0,0,0,0.6)",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.8)",
                    },
                  }}
                >
                  <PhotoCamera fontSize="small" />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </IconButton>
                <IconButton
                  onClick={handleRemoveImage}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(244,67,54,0.8)",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgba(244,67,54,1)",
                    },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
              {selectedFile && (
                <Chip
                  label="Hình ảnh mới"
                  color="primary"
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    backgroundColor: "rgba(25,118,210,0.9)",
                    color: "white",
                  }}
                />
              )}
            </ImagePreviewContainer>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: "none",
            fontWeight: 500,
          }}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          onClick={handleCompleteClick}
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: "none",
            fontWeight: 500,
            minWidth: 120,
          }}
          disabled={loading || !content.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? "Đang cập nhật..." : "Cập nhật"}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default EditPostDialog;
