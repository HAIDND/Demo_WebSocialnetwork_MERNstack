import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { getPost } from "~/services/postServices/postService";
import { CurrentUser } from "~/context/GlobalContext";

// Tạo NewsFeed Context
const NewsFeedContext = createContext();

// Hook để sử dụng NewsFeed Context
export const useNewsFeed = () => {
  const context = useContext(NewsFeedContext);
  if (!context) {
    throw new Error("useNewsFeed must be used within a NewsFeedProvider");
  }
  return context;
};

// NewsFeed Provider Component
export const NewsFeedProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const { currentUser } = useContext(CurrentUser);
  const isInitialLoad = useRef(true);

  // Load posts với pagination
  const loadPosts = useCallback(
    async (pageNum = 1, reset = false) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getPost({
          page: pageNum,
          limit: 5,
          userId: currentUser?.userId,
        });

        if (reset || pageNum === 1) {
          setPosts(data.posts || []);
        } else {
          setPosts((prev) => [...prev, ...(data.posts || [])]);
        }

        // Kiểm tra còn posts để load không
        setHasMore(data.posts && data.posts.length === 5);
        setPage(pageNum);
      } catch (error) {
        console.error("Error loading posts:", error);
        setError(error.message || "Có lỗi xảy ra khi tải bài đăng");
      } finally {
        setLoading(false);
      }
    },
    [currentUser?.userId, loading]
  );

  // Load more posts (infinite scroll)
  const loadMorePosts = useCallback(() => {
    if (!loading && hasMore) {
      loadPosts(page + 1, false);
    }
  }, [loadPosts, loading, hasMore, page]);

  // Refresh posts
  const refreshPosts = useCallback(() => {
    setPage(1);
    setHasMore(true);
    loadPosts(1, true);
  }, [loadPosts]);

  // Initial load
  React.useEffect(() => {
    if (isInitialLoad.current && currentUser?.userId) {
      loadPosts(1, true);
      isInitialLoad.current = false;
    }
  }, [currentUser?.userId, loadPosts]);

  // Update specific post
  const updatePost = useCallback((postId, updatedData) => {
    setPosts((prev) =>
      prev.map((post) =>
        post._id === postId ? { ...post, ...updatedData } : post
      )
    );
  }, []);

  // Delete post
  const deletePost = useCallback((postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  }, []);

  // Add new post
  const addPost = useCallback((newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  // Update post likes
  const updatePostLikes = useCallback(
    (postId, likes) => {
      updatePost(postId, { likes });
    },
    [updatePost]
  );

  // Update post comments
  const updatePostComments = useCallback(
    (postId, comments) => {
      updatePost(postId, { comments });
    },
    [updatePost]
  );

  const value = {
    // State
    posts,
    loading,
    hasMore,
    page,
    error,

    // Actions
    loadPosts,
    loadMorePosts,
    refreshPosts,
    updatePost,
    deletePost,
    addPost,
    updatePostLikes,
    updatePostComments,
    setPosts,
  };

  return (
    <NewsFeedContext.Provider value={value}>
      {children}
    </NewsFeedContext.Provider>
  );
};

export default NewsFeedContext;
