import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from "react";
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
import { createPost } from "~/services/postServices/postService";
import { CurrentUser } from "~/context/GlobalContext";

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
export default function CreatePost({ children }) {
  const { currentUser, currentUserInfo } = useContext(CurrentUser);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [useGPS, setUseGPS] = useState(false);
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [privacy, setPrivacy] = useState("public");
  const [emotion, setEmotion] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const fileInputRef = useRef();

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length <= 4) {
      setFiles([...files, ...selectedFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setCoordinates({ lat, lng });

          // Reverse geocoding để lấy tên địa điểm từ tọa độ
          try {
            // Sử dụng Nominatim API (free) hoặc Google Geocoding API
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const data = await response.json();

            if (data.display_name) {
              setLocation(data.display_name);
            } else {
              setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }
          } catch (error) {
            console.error("Error reverse geocoding:", error);
            setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          }

          setLocationLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationLoading(false);
          // Hiển thị thông báo lỗi cho user
          alert(
            "Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập vị trí."
          );
        }
      );
    } else {
      alert("Trình duyệt không hỗ trợ GPS");
    }
  };

  const handleLocationInput = (value) => {
    setLocation(value);
    // Reset coordinates khi user nhập manual
    if (!useGPS) {
      setCoordinates(null);
    }
  };

  const clearLocation = () => {
    setLocation("");
    setCoordinates(null);
    setUseGPS(false);
    setLocationLoading(false);
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) return;

    setIsPosting(true);

    // Simulate API call
    setTimeout(() => {
      const newPost = {
        id: Date.now(),
        user: currentUserInfo,
        content, //const file = event.target.files[0];
        files: files.map((file) => ({
          url: URL.createObjectURL(file),
          type: file.type.startsWith("video") ? "video" : "image",
        })),
        location: location,
        coordinates: coordinates,
        privacy,
        emotion: emotions.find((e) => e.value === emotion),
        timestamp: new Date().toISOString(),
        reactions: { like: 0, love: 0, dislike: 0, wow: 0, perfect: 0 },
        commentsCount: 0,
      };
      //const createPost = async (content, image, video, visibility, location) => {
      createPost({
        content: newPost.content,
        images: files.filter((f) => f.type.startsWith("image")),
        video: newPost.files.find((f) => f.type === "video") || null,
        location: newPost.location,
        visibility: newPost.privacy,
      });

      // Reset form
      setContent("");
      setFiles([]);
      setLocation("");
      setCoordinates(null);
      setEmotion("");
      setUseGPS(false);
      setExpanded(false);
      setIsPosting(false);
    }, 1000);
  };

  return (
    <Card
      sx={{ mb: 3, boxShadow: 2, borderRadius: 2, border: "2px solid #e0e0e0" }}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            src={currentUserInfo?.avatar}
            sx={{ mr: 2, width: 48, height: 48 }}
          />
          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold">
              {currentUserInfo?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chia sẻ suy nghĩ của bạn...
            </Typography>
          </Box>
        </Box>

        {/* Content Input */}
        <TextField
          fullWidth
          multiline
          rows={expanded ? 3 : 2}
          placeholder="Bạn đang nghĩ gì?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setExpanded(true)}
          variant="outlined"
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,

              "&:hover": {
                borderColor: "primary.main",
              },
              "&.Mui-focused": {
                borderColor: "primary.main",
              },
            },
          }}
        />

        {/* Files Preview */}
        {files.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, fontWeight: "medium" }}
            >
              Ảnh/Video đã chọn ({files.length}/4)
            </Typography>
            <Grid container spacing={1}>
              {files.map((file, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Box
                    position="relative"
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "2px solid",
                      borderColor: "divider",
                    }}
                  >
                    {file.type.startsWith("video") ? (
                      <video
                        src={URL.createObjectURL(file)}
                        style={{
                          width: "100%",
                          height: 120,
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        style={{
                          width: "100%",
                          height: 120,
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(0,0,0,0.7)",
                        color: "white",
                        "&:hover": {
                          bgcolor: "rgba(0,0,0,0.8)",
                        },
                      }}
                      onClick={() => removeFile(index)}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                    {file.type.startsWith("video") && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 4,
                          left: 4,
                          bgcolor: "rgba(0,0,0,0.7)",
                          color: "white",
                          px: 0.5,
                          py: 0.25,
                          borderRadius: 0.5,
                          fontSize: "0.75rem",
                        }}
                      >
                        Video
                      </Box>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Location Display */}
        {location && (
          <Card
            sx={{
              mb: 2,
              bgcolor: "grey.50",
              border: "1px solid",
              borderColor: "primary.main",
            }}
          >
            <CardContent sx={{ py: 1.5 }}>
              <Box display="flex" alignItems="center" gap={1}>
                {useGPS ? (
                  <GpsFixed color="primary" />
                ) : (
                  <LocationOn color="primary" />
                )}
                <Box flex={1}>
                  <Typography variant="body2" fontWeight="medium">
                    {useGPS ? "Vị trí hiện tại" : "Địa điểm check-in"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {location}
                  </Typography>
                  {coordinates && (
                    <Typography variant="caption" color="text.secondary">
                      {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                    </Typography>
                  )}
                </Box>
                <IconButton size="small" onClick={clearLocation}>
                  <Close />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons Row */}
        <Box display="flex" alignItems="center" gap={1} mb={2} flexWrap="wrap">
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*,video/*"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          <Button
            variant="outlined"
            startIcon={<PhotoCamera />}
            onClick={() => fileInputRef.current?.click()}
            disabled={files.length >= 4}
            sx={{ borderRadius: 2 }}
          >
            Ảnh/Video {files.length > 0 && `(${files.length}/4)`}
          </Button>

          {/* <Button
            variant="outlined"
            startIcon={<LocationOn />}
            onClick={() => setExpanded(true)}
            sx={{ borderRadius: 2 }}
          >
            Thêm vị trí
          </Button> */}
        </Box>

        {/* Location Input Options */}
        {expanded && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, fontWeight: "medium" }}
            >
              Thêm vị trí:
            </Typography>
            <Box display="flex" gap={1} mb={1}>
              <Button
                variant={useGPS ? "contained" : "outlined"}
                startIcon={
                  locationLoading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <GpsFixed />
                  )
                }
                onClick={() => {
                  if (useGPS) {
                    clearLocation();
                  } else {
                    setUseGPS(true);
                    getCurrentLocation();
                  }
                }}
                disabled={locationLoading}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                {locationLoading
                  ? "Đang lấy..."
                  : useGPS
                  ? "Đang dùng GPS"
                  : "Vị trí hiện tại"}
              </Button>

              <Button
                variant={!useGPS && location ? "contained" : "outlined"}
                startIcon={<Place />}
                onClick={() => {
                  if (useGPS) {
                    setUseGPS(false);
                    setCoordinates(null);
                    setLocation("");
                  }
                }}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Nhập thủ công
              </Button>
            </Box>

            {/* Manual Location Input - only show when not using GPS */}
            {!useGPS && (
              <TextField
                fullWidth
                size="small"
                placeholder="Nhập địa điểm check-in..."
                value={location}
                onChange={(e) => handleLocationInput(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <div position="start">
                      <Place color="action" />
                    </div>
                  ),
                }}
                sx={{ borderRadius: 2 }}
              />
            )}
          </Box>
        )}

        {/* Settings Row */}
        {expanded && (
          <Box display="flex" gap={2} mb={2} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Quyền riêng tư</InputLabel>
              <Select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {privacyOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box display="flex" alignItems="center">
                      {option.icon}
                      <Typography sx={{ ml: 1 }}>{option.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Cảm xúc</InputLabel>
              <Select
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">
                  <Typography color="text.secondary">Không có</Typography>
                </MenuItem>
                {emotions.map((emo) => (
                  <MenuItem key={emo.value} value={emo.value}>
                    <Box display="flex" alignItems="center">
                      <Typography>{emo.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Submit Button */}
        <Box display="flex" gap={1}>
          {expanded && (
            <Button
              variant="outlined"
              onClick={() => {
                setExpanded(false);
                setContent("");
                setFiles([]);
                clearLocation();
                setEmotion("");
              }}
              sx={{ borderRadius: 2 }}
            >
              Hủy
            </Button>
          )}

          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={
              isPosting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Send />
              )
            }
            onClick={handleSubmit}
            disabled={isPosting || (!content.trim() && files.length === 0)}
            sx={{
              borderRadius: 2,
              py: 1.2,
              fontSize: "1rem",
              fontWeight: "medium",
            }}
          >
            {isPosting ? "Đang đăng bài..." : "Đăng bài"}
          </Button>
        </Box>

        {/* Quick Stats */}
        {expanded && (content || files.length > 0 || location) && (
          <Box mt={2} pt={2} borderTop="1px solid" borderColor="divider">
            <Typography variant="caption" color="text.secondary">
              {content.length > 0 && `${content.length} ký tự`}
              {content.length > 0 && files.length > 0 && " • "}
              {files.length > 0 && `${files.length} file`}
              {(content.length > 0 || files.length > 0) && location && " • "}
              {location && "Có vị trí"}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
