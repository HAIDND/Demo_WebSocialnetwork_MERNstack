// ========== USER MANAGEMENT ==========

const { executeQuery } = require("./neo4jService");

// Tạo user với validation
async function createUser(userData) {
  const { username, email, avatar = "" } = userData;
  console.log("Creating user with data:", userData);

  const id = userData._id.toString();
  if (!username || !email) {
    throw new Error("Username, email và password là bắt buộc");
  }

  const query = `
    CREATE (u:User {
      id: $id,
      username: $username,
      email: $email,
      avatar: $avatar
    })
    RETURN u
  `;

  const result = await executeQuery(query, {
    id: id,
    username: username,
    email: email,
    avatar: avatar,
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

module.exports = {
  createUser,
};
