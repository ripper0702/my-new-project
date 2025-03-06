import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';

// Sample initial stories data - in a real app, this would come from an API
const initialStories = [
{
    id: '1',
    userId: 'user1',
    username: 'emmawatson',
    userImage: 'https://randomuser.me/api/portraits/women/10.jpg',
    content: [
    {
        id: 'story1',
        type: 'image',
        url: 'https://picsum.photos/id/1/400/700',
        timestamp: new Date().getTime() - 3600000, // 1 hour ago
        viewed: false,
    }
    ],
    hasNewStory: true,
    isLive: false,
},
{
    id: '2',
    userId: 'user2',
    username: 'tomholland',
    userImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    content: [
    {
        id: 'story2',
        type: 'image',
        url: 'https://picsum.photos/id/15/400/700',
        timestamp: new Date().getTime() - 7200000, // 2 hours ago
        viewed: false,
    },
    {
        id: 'story3',
        type: 'image',
        url: 'https://picsum.photos/id/17/400/700',
        timestamp: new Date().getTime() - 5000000, // Less than 2 hours ago
        viewed: false,
    }
    ],
    hasNewStory: true,
    isLive: true,
},
{
    id: '3',
    userId: 'user3',
    username: 'zendaya',
    userImage: 'https://randomuser.me/api/portraits/women/23.jpg',
    content: [
    {
        id: 'story4',
        type: 'image',
        url: 'https://picsum.photos/id/65/400/700',
        timestamp: new Date().getTime() - 43200000, // 12 hours ago
        viewed: true,
    }
    ],
    hasNewStory: false,
    isLive: false,
},
];

// Create context
const StoryContext = createContext();

export const useStories = () => useContext(StoryContext);

export const StoryProvider = ({ children }) => {
const [stories, setStories] = useState(initialStories);
const [activeStory, setActiveStory] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// Fetch stories from API (simulated)
const fetchStories = async () => {
    try {
    setLoading(true);
    setError(null);
    // In a real app, fetch from API
    // const response = await fetch('api/stories');
    // const data = await response.json();
    // setStories(data);
    
    // For now, just use the initial stories with a delay to simulate fetch
    setTimeout(() => {
        setStories(initialStories);
        setLoading(false);
    }, 500);
    } catch (err) {
    setError("Failed to fetch stories");
    setLoading(false);
    Alert.alert("Error", "Could not load stories");
    }
};

// Get all stories
const getAllStories = () => {
    return stories;
};

// Get stories for a specific user
const getUserStories = (userId) => {
    return stories.filter(story => story.userId === userId);
};

// View a story
const viewStory = (storyId) => {
    // Find the story that contains the content with this ID
    const updatedStories = stories.map(story => {
    const updatedContent = story.content.map(item => {
        if (item.id === storyId) {
        return { ...item, viewed: true };
        }
        return item;
    });
    
    // Check if all content items are viewed
    const allViewed = updatedContent.every(item => item.viewed);
    
    return {
        ...story,
        content: updatedContent,
        hasNewStory: !allViewed
    };
    });
    
    setStories(updatedStories);
    return updatedStories.find(story => 
    story.content.some(item => item.id === storyId)
    );
};

// Open story viewer
const openStoryViewer = (storyId) => {
    const story = stories.find(s => s.id === storyId);
    if (story) {
    setActiveStory(story);
    // Mark all content items in this story as viewed
    viewUserStories(story.userId);
    return story;
    }
    return null;
};

// Close story viewer
const closeStoryViewer = () => {
    setActiveStory(null);
};

// View all stories from a specific user
const viewUserStories = (userId) => {
    const updatedStories = stories.map(story => {
    if (story.userId === userId) {
        const updatedContent = story.content.map(item => ({
        ...item,
        viewed: true
        }));
        
        return {
        ...story,
        content: updatedContent,
        hasNewStory: false
        };
    }
    return story;
    });
    
    setStories(updatedStories);
};

// Add a new story
const addStory = (userId, content) => {
    try {
    // In a real app, this would be an API call
    const newStoryContent = {
        id: `story-${Date.now()}`,
        type: content.type,
        url: content.url,
        timestamp: new Date().getTime(),
        viewed: false,
    };
    
    const updatedStories = stories.map(story => {
        if (story.userId === userId) {
        return {
            ...story,
            content: [...story.content, newStoryContent],
            hasNewStory: true
        };
        }
        return story;
    });
    
    setStories(updatedStories);
    return true;
    } catch (err) {
    setError("Failed to add story");
    Alert.alert("Error", "Could not add story");
    return false;
    }
};

// Check if user has viewed all stories
const hasViewedAllStories = (userId) => {
    const userStory = stories.find(story => story.userId === userId);
    if (!userStory) return true;
    
    return userStory.content.every(item => item.viewed);
};

// Load stories on initial mount
useEffect(() => {
    fetchStories();
}, []);

const value = {
    stories,
    loading,
    error,
    activeStory,
    getAllStories,
    getUserStories,
    viewStory,
    viewUserStories,
    addStory,
    openStoryViewer,
    closeStoryViewer,
    hasViewedAllStories,
    refreshStories: fetchStories
};

return (
    <StoryContext.Provider value={value}>
    {children}
    </StoryContext.Provider>
);
};

export default StoryContext;

