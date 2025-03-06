import React, { createContext, useContext, useState } from 'react';

const PostsContext = createContext();

export function usePosts() {
  return useContext(PostsContext);
}

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);

  const addPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const findPostById = (postId, postArray) => {
    for (let post of postArray) {
      if (post.id === postId) {
        return post;
      }
      if (post.comments) {
        const found = findPostById(postId, post.comments);
        if (found) return found;
      }
    }
    return null;
  };

  const findParentPost = (postId, postArray) => {
    for (let post of postArray) {
      if (post.comments?.some(comment => comment.id === postId)) {
        return post;
      }
      if (post.comments) {
        const found = findParentPost(postId, post.comments);
        if (found) return found;
      }
    }
    return null;
  };

  const likePost = (postId) => {
    setPosts(prevPosts => {
      const updatePostLikes = (postArray) => {
        return postArray.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1
            };
          }
          if (post.comments) {
            return {
              ...post,
              comments: updatePostLikes(post.comments)
            };
          }
          return post;
        });
      };
      return updatePostLikes(prevPosts);
    });
  };

  const savePost = (postId) => {
    setPosts(prevPosts => {
      const updatePostSaved = (postArray) => {
        return postArray.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              saved: !post.saved
            };
          }
          if (post.comments) {
            return {
              ...post,
              comments: updatePostSaved(post.comments)
            };
          }
          return post;
        });
      };
      return updatePostSaved(prevPosts);
    });
  };

  const repostPost = (postId) => {
    setPosts(prevPosts => {
      const updatePostReposts = (postArray) => {
        return postArray.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              reposted: !post.reposted,
              reposts: (post.reposts || 0) + (post.reposted ? -1 : 1)
            };
          }
          if (post.comments) {
            return {
              ...post,
              comments: updatePostReposts(post.comments)
            };
          }
          return post;
        });
      };
      return updatePostReposts(prevPosts);
    });
  };

  const addReply = async (postId, reply) => {
    setPosts(prevPosts => {
      const addReplyToPost = (postArray) => {
        return postArray.map(post => {
          if (post.id === postId) {
            // Ensure we're not duplicating the reply
            const existingReply = post.comments?.find(c => c.id === reply.id);
            if (existingReply) return post;

            return {
              ...post,
              comments: [...(post.comments || []), {
                ...reply,
                comments: [], // Initialize empty comments array for nested replies
                parentId: post.id // Track direct parent
              }]
            };
          }
          if (post.comments) {
            return {
              ...post,
              comments: addReplyToPost(post.comments)
            };
          }
          return post;
        });
      };
      return addReplyToPost(prevPosts);
    });

    // Return the updated post for navigation
    return findPostById(postId, posts);
  };

  const addComment = (postId, comment) => {
    setPosts(currentPosts =>
      currentPosts.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, comment] }
          : post
      )
    );
  };

  const getTotalReplies = (postId) => {
    const countReplies = (posts) => {
      for (const post of posts) {
        if (post.id === postId) {
          if (!post.comments) return 0;
          return post.comments.reduce((total, comment) => {
            return total + 1 + (comment.comments ? countReplies([comment]) : 0);
          }, 0);
        }
        if (post.comments?.length > 0) {
          const count = countReplies(post.comments);
          if (count > 0) return count;
        }
      }
      return 0;
    };

    return countReplies(posts);
  };

  const value = {
    posts,
    setPosts,
    addPost,
    likePost,
    savePost,
    repostPost,
    addReply,
    addComment,
    getTotalReplies,
    findPostById,
    findParentPost
  };

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
}
