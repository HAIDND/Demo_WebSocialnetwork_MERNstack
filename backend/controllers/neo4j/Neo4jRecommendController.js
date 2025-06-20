// ========== RECOMMENDATION SYSTEM ==========
const { executeQuery } = require("./neo4jService");

// Gợi ý bạn bè (chỉ recommend bạn của bạn)
exports.getFriendSuggestions = async (req, res) => {
  try {
    // Đảm bảo limit là integer, không phải float
    const limitParam = req.query.limit || "10";
    const limit = Math.floor(parseInt(limitParam, 10));
    const userId = req.userId; // ID người gửi yêu cầu

    console.log("Getting friend suggestions for user:", userId);
    console.log("Limit parameter:", limit);

    // Validate limit
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid limit parameter. Must be a positive integer.",
      });
    }

    const query = `
      MATCH (u:User {id: $userId})
      // Tìm bạn của bạn, mà chưa phải bạn, chưa gửi hoặc nhận lời mời kết bạn
      MATCH (u)-[:FRIENDS_WITH]-(friend)-[:FRIENDS_WITH]-(suggested)
      WHERE NOT (u)-[:FRIENDS_WITH|FRIEND_REQUEST_SENT|FRIEND_REQUEST_RECEIVED]-(suggested)
        AND u <> suggested
      // Tính số lượng bạn chung
      WITH suggested, COUNT(friend) AS mutualFriends
      WHERE suggested IS NOT NULL
      RETURN
        suggested.id AS id,
        suggested.username AS username,
        suggested.avatar AS avatar,
        suggested.email AS email,
        mutualFriends AS score
      ORDER BY score DESC
      LIMIT toInteger($limit)
    `;

    const result = await executeQuery(query, {
      userId: userId,
      limit: limit,
    });

    const suggestions = result.records.map((record) => ({
      id: record.get("id"),
      username: record.get("username"),
      avatar: record.get("avatar"),
      email: record.get("email"),
      mutualFriends: record.get("score"),
    }));

    return res.status(200).json({
      success: true,
      data: suggestions,
      message: "Friend suggestions retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting friend suggestions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get friend suggestions",
      error: error.message,
    });
  }
};

// Gợi ý bài viết cho news feed (chỉ trả về id và thông tin cần thiết)
exports.getNewsFeed = async (req, res) => {
  try {
    const userId = req.userId;
    const limitParam = req.query.limit || "20";
    const offsetParam = req.query.offset || "0";

    const limit = Math.floor(parseInt(limitParam, 10));
    const offset = Math.floor(parseInt(offsetParam, 10));

    // Validate parameters
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid limit parameter. Must be a positive integer.",
      });
    }

    if (isNaN(offset) || offset < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid offset parameter. Must be a non-negative integer.",
      });
    }

    const query = `
      MATCH (u:User {id: $userId})
     
      // Posts từ friends và người follow
      MATCH (u)-[:FRIENDS_WITH|FOLLOWS]->(poster:User)-[:POSTED]->(post:Post)
      WHERE post.privacy IN ['public', 'friends']
     
      // Tính điểm dựa trên engagement và thời gian
      WITH post, poster,
           (post.likeCount * 1 + post.commentCount * 2 + post.shareCount * 3) as engagementScore,
           duration.inDays(post.createdAt, datetime()).days as daysSincePost
     
      // Điểm tổng hợp (engagement cao, thời gian gần)
      WITH post, poster, engagementScore / (daysSincePost + 1) as score
     
      RETURN post.id as id,
             post.content as content,
             post.images as images,
             post.createdAt as createdAt,
             post.likeCount as likeCount,
             post.commentCount as commentCount,
             post.shareCount as shareCount,
             poster.id as authorId,
             poster.username as authorUsername,
             poster.fullName as authorFullName,
             poster.avatar as authorAvatar,
             poster.email as authorEmail,
             score
      ORDER BY score DESC
      SKIP toInteger($offset)
      LIMIT toInteger($limit)
    `;

    const result = await executeQuery(query, {
      userId: userId,
      limit: limit,
      offset: offset,
    });

    const posts = result.records.map((record) => ({
      id: record.get("id"), // Post ID
      content: record.get("content"),
      images: record.get("images"),
      createdAt: record.get("createdAt"),
      likeCount: record.get("likeCount"),
      commentCount: record.get("commentCount"),
      shareCount: record.get("shareCount"),
      author: {
        id: record.get("authorId"),
        username: record.get("authorUsername"),
        fullName: record.get("authorFullName"),
        avatar: record.get("authorAvatar"),
        email: record.get("authorEmail"),
      },
      score: record.get("score"),
    }));

    return res.status(200).json({
      success: true,
      data: posts,
      message: "News feed retrieved successfully",
      pagination: {
        limit,
        offset,
        total: posts.length,
      },
    });
  } catch (error) {
    console.error("Error getting news feed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get news feed",
      error: error.message,
    });
  }
};
