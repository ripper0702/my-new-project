import React from 'react';
import { View, Text, Button } from 'react-native';
import { useStories } from '../context/StoriesContext';

/**
 * A simple component to test the StoriesContext functionality
 * This can be imported into any screen temporarily to debug stories
 */
const StoryContextTest = () => {
  const { stories } = useStories();
  
  // Group stories by username
  const storiesByUser = stories.reduce((acc, story) => {
    const username = story.username;
    if (!acc[username]) {
      acc[username] = [];
    }
    acc[username].push(story);
    return acc;
  }, {});
  
  return (
    <View style={{ padding: 10, margin: 10, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Story Context Debug
      </Text>
      
      {Object.entries(storiesByUser).map(([username, userStories]) => (
        <View key={username} style={{ marginBottom: 15 }}>
          <Text style={{ fontWeight: 'bold' }}>{username} - {userStories.length} stories</Text>
          
          {userStories.map((story, idx) => {
            // Get media items count
            const mediaItemsCount = story.mediaItems ? story.mediaItems.length : (story.media ? 1 : 0);
            
            return (
              <View key={story.id} style={{ marginLeft: 10, marginTop: 5 }}>
                <Text>Story {idx + 1} (ID: {story.id.substring(0, 6)}...)</Text>
                <Text>Media Items: {mediaItemsCount}</Text>
                <Text>Legacy Media: {story.media ? '✓' : '✗'}</Text>
                <Text>MediaItems Array: {story.mediaItems ? '✓' : '✗'}</Text>
                <Text>Story Caption: {story.caption || 'None'}</Text>
                
                {story.mediaItems && story.mediaItems.map((item, mIdx) => (
                  <View key={mIdx} style={{ marginLeft: 15, marginTop: 2, padding: 2, backgroundColor: '#e0e0e0', borderRadius: 4 }}>
                    <Text style={{ fontSize: 12, color: '#555' }}>
                      Media {mIdx + 1}: {item.type}, URI: {item.uri.substring(0, 20)}...
                    </Text>
                    <Text style={{ fontSize: 12, color: '#007700' }}>
                      Caption: {item.caption || 'None'}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

export default StoryContextTest;
