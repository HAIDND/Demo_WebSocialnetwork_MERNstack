const neo4j = require("neo4j-driver");

// Environment variables thay vì hardcode
const NEO4J_URI =
  process.env.NEO4J_URI || "neo4j+s://cbda0561.databases.neo4j.io";
const NEO4J_USER = process.env.NEO4J_USER || "neo4j";
const NEO4J_PASSWORD =
  process.env.NEO4J_PASSWORD || "Fi5DRyCzD0-iutQsD4PJf8xX7SUOT8cFe5uf_xXcuH4";

// Singleton pattern cho driver
let driver;

function getDriver() {
  if (!driver) {
    driver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
      {
        maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
        disableLosslessIntegers: true,
      }
    );
  }
  return driver;
}

// Helper function để quản lý session
async function executeQuery(query, params = {}) {
  const session = getDriver().session();
  try {
    const result = await session.run(query, params);
    return result;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// ========== USER MANAGEMENT ==========

// Tạo user với validation
async function createUser(userData) {
  const { username, email, password, fullName, avatar, bio } = userData;

  // Validate required fields
  if (!username || !email || !password) {
    throw new Error("Username, email và password là bắt buộc");
  }

  const query = `
    CREATE (u:User {
      id: randomUUID(),
      username: $username,
      email: $email,
      password: $password,
      fullName: $fullName,
      avatar: $avatar,
      bio: $bio,
      createdAt: datetime(),
      updatedAt: datetime(),
      isActive: true,
      followerCount: 0,
      followingCount: 0,
      postCount: 0
    })
    RETURN u
  `;

  const result = await executeQuery(query, {
    username,
    email,
    password,
    fullName,
    avatar,
    bio,
  });

  return result.records[0]?.get("u").properties;
}

// Lấy thông tin user
async function getUserById(userId) {
  const query = `
    MATCH (u:User {id: $userId})
    RETURN u
  `;

  const result = await executeQuery(query, { userId });
  return result.records[0]?.get("u").properties;
}

// Cập nhật thông tin user
async function updateUser(userId, updateData) {
  const setClause = Object.keys(updateData)
    .map((key) => `u.${key} = $${key}`)
    .join(", ");

  const query = `
    MATCH (u:User {id: $userId})
    SET ${setClause}, u.updatedAt = datetime()
    RETURN u
  `;

  const result = await executeQuery(query, { userId, ...updateData });
  return result.records[0]?.get("u").properties;
}

// ========== FRIENDSHIP MANAGEMENT ==========

// Gửi lời mời kết bạn
async function sendFriendRequest(fromUserId, toUserId) {
  const query = `
    MATCH (from:User {id: $fromUserId}), (to:User {id: $toUserId})
    WHERE NOT (from)-[:FRIENDS_WITH|FRIEND_REQUEST_SENT|FRIEND_REQUEST_RECEIVED]-(to)
    CREATE (from)-[r:FRIEND_REQUEST_SENT {createdAt: datetime()}]->(to)
    CREATE (to)-[r2:FRIEND_REQUEST_RECEIVED {createdAt: datetime()}]->(from)
    RETURN r, r2
  `;

  const result = await executeQuery(query, { fromUserId, toUserId });
  return result.records.length > 0;
}

// Chấp nhận lời mời kết bạn
async function acceptFriendRequest(userId, requesterId) {
  const query = `
    MATCH (user:User {id: $userId})-[req:FRIEND_REQUEST_RECEIVED]->(requester:User {id: $requesterId})
    MATCH (requester)-[sent:FRIEND_REQUEST_SENT]->(user)
    DELETE req, sent
    CREATE (user)-[f1:FRIENDS_WITH {createdAt: datetime()}]->(requester)
    CREATE (requester)-[f2:FRIENDS_WITH {createdAt: datetime()}]->(user)
    RETURN f1, f2
  `;

  const result = await executeQuery(query, { userId, requesterId });
  return result.records.length > 0;
}

// Từ chối lời mời kết bạn
async function rejectFriendRequest(userId, requesterId) {
  const query = `
    MATCH (user:User {id: $userId})-[req:FRIEND_REQUEST_RECEIVED]->(requester:User {id: $requesterId})
    MATCH (requester)-[sent:FRIEND_REQUEST_SENT]->(user)
    DELETE req, sent
    RETURN COUNT(*) as deleted
  `;

  const result = await executeQuery(query, { userId, requesterId });
  return result.records[0]?.get("deleted") > 0;
}

// Hủy kết bạn
async function unfriend(userId1, userId2) {
  const query = `
    MATCH (u1:User {id: $userId1})-[r1:FRIENDS_WITH]-(u2:User {id: $userId2})
    DELETE r1
    RETURN COUNT(r1) as deletedCount
  `;

  const result = await executeQuery(query, { userId1, userId2 });
  return result.records[0]?.get("deletedCount") > 0;
}

// ========== FOLLOW SYSTEM ==========

// Follow người dùng
async function followUser(followerId, followeeId) {
  const query = `
    MATCH (follower:User {id: $followerId}), (followee:User {id: $followeeId})
    WHERE NOT (follower)-[:FOLLOWS]->(followee) AND follower <> followee
    CREATE (follower)-[f:FOLLOWS {createdAt: datetime()}]->(followee)
    SET followee.followerCount = followee.followerCount + 1,
        follower.followingCount = follower.followingCount + 1
    RETURN f
  `;

  const result = await executeQuery(query, { followerId, followeeId });
  return result.records.length > 0;
}

// Unfollow người dùng
async function unfollowUser(followerId, followeeId) {
  const query = `
    MATCH (follower:User {id: $followerId})-[f:FOLLOWS]->(followee:User {id: $followeeId})
    DELETE f
    SET followee.followerCount = followee.followerCount - 1,
        follower.followingCount = follower.followingCount - 1
    RETURN COUNT(f) as unfollowed
  `;

  const result = await executeQuery(query, { followerId, followeeId });
  return result.records[0]?.get("unfollowed") > 0;
}

// ========== POST MANAGEMENT ==========

// Tạo bài viết
async function createPost(userId, postData) {
  const { content, images, privacy = "public", tags = [] } = postData;

  const query = `
    MATCH (u:User {id: $userId})
    CREATE (p:Post {
      id: randomUUID(),
      content: $content,
      images: $images,
      privacy: $privacy,
      tags: $tags,
      createdAt: datetime(),
      updatedAt: datetime(),
      likeCount: 0,
      commentCount: 0,
      shareCount: 0
    })
    CREATE (u)-[:POSTED]->(p)
    SET u.postCount = u.postCount + 1
    RETURN p
  `;

  const result = await executeQuery(query, {
    userId,
    content,
    images,
    privacy,
    tags,
  });

  return result.records[0]?.get("p").properties;
}

// Like bài viết
async function likePost(userId, postId) {
  const query = `
    MATCH (u:User {id: $userId}), (p:Post {id: $postId})
    WHERE NOT (u)-[:LIKED]->(p)
    CREATE (u)-[l:LIKED {createdAt: datetime()}]->(p)
    SET p.likeCount = p.likeCount + 1
    RETURN l
  `;

  const result = await executeQuery(query, { userId, postId });
  return result.records.length > 0;
}

// Unlike bài viết
async function unlikePost(userId, postId) {
  const query = `
    MATCH (u:User {id: $userId})-[l:LIKED]->(p:Post {id: $postId})
    DELETE l
    SET p.likeCount = p.likeCount - 1
    RETURN COUNT(l) as unliked
  `;

  const result = await executeQuery(query, { userId, postId });
  return result.records[0]?.get("unliked") > 0;
}

// Tạo comment
async function createComment(userId, postId, content, parentCommentId = null) {
  let query, params;

  if (parentCommentId) {
    // Reply to comment
    query = `
      MATCH (u:User {id: $userId}), (p:Post {id: $postId}), (parent:Comment {id: $parentCommentId})
      CREATE (c:Comment {
        id: randomUUID(),
        content: $content,
        createdAt: datetime(),
        updatedAt: datetime(),
        likeCount: 0,
        replyCount: 0
      })
      CREATE (u)-[:COMMENTED]->(c)
      CREATE (c)-[:COMMENT_ON]->(p)
      CREATE (c)-[:REPLY_TO]->(parent)
      SET p.commentCount = p.commentCount + 1,
          parent.replyCount = parent.replyCount + 1
      RETURN c
    `;
    params = { userId, postId, content, parentCommentId };
  } else {
    // Comment on post
    query = `
      MATCH (u:User {id: $userId}), (p:Post {id: $postId})
      CREATE (c:Comment {
        id: randomUUID(),
        content: $content,
        createdAt: datetime(),
        updatedAt: datetime(),
        likeCount: 0,
        replyCount: 0
      })
      CREATE (u)-[:COMMENTED]->(c)
      CREATE (c)-[:COMMENT_ON]->(p)
      SET p.commentCount = p.commentCount + 1
      RETURN c
    `;
    params = { userId, postId, content };
  }

  const result = await executeQuery(query, params);
  return result.records[0]?.get("c").properties;
}

// ========== RECOMMENDATION SYSTEM ==========

// Gợi ý bạn bè (cải thiện thuật toán)
async function getFriendSuggestions(userId, limit = 10) {
  const query = `
    MATCH (u:User {id: $userId})
    
    // Bạn của bạn
    OPTIONAL MATCH (u)-[:FRIENDS_WITH]-(friend)-[:FRIENDS_WITH]-(suggested1)
    WHERE NOT (u)-[:FRIENDS_WITH|FRIEND_REQUEST_SENT|FRIEND_REQUEST_RECEIVED]-(suggested1) 
    AND u <> suggested1
    WITH u, suggested1, COUNT(friend) as mutualFriends
    
    // Người có cùng sở thích (theo tags của posts)
    OPTIONAL MATCH (u)-[:POSTED]->(post1)-[:TAGGED]->(tag)<-[:TAGGED]-(post2)<-[:POSTED]-(suggested2)
    WHERE NOT (u)-[:FRIENDS_WITH|FRIEND_REQUEST_SENT|FRIEND_REQUEST_RECEIVED]-(suggested2) 
    AND u <> suggested2
    WITH u, suggested1, mutualFriends, suggested2, COUNT(tag) as commonInterests
    
    // Kết hợp kết quả
    WITH COLLECT(DISTINCT {user: suggested1, score: mutualFriends * 2, type: 'mutual'}) +
         COLLECT(DISTINCT {user: suggested2, score: commonInterests, type: 'interest'}) as suggestions
    
    UNWIND suggestions as suggestion
    WITH suggestion.user as suggestedUser, MAX(suggestion.score) as score
    WHERE suggestedUser IS NOT NULL
    
    RETURN suggestedUser.id as id, 
           suggestedUser.username as username,
           suggestedUser.fullName as fullName,
           suggestedUser.avatar as avatar,
           score
    ORDER BY score DESC
    LIMIT $limit
  `;

  const result = await executeQuery(query, { userId, limit });
  return result.records.map((record) => ({
    id: record.get("id"),
    username: record.get("username"),
    fullName: record.get("fullName"),
    avatar: record.get("avatar"),
    score: record.get("score"),
  }));
}

// Gợi ý bài viết cho news feed
async function getNewsFeed(userId, limit = 20, offset = 0) {
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
    
    RETURN post.id as postId,
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
           score
    ORDER BY score DESC
    SKIP $offset
    LIMIT $limit
  `;

  const result = await executeQuery(query, { userId, limit, offset });
  return result.records.map((record) => ({
    postId: record.get("postId"),
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
    },
    score: record.get("score"),
  }));
}

// ========== ANALYTICS ==========

// Thống kê user
async function getUserStats(userId) {
  const query = `
    MATCH (u:User {id: $userId})
    OPTIONAL MATCH (u)-[:FRIENDS_WITH]-(friend)
    OPTIONAL MATCH (u)-[:FOLLOWS]->(following)
    OPTIONAL MATCH (u)<-[:FOLLOWS]-(follower)
    OPTIONAL MATCH (u)-[:POSTED]->(post)
    OPTIONAL MATCH (post)<-[:LIKED]-(liker)
    OPTIONAL MATCH (post)<-[:COMMENT_ON]-(comment)
    
    RETURN u.username as username,
           COUNT(DISTINCT friend) as friendsCount,
           COUNT(DISTINCT following) as followingCount,
           COUNT(DISTINCT follower) as followersCount,
           COUNT(DISTINCT post) as postsCount,
           COUNT(DISTINCT liker) as totalLikes,
           COUNT(DISTINCT comment) as totalComments
  `;

  const result = await executeQuery(query, { userId });
  return result.records[0]
    ? {
        username: result.records[0].get("username"),
        friendsCount: result.records[0].get("friendsCount"),
        followingCount: result.records[0].get("followingCount"),
        followersCount: result.records[0].get("followersCount"),
        postsCount: result.records[0].get("postsCount"),
        totalLikes: result.records[0].get("totalLikes"),
        totalComments: result.records[0].get("totalComments"),
      }
    : null;
}

// ========== SEARCH ==========

// Tìm kiếm user
async function searchUsers(searchTerm, limit = 10) {
  const query = `
    MATCH (u:User)
    WHERE u.username CONTAINS $searchTerm 
       OR u.fullName CONTAINS $searchTerm
       OR u.email CONTAINS $searchTerm
    RETURN u.id as id,
           u.username as username,
           u.fullName as fullName,
           u.avatar as avatar,
           u.followerCount as followerCount
    ORDER BY u.followerCount DESC
    LIMIT $limit
  `;

  const result = await executeQuery(query, { searchTerm, limit });
  return result.records.map((record) => ({
    id: record.get("id"),
    username: record.get("username"),
    fullName: record.get("fullName"),
    avatar: record.get("avatar"),
    followerCount: record.get("followerCount"),
  }));
}

// Tìm kiếm bài viết
async function searchPosts(searchTerm, limit = 20) {
  const query = `
    MATCH (u:User)-[:POSTED]->(p:Post)
    WHERE p.content CONTAINS $searchTerm
      AND p.privacy = 'public'
    RETURN p.id as postId,
           p.content as content,
           p.createdAt as createdAt,
           p.likeCount as likeCount,
           p.commentCount as commentCount,
           u.id as authorId,
           u.username as authorUsername,
           u.fullName as authorFullName,
           u.avatar as authorAvatar
    ORDER BY p.createdAt DESC
    LIMIT $limit
  `;

  const result = await executeQuery(query, { searchTerm, limit });
  return result.records.map((record) => ({
    postId: record.get("postId"),
    content: record.get("content"),
    createdAt: record.get("createdAt"),
    likeCount: record.get("likeCount"),
    commentCount: record.get("commentCount"),
    author: {
      id: record.get("authorId"),
      username: record.get("authorUsername"),
      fullName: record.get("authorFullName"),
      avatar: record.get("authorAvatar"),
    },
  }));
}

// ========== CLEANUP ==========

// Đóng kết nối
async function closeConnection() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

// Graceful shutdown
process.on("SIGINT", closeConnection);
process.on("SIGTERM", closeConnection);

// module.exports = {
//   // User management
//   createUser,
//   getUserById,
//   updateUser,
//   getUserStats,

//   // Friendship
//   sendFriendRequest,
//   acceptFriendRequest,
//   rejectFriendRequest,
//   unfriend,

//   // Follow system
//   followUser,
//   unfollowUser,

//   // Posts
//   createPost,
//   likePost,
//   unlikePost,
//   createComment,

//   // Recommendations
//   getFriendSuggestions,
//   getNewsFeed,

//   // Search
//   searchUsers,
//   searchPosts,

//   // Utilities
//   closeConnection,
//   executeQuery, // Export for custom queries
// };
