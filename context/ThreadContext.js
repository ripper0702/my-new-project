import React, { createContext, useContext, useState, useCallback } from 'react';
import { Share } from 'react-native';

const ThreadContext = createContext();

// Mock replies data
const mockReplies = {
  '1': [
    {
      id: '1-1',
      username: 'Emma',
      userAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      verified: true,
      timestamp: '1h',
      text: 'That looks amazing! What recipe did you use? 😊',
      likes: 12,
      replies: 1,
      reposts: 2,
      shares: 0,
      hasThread: true
    },
    {
      id: '1-2',
      username: 'Lisa',
      userAvatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      verified: false,
      timestamp: '30m',
      text: 'Mother-daughter time is the best! ❤️',
      likes: 8,
      replies: 0,
      reposts: 1,
      shares: 0,
      hasThread: false
    }
  ],
  '2': [
    {
      id: '2-1',
      username: 'Sarah',
      userAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      verified: true,
      timestamp: '2h',
      text: 'Totally relate to this! 😅',
      likes: 15,
      replies: 0,
      reposts: 3,
      shares: 1,
      hasThread: false
    }
  ]
};

export const ThreadProvider = ({ children }) => {
  const [threads, setThreads] = useState([
    {
      id: '1',
      username: 'John',
      userAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      verified: true,
      timestamp: '2h',
      text: 'Just made the best breakfast ever! 🍳',
      likes: 20,
      replies: 2,
      reposts: 5,
      shares: 1,
      hasThread: true
    },
    {
      id: '2',
      username: 'Jane',
      userAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      verified: false,
      timestamp: '1h',
      text: 'Just got back from the best vacation ever! 🏖️',
      likes: 15,
      replies: 1,
      reposts: 3,
      shares: 1,
      hasThread: false
    }
  ]);
  const [likes, setLikes] = useState(new Set());
  const [reposts, setReposts] = useState(new Set());
  const [repliesMap, setRepliesMap] = useState(new Map(Object.entries(mockReplies)));

  const getReplies = useCallback((threadId) => {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        const replies = mockReplies[threadId] || [];
        resolve(replies);
      }, 500);
    });
  }, []);

  const handleLike = useCallback((threadId) => {
    setLikes(prev => {
      const newLikes = new Set(prev);
      if (newLikes.has(threadId)) {
        newLikes.delete(threadId);
      } else {
        newLikes.add(threadId);
      }
      return newLikes;
    });

    // Update thread likes count
    setThreads(prev => prev.map(thread => {
      if (thread.id === threadId) {
        const isLiked = likes.has(threadId);
        return {
          ...thread,
          likes: thread.likes + (isLiked ? -1 : 1)
        };
      }
      return thread;
    }));
  }, [likes]);

  const handleRepost = useCallback((threadId) => {
    setReposts(prev => {
      const newReposts = new Set(prev);
      if (newReposts.has(threadId)) {
        newReposts.delete(threadId);
      } else {
        newReposts.add(threadId);
      }
      return newReposts;
    });

    // Update thread repost count
    setThreads(prev => prev.map(thread => {
      if (thread.id === threadId) {
        const isReposted = reposts.has(threadId);
        return {
          ...thread,
          reposts: thread.reposts + (isReposted ? -1 : 1)
        };
      }
      return thread;
    }));
  }, [reposts]);

  const handleReply = useCallback((threadId, replyText) => {
    const newReply = {
      id: Date.now().toString(),
      username: 'You',
      userAvatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      verified: false,
      timestamp: 'now',
      text: replyText,
      likes: 0,
      replies: 0,
      reposts: 0,
      shares: 0,
      hasThread: false
    };

    // Update the mock replies
    if (!mockReplies[threadId]) {
      mockReplies[threadId] = [];
    }
    mockReplies[threadId].unshift(newReply);

    // Update the replies map
    setRepliesMap(new Map(Object.entries(mockReplies)));

    // Update thread reply count
    setThreads(prev => prev.map(thread => {
      if (thread.id === threadId) {
        return {
          ...thread,
          replies: (thread.replies || 0) + 1
        };
      }
      return thread;
    }));
  }, []);

  const handleShare = useCallback(async (thread) => {
    try {
      const result = await Share.share({
        message: `${thread.text}\n\nShared from NUUMI`,
        title: 'Share Thread'
      });
      
      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, []);

  const getThread = useCallback((threadId) => {
    return new Promise((resolve) => {
      const thread = threads.find(t => t.id === threadId);
      resolve(thread);
    });
  }, [threads]);

  const value = {
    threads,
    getThread,
    getReplies,
    handleLike,
    handleRepost,
    handleReply,
    handleShare,
    isLiked: (threadId) => likes.has(threadId),
    isReposted: (threadId) => reposts.has(threadId)
  };

  return (
    <ThreadContext.Provider value={value}>
      {children}
    </ThreadContext.Provider>
  );
};

export const useThread = () => {
  const context = useContext(ThreadContext);
  if (!context) {
    throw new Error('useThread must be used within a ThreadProvider');
  }
  return context;
};
