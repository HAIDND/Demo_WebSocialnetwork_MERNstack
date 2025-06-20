import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const CustomDialog = ({ open, onClose, data }) => {
  // Hàm xử lý khi đóng và reload trang
  const handleClose = () => {
    onClose(); // Đóng dialog
    // window.location.reload(); // Reload lại trang
  };
  console.log(data);
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="custom-dialog-title"
      maxWidth="sm"
      fullWidth
      sx={{ bgcolor: "background.paper" }}
    >
      {/* Header */}
      <DialogTitle
        id="custom-dialog-title"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Notification
        <IconButton aria-label="close" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Nội dung giữa */}
      <DialogContent>
        <Typography variant="body1">{data?.content}</Typography>
      </DialogContent>

      {/* Footer với nút OK */}
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleClose} // Reload lại trang khi nhấn OK
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomDialog;
