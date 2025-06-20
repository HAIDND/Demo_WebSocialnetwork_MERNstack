const express = require("express");
const neo4jRecommendRoutes = express.Router();

const authenticateToken = require("../middlewares/authenticateToken");
const {
  getFriendSuggestions,
  getNewsFeed,
} = require("../controllers/neo4j/Neo4jRecommendController");

neo4jRecommendRoutes.get(
  "/getFriendSuggestions",
  authenticateToken,
  getFriendSuggestions
);
neo4jRecommendRoutes.get("/getNewsFeed", authenticateToken, getNewsFeed);

module.exports = neo4jRecommendRoutes;
