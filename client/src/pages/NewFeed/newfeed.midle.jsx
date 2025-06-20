import { useCallback, useEffect, useRef, useState } from "react";
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

import PostItem from "~/components/Elements/Post/PostItem";
import Post from "~/pages/NewFeed/postItem";

function NewsfeedContent() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef();

  // Tạo mock posts
  const generateMockPosts = (pageNum, count = 10) => {
    return Array.from({ length: count }, (_, i) => {
      const postId = (pageNum - 1) * count + i + 1;
      return {
        id: postId,
        user: {
          id: postId,
          name: `User ${postId}`,
          avatar: `https://ui-avatars.io/api/?name=User+${postId}&background=random`,
        },
        content: `This is post content ${postId}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        files:
          Math.random() > 0.5
            ? [
                {
                  url: `https://picsum.photos/400/300?random=${postId}`,
                  type: "image",
                },
              ]
            : [],
        location: Math.random() > 0.7 ? `district  ${postId}` : "",
        privacy: ["public", "friends", "private"][
          Math.floor(Math.random() * 3)
        ],
        emotion:
          Math.random() > 0.6
            ? emotions[Math.floor(Math.random() * emotions.length)]
            : null,
        timestamp: new Date(
          Date.now() - Math.random() * 86400000 * 7
        ).toISOString(),
        reactions: {
          like: Math.floor(Math.random() * 50),
          love: Math.floor(Math.random() * 30),
          dislike: Math.floor(Math.random() * 5),
          wow: Math.floor(Math.random() * 20),
          perfect: Math.floor(Math.random() * 15),
        },
        commentsCount: Math.floor(Math.random() * 20),
      };
    });
  };

  const loadPosts = useCallback(async (pageNum) => {
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const newPosts = generateMockPosts(pageNum);

      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      if (pageNum >= 5) {
        // Simulate end of data after 5 pages
        setHasMore(false);
      }

      setLoading(false);
    }, 1000);
  }, []);

  // Load initial posts
  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  // Infinite scroll observer
  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            loadPosts(nextPage);
            return nextPage;
          });
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadPosts]
  );

  const handleCreatePost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };
  return (
    <>
      <Post />
      {/* <Box>
        {posts.map((post, index) => (
          <div
            key={post.id}
            ref={index === posts.length - 1 ? lastPostElementRef : null}
          >
            <PostItem post={post} isOwner={post.user.id === mockUser.id} />
          </div>
        ))}

        {loading && (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        )}

        {!hasMore && posts.length > 0 && (
          <Typography align="center" color="text.secondary" sx={{ p: 2 }}>
            Đã tải hết tất cả bài đăng
          </Typography>
        )}
      </Box> */}
    </>
  );
}

export default NewsfeedContent;
