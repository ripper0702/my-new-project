import React, { createContext, useContext, useState, useCallback } from 'react';
import { Share } from 'react-native';

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [repostedPosts, setRepostedPosts] = useState(new Set());
  const [repliesMap, setRepliesMap] = useState(new Map());

  const getPost = useCallback((postId) => {
    return new Promise((resolve) => {
      // Find the post in our posts array
      const post = posts.find(p => p.id === postId);
      resolve(post);
    });
  }, [posts]);

  const getReplies = useCallback((postId) => {
    return new Promise((resolve) => {
      // Get replies from our repliesMap
      const replies = repliesMap.get(postId) || [];
      resolve(replies);
    });
  }, [repliesMap]);

  const handleLike = useCallback((postId) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    // Update post likes count
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isLiked = likedPosts.has(postId);
        return {
          ...post,
          likes: post.likes + (isLiked ? -1 : 1)
        };
      }
      return post;
    }));
  }, [likedPosts]);

  const handleRepost = useCallback((postId) => {
    setRepostedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    // Update post repost count
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isReposted = repostedPosts.has(postId);
        return {
          ...post,
          reposts: post.reposts + (isReposted ? -1 : 1)
        };
      }
      return post;
    }));
  }, [repostedPosts]);

  const handleReply = useCallback((postId, replyText) => {
    const newReply = {
      id: Date.now().toString(),
      parentId: postId,
      username: 'currentUser', // Replace with actual user
      userAvatar: 'https://randomuser.me/api/portraits/women/1.jpg', // Replace with actual avatar
      verified: false,
      text: replyText,
      timestamp: 'now',
      likes: 0,
      replies: 0,
      reposts: 0,
      hasThread: true
    };

    // Update posts array
    setPosts(prev => {
      const updatedPosts = prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            replies: (post.replies || 0) + 1
          };
        }
        return post;
      });
      return [...updatedPosts, newReply];
    });

    // Update replies map
    setRepliesMap(prev => {
      const newMap = new Map(prev);
      const existingReplies = newMap.get(postId) || [];
      newMap.set(postId, [...existingReplies, newReply]);
      return newMap;
    });
  }, []);

  const handleShare = useCallback(async (post) => {
    try {
      const result = await Share.share({
        message: `${post.text}\n\nShared from NUUMI`,
        title: 'Share Post'
      });
      
      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, []);

  const isLiked = (postId) => likedPosts.has(postId);
  const isReposted = (postId) => repostedPosts.has(postId);

  const value = {
    posts,
    setPosts,
    likedPosts,
    repostedPosts,
    repliesMap,
    setRepliesMap,
    handleLike,
    handleRepost,
    handleReply,
    handleShare,
    getPost,
    getReplies,
    isLiked,
    isReposted
  };

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
};
