import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useStories } from '../context/StoriesContext';
import { useUser } from '../context/UserContext';

const StoryItem = ({ story, isCurrentUser }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  // Determine if user has an active story by checking mediaItems or legacy media
  const hasActiveStory = story?.mediaItems?.length > 0 || story?.media;
  
  // Get the first media thumbnail to display
  const getStoryThumbnail = () => {
    if (story?.mediaItems?.length > 0) {
      return story.mediaItems[0].uri;
    } else if (story?.media) {
      return story.media.uri;
    }
    return null;
  };
  
  const handleStoryPress = () => {
    if (hasActiveStory) {
      // Add debug logging
      console.log("[Stories] Opening story:", JSON.stringify(story, null, 2));
      
      // If the story has media, pass the entire story object
      navigation.navigate('Story', { story });
    }
  };
  
  const handleAddStoryPress = (event) => {
    // Stop event propagation so it doesn't trigger the parent TouchableOpacity
    event.stopPropagation();
    // Navigate to camera for creating a story
    navigation.navigate('Camera', { isStory: true });
  };

  const thumbnailUri = getStoryThumbnail();

  return (
    <View style={styles.storyItem}>
      <TouchableOpacity onPress={handleStoryPress} activeOpacity={0.7}>
        <LinearGradient
          colors={hasActiveStory ? ['#FF69B4', '#FF1493'] : ['#555', '#333']}
          style={styles.storyGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[
            styles.imageContainer, 
            { borderColor: hasActiveStory ? 'transparent' : '#000' }
          ]}>
            {isCurrentUser && !hasActiveStory ? (
              <View style={styles.addStoryPlaceholder}>
                {/* Empty placeholder for users without stories */}
              </View>
            ) : thumbnailUri ? (
              <Image source={{ uri: thumbnailUri }} style={styles.storyImage} />
            ) : (
              <View style={[styles.storyPlaceholder, { backgroundColor: colors.surface }]} />
            )}
          </View>
        </LinearGradient>
        
        {/* Add plus button overlay for current user's story */}
        {isCurrentUser && (
          <TouchableOpacity 
            style={styles.plusButtonContainer} 
            onPress={handleAddStoryPress}
            activeOpacity={0.7}
          >
            <View style={styles.plusButton}>
              <Text style={styles.plusButtonText}>+</Text>
            </View>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <View style={styles.usernameContainer}>
        <Text 
          style={[styles.username, { color: colors.text }]} 
          numberOfLines={1}
        >
          {isCurrentUser ? 'Your Story' : story.username}
        </Text>
      </View>
    </View>
  );
};

const Stories = () => {
  const { stories } = useStories();
  const { userProfile } = useUser();
  const myStory = stories.find(s => s.username === userProfile.username);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.storiesContainer}
      contentContainerStyle={styles.storiesContent}
    >
      <StoryItem isCurrentUser={true} story={myStory || null} />
      {stories
        .filter(story => story.username !== userProfile.username)
        .map((story) => (
          <StoryItem key={story.id} story={story} isCurrentUser={false} />
        ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  storiesContainer: {
    height: 108,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)',
  },
  storiesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 72,
    position: 'relative',
  },
  storyGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#000',
  },
  storyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  storyPlaceholder: {
    width: '100%',
    height: '100%',
  },
  usernameContainer: {
    marginTop: 4,
    width: '100%',
  },
  username: {
    fontSize: 11,
    textAlign: 'center',
  },
  addStoryPlaceholder: {
    flex: 1,
    backgroundColor: '#202020',
  },
  plusButtonContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    zIndex: 10,
  },
  plusButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  plusButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF1493',
    lineHeight: 22,
  }
});

export default Stories;
