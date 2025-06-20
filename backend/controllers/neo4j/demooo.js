jsx
{
  "name": "social-media-backend",
  "version": "1.0.0",
  "description": "Social Media Backend API with Express.js and Neo4j",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "neo4j-driver": "^5.13.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^6.10.0",
    "joi": "^17.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}

// .env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
PORT=3000

// config/database.js
const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// Test connection
async function testConnection() {
  const session = driver.session();
  try {
    await session.run('RETURN 1');
    console.log('✅ Neo4j connection successful');
  } catch (error) {
    console.error('❌ Neo4j connection failed:', error);
  } finally {
    await session.close();
  }
}

module.exports = { driver, testConnection };

// models/User.js
const { driver } = require('../config/database');

class User {
  static async create(userData) {
    const session = driver.session();
    try {
      const result = await session.run(
        `CREATE (u:User {
          id: randomUUID(),
          username: $username,
          email: $email,
          password: $password,
          fullName: $fullName,
          avatar: $avatar,
          bio: $bio,
          createdAt: datetime(),
          updatedAt: datetime()
        })
        RETURN u`,
        userData
      );
      return result.records[0].get('u').properties;
    } finally {
      await session.close();
    }
  }

  static async findById(id) {
    const session = driver.session();
    try {
      const result = await session.run(
        'MATCH (u:User {id: $id}) RETURN u',
        { id }
      );
      return result.records.length > 0 ? result.records[0].get('u').properties : null;
    } finally {
      await session.close();
    }
  }

  static async findByEmail(email) {
    const session = driver.session();
    try {
      const result = await session.run(
        'MATCH (u:User {email: $email}) RETURN u',
        { email }
      );
      return result.records.length > 0 ? result.records[0].get('u').properties : null;
    } finally {
      await session.close();
    }
  }

  static async update(id, updateData) {
    const session = driver.session();
    try {
      const setClause = Object.keys(updateData).map(key => `u.${key} = $${key}`).join(', ');
      const result = await session.run(
        `MATCH (u:User {id: $id})
         SET ${setClause}, u.updatedAt = datetime()
         RETURN u`,
        { id, ...updateData }
      );
      return result.records[0].get('u').properties;
    } finally {
      await session.close();
    }
  }

  static async delete(id) {
    const session = driver.session();
    try {
      await session.run(
        'MATCH (u:User {id: $id}) DETACH DELETE u',
        { id }
      );
      return true;
    } finally {
      await session.close();
    }
  }

  static async followUser(followerId, followeeId) {
    const session = driver.session();
    try {
      await session.run(
        `MATCH (follower:User {id: $followerId}), (followee:User {id: $followeeId})
         CREATE (follower)-[:FOLLOWS {createdAt: datetime()}]->(followee)`,
        { followerId, followeeId }
      );
      return true;
    } finally {
      await session.close();
    }
  }

  static async unfollowUser(followerId, followeeId) {
    const session = driver.session();
    try {
      await session.run(
        `MATCH (follower:User {id: $followerId})-[r:FOLLOWS]->(followee:User {id: $followeeId})
         DELETE r`,
        { followerId, followeeId }
      );
      return true;
    } finally {
      await session.close();
    }
  }

  static async getFollowers(userId) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (follower:User)-[:FOLLOWS]->(user:User {id: $userId})
         RETURN follower`,
        { userId }
      );
      return result.records.map(record => record.get('follower').properties);
    } finally {
      await session.close();
    }
  }

  static async getFollowing(userId) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (user:User {id: $userId})-[:FOLLOWS]->(following:User)
         RETURN following`,
        { userId }
      );
      return result.records.map(record => record.get('following').properties);
    } finally {
      await session.close();
    }
  }
}

module.exports = User;

// models/Post.js
const { driver } = require('../config/database');

class Post {
  static async create(postData) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (author:User {id: $authorId})
         CREATE (p:Post {
           id: randomUUID(),
           content: $content,
           imageUrl: $imageUrl,
           createdAt: datetime(),
           updatedAt: datetime()
         })
         CREATE (author)-[:AUTHORED]->(p)
         RETURN p, author`,
        postData
      );
      return {
        post: result.records[0].get('p').properties,
        author: result.records[0].get('author').properties
      };
    } finally {
      await session.close();
    }
  }

  static async findById(id) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (p:Post {id: $id})<-[:AUTHORED]-(author:User)
         RETURN p, author`,
        { id }
      );
      if (result.records.length === 0) return null;
      return {
        post: result.records[0].get('p').properties,
        author: result.records[0].get('author').properties
      };
    } finally {
      await session.close();
    }
  }

  static async update(id, updateData) {
    const session = driver.session();
    try {
      const setClause = Object.keys(updateData).map(key => `p.${key} = $${key}`).join(', ');
      const result = await session.run(
        `MATCH (p:Post {id: $id})
         SET ${setClause}, p.updatedAt = datetime()
         RETURN p`,
        { id, ...updateData }
      );
      return result.records[0].get('p').properties;
    } finally {
      await session.close();
    }
  }

  static async delete(id) {
    const session = driver.session();
    try {
      await session.run(
        'MATCH (p:Post {id: $id}) DETACH DELETE p',
        { id }
      );
      return true;
    } finally {
      await session.close();
    }
  }

  static async likePost(userId, postId) {
    const session = driver.session();
    try {
      await session.run(
        `MATCH (user:User {id: $userId}), (post:Post {id: $postId})
         CREATE (user)-[:LIKES {createdAt: datetime()}]->(post)`,
        { userId, postId }
      );
      return true;
    } finally {
      await session.close();
    }
  }

  static async unlikePost(userId, postId) {
    const session = driver.session();
    try {
      await session.run(
        `MATCH (user:User {id: $userId})-[r:LIKES]->(post:Post {id: $postId})
         DELETE r`,
        { userId, postId }
      );
      return true;
    } finally {
      await session.close();
    }
  }

  static async getPostsFromFollowing(userId, limit = 20, skip = 0) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (user:User {id: $userId})-[:FOLLOWS]->(following:User)-[:AUTHORED]->(post:Post)
         RETURN post, following
         ORDER BY post.createdAt DESC
         SKIP $skip LIMIT $limit`,
        { userId, limit, skip }
      );
      return result.records.map(record => ({
        post: record.get('post').properties,
        author: record.get('following').properties
      }));
    } finally {
      await session.close();
    }
  }

  static async getUserPosts(userId, limit = 20, skip = 0) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (user:User {id: $userId})-[:AUTHORED]->(post:Post)
         RETURN post, user
         ORDER BY post.createdAt DESC
         SKIP $skip LIMIT $limit`,
        { userId, limit, skip }
      );
      return result.records.map(record => ({
        post: record.get('post').properties,
        author: record.get('user').properties
      }));
    } finally {
      await session.close();
    }
  }
}

module.exports = Post;

// models/Comment.js
const { driver } = require('../config/database');

class Comment {
  static async create(commentData) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (author:User {id: $authorId}), (post:Post {id: $postId})
         CREATE (c:Comment {
           id: randomUUID(),
           content: $content,
           createdAt: datetime(),
           updatedAt: datetime()
         })
         CREATE (author)-[:COMMENTED]->(c)-[:ON]->(post)
         RETURN c, author, post`,
        commentData
      );
      return {
        comment: result.records[0].get('c').properties,
        author: result.records[0].get('author').properties,
        post: result.records[0].get('post').properties
      };
    } finally {
      await session.close();
    }
  }

  static async getPostComments(postId) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (author:User)-[:COMMENTED]->(comment:Comment)-[:ON]->(post:Post {id: $postId})
         RETURN comment, author
         ORDER BY comment.createdAt ASC`,
        { postId }
      );
      return result.records.map(record => ({
        comment: record.get('comment').properties,
        author: record.get('author').properties
      }));
    } finally {
      await session.close();
    }
  }

  static async update(id, updateData) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (c:Comment {id: $id})
         SET c.content = $content, c.updatedAt = datetime()
         RETURN c`,
        { id, ...updateData }
      );
      return result.records[0].get('c').properties;
    } finally {
      await session.close();
    }
  }

  static async delete(id) {
    const session = driver.session();
    try {
      await session.run(
        'MATCH (c:Comment {id: $id}) DETACH DELETE c',
        { id }
      );
      return true;
    } finally {
      await session.close();
    }
  }
}

module.exports = Comment;

// models/Group.js
const { driver } = require('../config/database');

class Group {
  static async create(groupData) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (creator:User {id: $creatorId})
         CREATE (g:Group {
           id: randomUUID(),
           name: $name,
           description: $description,
           privacy: $privacy,
           avatar: $avatar,
           createdAt: datetime(),
           updatedAt: datetime()
         })
         CREATE (creator)-[:OWNS]->(g)
         CREATE (creator)-[:MEMBER_OF]->(g)
         RETURN g, creator`,
        groupData
      );
      return {
        group: result.records[0].get('g').properties,
        creator: result.records[0].get('creator').properties
      };
    } finally {
      await session.close();
    }
  }

  static async joinGroup(userId, groupId) {
    const session = driver.session();
    try {
      await session.run(
        `MATCH (user:User {id: $userId}), (group:Group {id: $groupId})
         CREATE (user)-[:MEMBER_OF {joinedAt: datetime()}]->(group)`,
        { userId, groupId }
      );
      return true;
    } finally {
      await session.close();
    }
  }

  static async leaveGroup(userId, groupId) {
    const session = driver.session();
    try {
      await session.run(
        `MATCH (user:User {id: $userId})-[r:MEMBER_OF]->(group:Group {id: $groupId})
         DELETE r`,
        { userId, groupId }
      );
      return true;
    } finally {
      await session.close();
    }
  }

  static async getGroupMembers(groupId) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (user:User)-[:MEMBER_OF]->(group:Group {id: $groupId})
         RETURN user`,
        { groupId }
      );
      return result.records.map(record => record.get('user').properties);
    } finally {
      await session.close();
    }
  }

  static async getUserGroups(userId) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (user:User {id: $userId})-[:MEMBER_OF]->(group:Group)
         RETURN group`,
        { userId }
      );
      return result.records.map(record => record.get('group').properties);
    } finally {
      await session.close();
    }
  }
}

module.exports = Group;

// services/RecommendationService.js
const { driver } = require('../config/database');

class RecommendationService {
  // Gợi ý kết bạn dựa trên bạn chung và sở thích chung
  static async getFriendRecommendations(userId, limit = 10) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (user:User {id: $userId})-[:FOLLOWS]->(friend:User)-[:FOLLOWS]->(potential:User)
         WHERE NOT (user)-[:FOLLOWS]->(potential) AND user <> potential
         WITH potential, COUNT(friend) as mutualFriends
         MATCH (potential)-[:MEMBER_OF]->(group:Group)<-[:MEMBER_OF]-(user)
         WITH potential, mutualFriends, COUNT(group) as commonGroups
         RETURN potential, mutualFriends, commonGroups
         ORDER BY mutualFriends DESC, commonGroups DESC
         LIMIT $limit`,
        { userId, limit }
      );
      
      return result.records.map(record => ({
        user: record.get('potential').properties,
        mutualFriends: record.get('mutualFriends').low,
        commonGroups: record.get('commonGroups').low
      }));
    } finally {
      await session.close();
    }
  }

  // Gợi ý group dựa trên group của bạn bè và sở thích
  static async getGroupRecommendations(userId, limit = 10) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (user:User {id: $userId})-[:FOLLOWS]->(friend:User)-[:MEMBER_OF]->(group:Group)
         WHERE NOT (user)-[:MEMBER_OF]->(group)
         WITH group, COUNT(friend) as friendsInGroup
         RETURN group, friendsInGroup
         ORDER BY friendsInGroup DESC
         LIMIT $limit`,
        { userId, limit }
      );
      
      return result.records.map(record => ({
        group: record.get('group').properties,
        friendsInGroup: record.get('friendsInGroup').low
      }));
    } finally {
      await session.close();
    }
  }

  // Gợi ý bài post dựa trên tương tác và trending
  static async getPostRecommendations(userId, limit = 20) {
    const session = driver.session();
    try {
      const result = await session.run(
        `// Posts from users with similar interests
         MATCH (user:User {id: $userId})-[:LIKES]->(likedPost:Post)<-[:LIKES]-(similarUser:User)
         WHERE user <> similarUser
         MATCH (similarUser)-[:AUTHORED]->(recommendedPost:Post)
         WHERE NOT (user)-[:LIKES]->(recommendedPost) AND NOT (user)-[:AUTHORED]->(recommendedPost)
         WITH recommendedPost, COUNT(similarUser) as similarity, similarUser as author
         
         // Get post engagement metrics
         OPTIONAL MATCH (recommendedPost)<-[:LIKES]-(liker:User)
         WITH recommendedPost, similarity, author, COUNT(liker) as likes
         
         OPTIONAL MATCH (recommendedPost)<-[:ON]-(comment:Comment)
         WITH recommendedPost, similarity, author, likes, COUNT(comment) as comments
         
         RETURN recommendedPost, author, similarity, likes, comments,
                (similarity * 0.4 + likes * 0.3 + comments * 0.3) as score
         ORDER BY score DESC
         LIMIT $limit`,
        { userId, limit }
      );
      
      return result.records.map(record => ({
        post: record.get('recommendedPost').properties,
        author: record.get('author').properties,
        score: record.get('score').low,
        metrics: {
          likes: record.get('likes').low,
          comments: record.get('comments').low,
          similarity: record.get('similarity').low
        }
      }));
    } finally {
      await session.close();
    }
  }

  // Trending posts dựa trên engagement gần đây
  static async getTrendingPosts(limit = 20) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (post:Post)<-[:AUTHORED]-(author:User)
         WHERE post.createdAt > datetime() - duration('P7D') // Last 7 days
         
         OPTIONAL MATCH (post)<-[:LIKES]-(liker:User)
         WITH post, author, COUNT(liker) as likes
         
         OPTIONAL MATCH (post)<-[:ON]-(comment:Comment)
         WITH post, author, likes, COUNT(comment) as comments
         
         WITH post, author, likes, comments,
              (likes * 0.6 + comments * 0.4) as engagement
         
         RETURN post, author, likes, comments, engagement
         ORDER BY engagement DESC
         LIMIT $limit`,
        { limit }
      );
      
      return result.records.map(record => ({
        post: record.get('post').properties,
        author: record.get('author').properties,
        metrics: {
          likes: record.get('likes').low,
          comments: record.get('comments').low,
          engagement: record.get('engagement').low
        }
      }));
    } finally {
      await session.close();
    }
  }
}

module.exports = RecommendationService;

// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = authMiddleware;

// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().min(1).max(100).required(),
  bio: Joi.string().max(500).allow(''),
  avatar: Joi.string().uri().allow('')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { username, email, password, fullName, bio = '', avatar = '' } = req.body;

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      bio,
      avatar
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// routes/users.js
const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, bio, avatar } = req.body;
    const updatedUser = await User.update(req.user.id, { fullName, bio, avatar });
    
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Follow user
router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    await User.followUser(req.user.id, req.params.id);
    res.json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unfollow user
router.delete('/:id/follow', authMiddleware, async (req, res) => {
  try {
    await User.unfollowUser(req.user.id, req.params.id);
    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get followers
router.get('/:id/followers', authMiddleware, async (req, res) => {
  try {
    const followers = await User.getFollowers(req.params.id);
    res.json(followers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get following
router.get('/:id/following', authMiddleware, async (req, res) => {
  try {
    const following = await User.getFollowing(req.params.id);
    res.json(following);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// routes/posts.js
const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Create post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content, imageUrl = '' } = req.body;
    const result = await Post.create({
      authorId: req.user.id,
      content,
      imageUrl
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get post by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update post
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { content, imageUrl } = req.body;
    const updatedPost = await Post.update(req.params.id, { content, imageUrl });
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete post
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Post.delete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like post
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    await Post.likePost(req.user.id, req.params.id);
    res.json({ message: 'Post liked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unlike post
router.delete('/:id/like', authMiddleware, async (req, res) => {
  try {
    await Post.unlikePost(req.user.id, req.params.id);
    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get feed (posts from following users)
router.get('/feed/timeline', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit