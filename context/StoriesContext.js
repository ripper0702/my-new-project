import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import { useUser } from './UserContext';

const StoriesContext = createContext();

export const StoriesProvider = ({ children }) => {
  const [stories, setStories] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [archivedStories, setArchivedStories] = useState([]);
  const { userProfile } = useUser();

  // Load stories from storage on mount
  useEffect(() => {
    loadStories();
    loadHighlights();
    loadArchivedStories();
  }, []);

  const loadStories = async () => {
    try {
      const savedStories = await AsyncStorage.getItem('stories');
      if (savedStories) {
        const parsedStories = JSON.parse(savedStories);
        console.log("[StoriesContext] Loaded stories:", JSON.stringify(parsedStories, null, 2));
        setStories(parsedStories);
      } else {
        console.log("[StoriesContext] No saved stories found");
      }
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  };

  const loadHighlights = async () => {
    try {
      const savedHighlights = await AsyncStorage.getItem('highlights');
      if (savedHighlights) {
        setHighlights(JSON.parse(savedHighlights));
      }
    } catch (error) {
      console.error('Error loading highlights:', error);
    }
  };

  const loadArchivedStories = async () => {
    try {
      const saved = await AsyncStorage.getItem('archivedStories');
      if (saved) {
        setArchivedStories(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading archived stories:', error);
    }
  };

  // Sample data for testing viewers and comments
  const sampleViewers = [
    {
      username: 'user123',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      timestamp: '5m ago'
    },
    {
      username: 'jane_doe',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      timestamp: '12m ago'
    },
    {
      username: 'john_smith',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      timestamp: '25m ago'
    }
  ];

  const sampleComments = [
    {
      username: 'user123',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      text: 'This looks amazing! 😍',
      timestamp: '8m ago'
    },
    {
      username: 'travel_guy',
      avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
      text: 'Where is this place? I need to visit!',
      timestamp: '15m ago'
    }
  ];

  const addStory = async (media, options = {}) => {
    try {
      console.log("[StoriesContext] Adding story with media:", JSON.stringify(media, null, 2));
      console.log("[StoriesContext] Options:", JSON.stringify(options, null, 2));
      console.log("[StoriesContext] Current stories:", JSON.stringify(stories, null, 2));
      
      // Convert single media to array if it's not already
      let newMediaItem = Array.isArray(media) ? [...media] : [media];
      
      // Add caption to the first media item (which is the one being uploaded now)
      if (options.caption) {
        newMediaItem = newMediaItem.map((item, index) => {
          if (index === 0) {
            return { ...item, caption: options.caption };
          }
          return item;
        });
      }
      
      console.log("[StoriesContext] Media items after processing:", JSON.stringify(newMediaItem, null, 2));
      
      // Check if the current user already has a story
      const existingUserStoryIndex = stories.findIndex(
        story => story.username === userProfile.username
      );
      console.log("[StoriesContext] Existing user story index:", existingUserStoryIndex);

      let updatedStories = [...stories];

      if (existingUserStoryIndex !== -1) {
        // User already has a story, append the new media to it
        console.log("[StoriesContext] User already has a story, appending new media");
        
        // Create a deep copy of the existing story to avoid mutation issues
        const existingStory = JSON.parse(JSON.stringify(stories[existingUserStoryIndex]));
        
        // Extract existing media items or initialize array
        // First check if we have the mediaItems array
        let existingMediaItems = [];
        if (existingStory.mediaItems && Array.isArray(existingStory.mediaItems)) {
          existingMediaItems = [...existingStory.mediaItems];
        } 
        // If we don't have mediaItems but have the legacy media property, use that
        else if (existingStory.media) {
          // If the existing media item doesn't have a caption property, add it
          const legacyMedia = { ...existingStory.media };
          if (existingStory.caption && !legacyMedia.caption) {
            legacyMedia.caption = existingStory.caption;
          }
          existingMediaItems = [legacyMedia];
        }
        
        console.log("[StoriesContext] Existing media items before update:", JSON.stringify(existingMediaItems, null, 2));
        
        // Add the new media to the beginning of the array
        const updatedMediaItems = [...newMediaItem, ...existingMediaItems];
        console.log("[StoriesContext] Updated media items:", JSON.stringify(updatedMediaItems, null, 2));
        
        // Update the story with the combined media items
        existingStory.mediaItems = updatedMediaItems;
        
        // Update the first media as the primary media (for backward compatibility)
        existingStory.media = updatedMediaItems[0];
        
        // Reset the timestamp to keep the story fresh
        existingStory.timestamp = new Date().toISOString();
        existingStory.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        
        // Update allowComments if provided in options
        if (options.allowComments !== undefined) {
          existingStory.allowComments = options.allowComments;
        }
        
        // Update the story in the stories array
        updatedStories[existingUserStoryIndex] = existingStory;
      } else {
        // User does not have a story, create a new one
        console.log("[StoriesContext] Creating new story for user");
        const newStory = {
          id: Date.now().toString(),
          username: userProfile.username,
          userAvatar: userProfile.avatar,
          mediaItems: newMediaItem,
          media: newMediaItem[0], // For backward compatibility
          hasStory: true,
          timestamp: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          viewers: [...sampleViewers], // Add sample viewers
          comments: [...sampleComments], // Add sample comments
          allowComments: options.allowComments ?? true,
          isArchived: false,
          savedToPhone: false
        };

        // Add the new story to the beginning of the array for visibility
        updatedStories = [newStory, ...updatedStories.filter(story => story.username !== userProfile.username)];
      }

      // Update state and storage
      console.log("[StoriesContext] Saving updated stories:", JSON.stringify(updatedStories, null, 2));
      setStories(updatedStories);
      await AsyncStorage.setItem('stories', JSON.stringify(updatedStories));

      // Save to phone if requested
      if (options.saveToPhone) {
        for (const item of newMediaItem) {
          await saveToPhone(item);
        }
      }

      // Return the updated or new story
      const userStory = updatedStories.find(story => story.username === userProfile.username);
      console.log("[StoriesContext] Returning user story:", JSON.stringify(userStory, null, 2));
      return userStory;
    } catch (error) {
      console.error('[StoriesContext] Error adding story:', error);
      throw error;
    }
  };

  const saveToPhone = async (media) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library was denied');
      }

      await MediaLibrary.saveToLibraryAsync(media.uri);
    } catch (error) {
      console.error('Error saving to phone:', error);
      throw error;
    }
  };

  const addCommentToStory = async (storyId, comment) => {
    try {
      console.log("[StoriesContext] Adding comment to story:", storyId);
      console.log("[StoriesContext] Comment data:", JSON.stringify(comment, null, 2));
      
      // Find the story by ID
      const storyIndex = stories.findIndex(story => story.id === storyId);
      
      if (storyIndex === -1) {
        console.error("[StoriesContext] Story not found with ID:", storyId);
        return null;
      }
      
      // Create a deep copy of the stories array to avoid mutation issues
      const updatedStories = JSON.parse(JSON.stringify(stories));
      
      // Create a formatted comment object
      const newComment = {
        username: comment.username || userProfile.username,
        avatar: comment.avatar || userProfile.avatar,
        text: comment.text,
        timestamp: comment.timestamp || 'Just now'
      };
      
      // Add the comment to the story
      if (!updatedStories[storyIndex].comments) {
        updatedStories[storyIndex].comments = [];
      }
      
      // Add the new comment to the beginning of the array
      updatedStories[storyIndex].comments = [
        newComment,
        ...updatedStories[storyIndex].comments
      ];
      
      // Update state and storage
      setStories(updatedStories);
      await AsyncStorage.setItem('stories', JSON.stringify(updatedStories));
      
      return updatedStories[storyIndex];
    } catch (error) {
      console.error('[StoriesContext] Error adding comment to story:', error);
      throw error;
    }
  };

  const saveStory = async (updatedStory) => {
    try {
      const storyIndex = stories.findIndex(story => story.id === updatedStory.id);
      
      if (storyIndex === -1) {
        console.error("[StoriesContext] Cannot save - Story not found with ID:", updatedStory.id);
        return null;
      }
      
      // Create a deep copy of the stories array
      const updatedStories = JSON.parse(JSON.stringify(stories));
      
      // Update the story
      updatedStories[storyIndex] = updatedStory;
      
      // Update state and storage
      setStories(updatedStories);
      await AsyncStorage.setItem('stories', JSON.stringify(updatedStories));
      
      return updatedStory;
    } catch (error) {
      console.error('[StoriesContext] Error saving story:', error);
      throw error;
    }
  };

  const deleteStory = async (storyId) => {
    try {
      console.log("[StoriesContext] Deleting story:", storyId);
      
      // Find the story index
      const storyIndex = stories.findIndex(story => story.id === storyId);
      
      if (storyIndex === -1) {
        console.error("[StoriesContext] Story not found with ID:", storyId);
        return false;
      }
      
      // Create a deep copy and remove the story
      const updatedStories = JSON.parse(JSON.stringify(stories));
      updatedStories.splice(storyIndex, 1);
      
      // Update state and storage
      setStories(updatedStories);
      await AsyncStorage.setItem('stories', JSON.stringify(updatedStories));
      
      console.log("[StoriesContext] Story deleted successfully");
      return true;
    } catch (error) {
      console.error('[StoriesContext] Error deleting story:', error);
      throw error;
    }
  };

  const addToHighlights = async (storyId, highlightName) => {
    try {
      const story = stories.find(s => s.id === storyId);
      if (!story) return;

      const highlight = {
        id: Date.now().toString(),
        name: highlightName,
        stories: [story],
        timestamp: new Date().toISOString()
      };

      const updatedHighlights = [highlight, ...highlights];
      setHighlights(updatedHighlights);
      await AsyncStorage.setItem('highlights', JSON.stringify(updatedHighlights));
    } catch (error) {
      console.error('Error adding to highlights:', error);
      throw error;
    }
  };

  const removeFromHighlights = async (highlightId) => {
    try {
      console.log("[StoriesContext] Removing highlight:", highlightId);
      
      // Find the highlight index
      const highlightIndex = highlights.findIndex(highlight => highlight.id === highlightId);
      
      if (highlightIndex === -1) {
        console.error("[StoriesContext] Highlight not found with ID:", highlightId);
        return false;
      }
      
      // Create a deep copy and remove the highlight
      const updatedHighlights = JSON.parse(JSON.stringify(highlights));
      updatedHighlights.splice(highlightIndex, 1);
      
      // Update state and storage
      setHighlights(updatedHighlights);
      await AsyncStorage.setItem('highlights', JSON.stringify(updatedHighlights));
      
      console.log("[StoriesContext] Highlight removed successfully");
      return true;
    } catch (error) {
      console.error('[StoriesContext] Error removing highlight:', error);
      throw error;
    }
  };

  const archiveStory = async (storyId) => {
    try {
      const story = stories.find(s => s.id === storyId);
      if (!story) return;

      // Remove from stories
      const updatedStories = stories.filter(s => s.id !== storyId);
      setStories(updatedStories);
      await AsyncStorage.setItem('stories', JSON.stringify(updatedStories));

      // Add to archived
      const updatedArchived = [{ ...story, isArchived: true }, ...archivedStories];
      setArchivedStories(updatedArchived);
      await AsyncStorage.setItem('archivedStories', JSON.stringify(updatedArchived));
    } catch (error) {
      console.error('Error archiving story:', error);
      throw error;
    }
  };

  const toggleComments = async (storyId) => {
    try {
      const updatedStories = stories.map(story => {
        if (story.id === storyId) {
          return {
            ...story,
            allowComments: !story.allowComments
          };
        }
        return story;
      });

      setStories(updatedStories);
      await AsyncStorage.setItem('stories', JSON.stringify(updatedStories));
    } catch (error) {
      console.error('Error toggling comments:', error);
      throw error;
    }
  };

  const addComment = async (storyId, comment) => {
    try {
      const updatedStories = stories.map(story => {
        if (story.id === storyId && story.allowComments) {
          return {
            ...story,
            comments: [...story.comments, {
              id: Date.now().toString(),
              username: userProfile.username,
              text: comment,
              timestamp: new Date().toISOString()
            }]
          };
        }
        return story;
      });

      setStories(updatedStories);
      await AsyncStorage.setItem('stories', JSON.stringify(updatedStories));
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  // Add this function to handle story replies
  const addReplyToStory = async (storyId, reply) => {
    try {
      console.log("[StoriesContext] Adding reply to story:", storyId);
      console.log("[StoriesContext] Reply data:", JSON.stringify(reply, null, 2));
      
      // Find the story by ID
      const storyIndex = stories.findIndex(story => story.id === storyId);
      
      if (storyIndex === -1) {
        console.error("[StoriesContext] Story not found with ID:", storyId);
        return null;
      }
      
      // Create a deep copy of the stories array to avoid mutation issues
      const updatedStories = JSON.parse(JSON.stringify(stories));
      
      // Initialize replies array if it doesn't exist
      if (!updatedStories[storyIndex].replies) {
        updatedStories[storyIndex].replies = [];
      }
      
      // Add the new reply
      updatedStories[storyIndex].replies.push({
        id: Date.now().toString(),
        username: reply.username || userProfile.username,
        avatar: reply.avatar || userProfile.avatar,
        text: reply.text,
        timestamp: reply.timestamp || new Date().toISOString()
      });
      
      // Update state and storage
      setStories(updatedStories);
      await AsyncStorage.setItem('stories', JSON.stringify(updatedStories));
      
      return updatedStories[storyIndex];
    } catch (error) {
      console.error('[StoriesContext] Error adding reply to story:', error);
      throw error;
    }
  };

  // Add this function to track story views
  const viewStory = async (storyId) => {
    try {
      console.log("[StoriesContext] Viewing story:", storyId);
      
      // Find the story by ID
      const storyIndex = stories.findIndex(story => story.id === storyId);
      
      if (storyIndex === -1) {
        console.error("[StoriesContext] Story not found with ID:", storyId);
        return null;
      }
      
      // Create a deep copy of the stories array
      const updatedStories = JSON.parse(JSON.stringify(stories));
      
      // Initialize viewCount if it doesn't exist
      if (!updatedStories[storyIndex].viewCount) {
        updatedStories[storyIndex].viewCount = 0;
      }
      
      // Increment view count
      updatedStories[storyIndex].viewCount += 1;
      
      // Add current user to viewers if not already there
      if (!updatedStories[storyIndex].viewers.some(viewer => viewer.username === userProfile.username)) {
        updatedStories[storyIndex].viewers.push({
          username: userProfile.username,
          avatar: userProfile.avatar,
          timestamp: new Date().toISOString()
        });
      }
      
      // Update state and storage
      setStories(updatedStories);
      await AsyncStorage.setItem('stories', JSON.stringify(updatedStories));
      
      return updatedStories[storyIndex];
    } catch (error) {
      console.error('[StoriesContext] Error tracking story view:', error);
      throw error;
    }
  };

  const value = {
    stories,
    highlights,
    archivedStories,
    addStory,
    addCommentToStory,
    addReplyToStory,
    viewStory,
    saveStory,
    archiveStory,
    deleteStory,
    addToHighlights,
    removeFromHighlights,
    saveToPhone
  };

  return (
    <StoriesContext.Provider value={value}>
      {children}
    </StoriesContext.Provider>
  );
};

export const useStories = () => {
  const context = useContext(StoriesContext);
  if (!context) {
    throw new Error('useStories must be used within a StoriesProvider');
  }
  return context;
};

