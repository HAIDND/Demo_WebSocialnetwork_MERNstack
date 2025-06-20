// ========== FRIENDSHIP MANAGEMENT ==========

const { executeQuery } = require("./neo4jService");

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
  console.log(
    "Executing acceptFriendRequest with userId:",
    userId,
    "and requesterId:",
    requesterId
  );
  const result = await executeQuery(query, { userId, requesterId });
  return result.records.length > 0;
}

// Từ chối lời mời kết bạn
async function rejectFriendRequest(userId, requesterId) {
  console.log(
    "Executing rejectFriendRequest with userId:",
    userId,
    "and requesterId:",
    requesterId
  );
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
  console.log(
    "Executing unfriend with userId1:",
    userId1,
    "and userId2:",
    userId2
  );
  const query = `
    MATCH (u1:User {id: $userId1})-[r1:FRIENDS_WITH]-(u2:User {id: $userId2})
    DELETE r1
    RETURN COUNT(r1) as deletedCount
  `;

  const result = await executeQuery(query, { userId1, userId2 });
  return result.records[0]?.get("deletedCount") > 0;
}

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
};
