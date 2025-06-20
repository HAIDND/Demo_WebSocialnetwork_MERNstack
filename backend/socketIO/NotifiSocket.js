// notification-examples.js
// Import the socket functions
const {
  createAndEmitNotification,
  emitNotificationToUserId,
} = require("./socket");

// Example 1: Like Post Notification
async function handleLikePost(postId, likerId) {
  try {
    // Get post and liker info from database
    const post = await Post.findById(postId).populate("userId");
    const liker = await User.findById(likerId);

    // Create notification in database
    await createNotification({
      userId: post.userId._id,
      type: "like_post",
      sender: {
        id: liker._id,
        username: liker.username,
        avatar: liker.avatar,
      },
      messageNote: `${liker.username} đã thích bài viết của bạn.`,
      linkClick: `/post/${post._id}`,
      postId,
    });

    // Send real-time notification
    await createAndEmitNotification({
      userId: post.userId._id,
      type: "like_post",
      sender: {
        id: liker._id,
        username: liker.username,
        avatar: liker.avatar,
      },
      messageNote: `${liker.username} đã thích bài viết của bạn.`,
      linkClick: `/post/${post._id}`,
      postId,
    });
  } catch (error) {
    console.error("Error handling like post:", error);
  }
}

// Example 2: Comment Notification
async function handleCommentPost(postId, commenterId, commentText) {
  try {
    const post = await Post.findById(postId).populate("userId");
    const commenter = await User.findById(commenterId);

    await createAndEmitNotification({
      userId: post.userId._id,
      type: "comment_post",
      sender: {
        id: commenter._id,
        username: commenter.username,
        avatar: commenter.avatar,
      },
      messageNote: `${commenter.username} đã bình luận bài viết của bạn.`,
      linkClick: `/post/${post._id}#comments`,
      postId,
      commentText: commentText.substring(0, 100), // Truncate long comments
    });
  } catch (error) {
    console.error("Error handling comment:", error);
  }
}

// Example 3: Follow Notification
async function handleFollowUser(followerId, followedId) {
  try {
    const follower = await User.findById(followerId);

    await createAndEmitNotification({
      userId: followedId,
      type: "follow_user",
      sender: {
        id: follower._id,
        username: follower.username,
        avatar: follower.avatar,
      },
      messageNote: `${follower.username} đã theo dõi bạn.`,
      linkClick: `/profile/${follower.username}`,
    });
  } catch (error) {
    console.error("Error handling follow:", error);
  }
}

// Example 4: Friend Request Notification
async function handleFriendRequest(senderId, receiverId) {
  try {
    const sender = await User.findById(senderId);

    await createAndEmitNotification({
      userId: receiverId,
      type: "friend_request",
      sender: {
        id: sender._id,
        username: sender.username,
        avatar: sender.avatar,
      },
      messageNote: `${sender.username} đã gửi lời mời kết bạn.`,
      linkClick: `/friends/requests`,
    });
  } catch (error) {
    console.error("Error handling friend request:", error);
  }
}

// Example 5: Message Notification (when user is offline)
async function handleOfflineMessage(senderId, receiverId, messageContent) {
  try {
    const sender = await User.findById(senderId);

    await createAndEmitNotification({
      userId: receiverId,
      type: "new_message",
      sender: {
        id: sender._id,
        username: sender.username,
        avatar: sender.avatar,
      },
      messageNote: `${sender.username} đã gửi tin nhắn cho bạn.`,
      linkClick: `/messages/${sender._id}`,
      messagePreview: messageContent.substring(0, 50),
    });
  } catch (error) {
    console.error("Error handling offline message:", error);
  }
}

// Example 6: Group Invite Notification
async function handleGroupInvite(inviterId, invitedId, groupId) {
  try {
    const inviter = await User.findById(inviterId);
    const group = await Group.findById(groupId);

    await createAndEmitNotification({
      userId: invitedId,
      type: "group_invite",
      sender: {
        id: inviter._id,
        username: inviter.username,
        avatar: inviter.avatar,
      },
      messageNote: `${inviter.username} đã mời bạn tham gia nhóm "${group.name}".`,
      linkClick: `/groups/${groupId}/invite`,
      groupId,
    });
  } catch (error) {
    console.error("Error handling group invite:", error);
  }
}

// Example 7: Post Share Notification
async function handleSharePost(postId, sharerId, originalPostOwnerId) {
  try {
    const sharer = await User.findById(sharerId);
    const post = await Post.findById(postId);

    await createAndEmitNotification({
      userId: originalPostOwnerId,
      type: "share_post",
      sender: {
        id: sharer._id,
        username: sharer.username,
        avatar: sharer.avatar,
      },
      messageNote: `${sharer.username} đã chia sẻ bài viết của bạn.`,
      linkClick: `/post/${postId}`,
      postId,
    });
  } catch (error) {
    console.error("Error handling post share:", error);
  }
}

// Example 8: Live Stream Start Notification
async function handleLiveStreamStart(streamerId, followerIds) {
  try {
    const streamer = await User.findById(streamerId);

    // Notify all followers
    for (const followerId of followerIds) {
      await createAndEmitNotification({
        userId: followerId,
        type: "live_stream_start",
        sender: {
          id: streamer._id,
          username: streamer.username,
          avatar: streamer.avatar,
        },
        messageNote: `${streamer.username} đã bắt đầu phát trực tiếp.`,
        linkClick: `/live/${streamer._id}`,
      });
    }
  } catch (error) {
    console.error("Error handling live stream start:", error);
  }
}

module.exports = {
  handleLikePost,
  handleCommentPost,
  handleFollowUser,
  handleFriendRequest,
  handleOfflineMessage,
  handleGroupInvite,
  handleSharePost,
  handleLiveStreamStart,
};
