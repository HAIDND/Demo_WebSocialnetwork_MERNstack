// ========== POST MANAGEMENT ==========

const { executeQuery } = require("./neo4jService");

// Tạo bài viết
// Creating post with data: {
//   userId: new ObjectId('6852d7c54e21c1d357dc8a4c'),
//   content: 'Xin chào ae !',
//   images: [],
//   likes: [],
//   visibility: 'friends',
//   location: '',
//   _id: new ObjectId('685377673467e6fa3de33f1e'),
//   comments: [],
//   createdAt: 2025-06-19T02:35:19.707Z,
//   updatedAt: 2025-06-19T02:35:19.707Z
// }
async function createPost(postData) {
  const { _id, userId, visibility = "public" } = postData;

  const id = _id ? _id.toString() : null;
  const makerId = userId.toString();
  const query = `
    MATCH (u:User {id: $makerId})
    CREATE (p:Post {
      id: $id,
      privacy: $visibility,
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
    makerId,
    id,
    visibility,
  });

  return result.records[0]?.get("p").properties;
}

// Like bài viết
async function likePost(userId, postId) {
  console.log("Like post", userId, postId);
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
  console.log("Unlike post", userId, postId);
  // Xóa mối quan hệ LIKED và giảm số lượng like
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
// Create comment 6852d7c54e21c1d357dc8a4c 68537984920824cadc26debc {
//   userId: '6852d7c54e21c1d357dc8a4c',
//   comment: 'comment 1',
//   createdAt: 2025-06-19T03:06:27.060Z
// } null
async function createComment(userId, postId, comment, parentCommentId = null) {
  const makerId = userId.toString();
  const commentId = comment._id ? comment._id.toString() : null;
  let query, params;

  // if (parentCommentId) {
  //   // Reply to comment
  //   query = `
  //     MATCH (u:User {id: $makerId}), (p:Post {id: $postId})
  //     CREATE (c:Comment {
  //       id: randomUUID(),
  //     })
  //     CREATE (u)-[:COMMENTED]->(c)
  //     CREATE (c)-[:COMMENT_ON]->(p)
  //     CREATE (c)-[:REPLY_TO]->(parent)
  //     SET p.commentCount = p.commentCount + 1,
  //         parent.replyCount = parent.replyCount + 1
  //     RETURN c
  //   `;
  //   params = { makerId, postId, comment, parentCommentId };
  // } else {
  // Comment on post
  query = `
      MATCH (u:User {id: $makerId}), (p:Post {id: $postId})
      CREATE (c:Comment {
        id: $commentId
      })
      CREATE (u)-[:COMMENTED]->(c)
      CREATE (c)-[:COMMENT_ON]->(p)
      RETURN c
    `;
  params = { makerId, postId, commentId };
  //}

  const result = await executeQuery(query, params);
  return result.records[0]?.get("c").properties;
}

module.exports = {
  createPost,
  likePost,
  unlikePost,
  createComment,
};
