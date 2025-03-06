import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useStories } from '../context/StoriesContext';

/**
 * A debugging component to check what stories and media items are currently in the store
 */
const StoryDebugger = () => {
  const { stories } = useStories();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Story Debugger</Text>
      <Text style={styles.subheader}>Total stories: {stories.length}</Text>
      
      <ScrollView style={styles.storyList}>
        {stories.map((story, index) => (
          <View key={story.id} style={styles.storyItem}>
            <Text style={styles.storyTitle}>
              Story {index + 1}: {story.username}
            </Text>
            <Text style={styles.storyDetail}>
              ID: {story.id}
            </Text>
            <Text style={styles.storyDetail}>
              Media items: {story.mediaItems?.length || 0}
            </Text>
            {story.mediaItems?.map((item, mIndex) => (
              <Text key={mIndex} style={styles.mediaItem}>
                {mIndex + 1}. {item.type}: {item.uri.substring(0, 30)}...
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
      
      <Text style={styles.hint}>
        Check the console logs for more detailed information
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    marginBottom: 16,
  },
  storyList: {
    maxHeight: 300,
  },
  storyItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF69B4',
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  storyDetail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  mediaItem: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    marginTop: 2,
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginTop: 12,
    fontStyle: 'italic',
  },
});

export default StoryDebugger;
