const neo4j = require("neo4j-driver");

//key
const NEO4J_URI = "neo4j+s://cbda0561.databases.neo4j.io";
const NEO4J_USER = "neo4j";
const NEO4J_PASSWORD = "Fi5DRyCzD0-iutQsD4PJf8xX7SUOT8cFe5uf_xXcuH4";
// Kết nối đến database Neo4j
const driver = neo4j.driver(
  NEO4J_URI, // Thay bằng URL của bạn
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD) // Thay bằng username và password của bạn
);

const session = driver.session();

// Hàm tạo một Node (Ví dụ: User)
async function createNode(label, properties) {
  const query = `CREATE (n:${label} $properties) RETURN n`;
  const params = { properties };

  try {
    const result = await session.run(query, params);
    return result.records[0].get("n").properties;
  } catch (error) {
    console.error("Lỗi khi tạo node:", error);
    throw error;
  }
}

// Hàm tạo một Relationship giữa hai Node
async function createRelationship(typeFrom, fromNode, typeTo, toNode, relType) {
  const query = `
    MATCH (a:${typeFrom} {id: $fromId}), (b:${typeTo} {id: $toId})
    CREATE (a)-[r:${relType}]->(b)
    RETURN r
  `;
  const params = {
    fromId: fromNode,
    toId: toNode,
  };

  try {
    const result = await session.run(query, params);
    return result.records[0].get("r");
  } catch (error) {
    console.error("Lỗi khi tạo relationship:", error);
    throw error;
  }
}
async function deleteRelationship(typeFrom, fromNode, typeTo, toNode, relType) {
  const query = `
      MATCH (a:${typeFrom} {id: $fromId})-[r:${relType}]-(b:${typeTo} {id: $toId})
      DELETE r
      RETURN COUNT(r) AS deletedCount
    `;

  const params = {
    fromId: fromNode,
    toId: toNode,
  };

  try {
    const result = await session.run(query, params);
    const deletedCount = result.records[0].get("deletedCount");

    if (deletedCount === 0) {
      console.log("Không tìm thấy mối quan hệ để xóa.");
      return { message: "Không tìm thấy mối quan hệ để xóa." };
    }

    return { message: "Đã xóa thành công", deletedCount };
  } catch (error) {
    console.error("Lỗi khi xóa relationship:", error);
    throw error;
  }
}

async function getSuggestFriends(userId) {
  const query = `
      MATCH (u:User {id: $userId})-[:FRIENDS_WITH]-(friend)-[:FRIENDS_WITH]-(suggested)
      WHERE NOT (u)-[:FRIENDS_WITH]-(suggested) AND u <> suggested
      RETURN DISTINCT suggested.id AS suggestedId, suggested.username AS suggestedName, suggested.avatar AS avatar
      LIMIT 10
    `;

  try {
    const result = await session.run(query, { userId });

    return result.records.map((record) => ({
      id: record.get("suggestedId"),
      username: record.get("suggestedName"),
      avatar: record.get("avatar"),
    }));
  } catch (error) {
    console.error("Lỗi khi truy vấn gợi ý bạn bè:", error);
    throw error;
  } finally {
    await session.close();
  }
}
module.exports = {
  createNode,
  createRelationship,
  deleteRelationship,
  getSuggestFriends,
};
