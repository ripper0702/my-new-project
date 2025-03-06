import React, { useState, useEffect, useRef, useContext, Fragment } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated as RNAnimated,
  ScrollView,
  FlatList,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  Share,
} from 'react-native';
import {
  LinearGradient
} from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { useStories } from '../context/StoriesContext';
import BackIcon from '../components/icons/BackIcon';
import MoreIcon from '../components/icons/MoreIcon';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { Video } from 'expo-av';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PROGRESS_BAR_WIDTH = SCREEN_WIDTH - 40;
const STORY_DURATION = 5000; // 5 seconds per story

const StoryScreen = ({ route, navigation }) => {
  console.log("[StoryScreen] Component mounted");
  console.log("[StoryScreen] Route params:", JSON.stringify(route.params, null, 2));
  
  const { story: initialStory } = route.params;
  console.log("[StoryScreen] Initial story:", initialStory ? "Valid story object" : "null or undefined");
  
  const [story, setStory] = useState(initialStory);
  const { colors, isDark } = useTheme();
  const { addCommentToStory, deleteStory, archiveStory } = useStories();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const progress = useSharedValue(0);
  const videoRef = React.useRef(null);
  
  // State for dropdown menu
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('viewers'); // 'viewers' or 'comments'
  const dropdownAnimation = useRef(new RNAnimated.Value(0)).current;
  const [newComment, setNewComment] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Menu state
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Setup keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        setPaused(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        // Don't unpause automatically to avoid confusing the user
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Add debug logging for story and media items
  console.log("[StoryScreen] Received story:", JSON.stringify(story, null, 2));

  // Check if story and media exist
  if (!story) {
    console.error("Invalid story data:", story);
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, textAlign: 'center', marginTop: 20 }}>
          Story not available
        </Text>
        <TouchableOpacity 
          style={{ marginTop: 20, padding: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: colors.primary, textAlign: 'center' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Create an array of media items
  const mediaItems = story.mediaItems || (story.media ? [story.media] : []);
  
  // Log media items
  console.log("[StoryScreen] Media items count:", mediaItems.length);
  console.log("[StoryScreen] Media items:", JSON.stringify(mediaItems, null, 2));
  
  if (mediaItems.length === 0) {
    console.error("No media items in story:", story);
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, textAlign: 'center', marginTop: 20 }}>
          Story has no media content
        </Text>
        <TouchableOpacity 
          style={{ marginTop: 20, padding: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: colors.primary, textAlign: 'center' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progressStyle = useAnimatedStyle(() => ({
    width: withTiming(PROGRESS_BAR_WIDTH * progress.value, {
      duration: STORY_DURATION,
    }),
  }));

  useEffect(() => {
    // Reset progress when changing story
    progress.value = 0;
    const timer = setTimeout(() => {
      progress.value = 1;
    }, 100);

    // Pause the timer when dropdown is showing
    let storyTimer;
    if (!showDropdown) {
      storyTimer = setTimeout(() => {
        if (currentStoryIndex < mediaItems.length - 1) {
          setCurrentStoryIndex(currentStoryIndex + 1);
        } else {
          navigation.goBack();
        }
      }, STORY_DURATION);
    }

    return () => {
      clearTimeout(timer);
      if (storyTimer) clearTimeout(storyTimer);
    };
  }, [currentStoryIndex, showDropdown]);

  // Toggle dropdown menu
  const toggleDropdown = () => {
    if (showDropdown) {
      // Hide dropdown
      RNAnimated.timing(dropdownAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setShowDropdown(false));
    } else {
      // Show dropdown
      setShowDropdown(true);
      RNAnimated.timing(dropdownAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handlePress = (event) => {
    // If dropdown is open, close it instead of changing story
    if (showDropdown) {
      toggleDropdown();
      return;
    }
    
    const touchX = event.nativeEvent.locationX;
    if (touchX < SCREEN_WIDTH / 2) {
      // Pressed left side
      if (currentStoryIndex > 0) {
        setCurrentStoryIndex(currentStoryIndex - 1);
      } else {
        navigation.goBack();
      }
    } else {
      // Pressed right side
      if (currentStoryIndex < mediaItems.length - 1) {
        setCurrentStoryIndex(currentStoryIndex + 1);
      } else {
        navigation.goBack();
      }
    }
  };

  const renderMediaItem = (mediaItem) => {
    if (!mediaItem) return null;
    
    // Log the current media item
    console.log("[StoryScreen] Rendering media item:", JSON.stringify(mediaItem, null, 2));
    
    if (mediaItem.type === 'video') {
      return (
        <Video
          ref={videoRef}
          source={{ uri: mediaItem.uri }}
          style={styles.storyImage}
          resizeMode="cover"
          shouldPlay={!showDropdown}
          isLooping={false}
          isMuted={false}
        />
      );
    } else {
      return (
        <Image
          source={{ uri: mediaItem.uri }}
          style={styles.storyImage}
          resizeMode="cover"
        />
      );
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    // Create a new comment object
    const newCommentObj = {
      username: 'you', // In a real app, this would be the current user's username
      avatar: null,    // In a real app, this would be the current user's avatar
      text: newComment.trim(),
      timestamp: 'just now'
    };
    
    try {
      // Save the comment to the context
      const updatedStory = await addCommentToStory(story.id, newCommentObj);
      
      if (updatedStory) {
        // Update the local state with the updated story
        setStory(updatedStory);
        console.log("[StoryScreen] Comment added successfully");
      }
    } catch (error) {
      console.error("[StoryScreen] Error adding comment:", error);
    }
    
    // Clear the input
    setNewComment('');
    
    // Hide keyboard
    Keyboard.dismiss();
  };

  const renderViewersTab = () => {
    const viewers = story?.viewers || [];
    
    if (viewers.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No viewers yet</Text>
        </View>
      );
    }
    
    return (
      <FlatList
        data={viewers}
        keyExtractor={(item, index) => `viewer-${index}`}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
            ) : (
              <View style={[styles.userAvatar, styles.defaultAvatar]}>
                <Text style={styles.defaultAvatarText}>{item.username.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  const renderCommentsTab = () => {
    const comments = story?.comments || [];
    
    return (
      <View style={styles.commentsContainer}>
        <FlatList
          data={comments}
          keyExtractor={(item, index) => `comment-${index}`}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
              ) : (
                <View style={[styles.userAvatar, styles.defaultAvatar]}>
                  <Text style={styles.defaultAvatarText}>
                    {item.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.commentContent}>
                <Text style={styles.commentUsername}>{item.username}</Text>
                <Text style={styles.commentText}>{item.text}</Text>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No comments yet</Text>
            </View>
          }
        />
        
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={newComment}
            onChangeText={setNewComment}
            onSubmitEditing={handleAddComment}
            multiline={false}
            returnKeyType="send"
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              !newComment.trim() ? styles.sendButtonDisabled : null
            ]}
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const currentMediaItem = mediaItems[currentStoryIndex];
  
  // Log the current media item being displayed
  console.log("[StoryScreen] Current media index:", currentStoryIndex);
  console.log("[StoryScreen] Current media item:", JSON.stringify(currentMediaItem, null, 2));

  // Get the current viewers and comments list
  const viewers = story.viewers || [];
  const comments = story.comments || [];

  // Calculate dropdown height based on animation value
  const dropdownHeight = dropdownAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_HEIGHT * 0.5],
  });

  // Handle menu actions
  const handleDeleteStory = () => {
    setMenuVisible(false);
    
    Alert.alert(
      "Delete Story",
      "Are you sure you want to delete this story? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteStory(story.id);
              if (success) {
                console.log("[StoryScreen] Story deleted successfully");
                navigation.goBack();
              }
            } catch (error) {
              console.error("[StoryScreen] Error deleting story:", error);
              Alert.alert("Error", "Failed to delete story. Please try again.");
            }
          }
        }
      ]
    );
  };
  
  const handleShareStory = async () => {
    setMenuVisible(false);
    
    try {
      const mediaUrl = currentMediaItem?.uri;
      const result = await Share.share({
        message: `Check out this story from ${story.username}!`,
        url: mediaUrl
      });
      
      if (result.action === Share.sharedAction) {
        console.log("[StoryScreen] Story shared successfully");
      }
    } catch (error) {
      console.error("[StoryScreen] Error sharing story:", error);
      Alert.alert("Error", "Failed to share story. Please try again.");
    }
  };
  
  const handleArchiveStory = () => {
    setMenuVisible(false);
    
    Alert.alert(
      "Archive Story",
      "Are you sure you want to archive this story?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Archive", 
          onPress: async () => {
            try {
              await archiveStory(story.id);
              console.log("[StoryScreen] Story archived successfully");
              navigation.goBack();
            } catch (error) {
              console.error("[StoryScreen] Error archiving story:", error);
              Alert.alert("Error", "Failed to archive story. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar hidden />
      <View style={styles.progressContainer}>
        {mediaItems.map((item, index) => (
          <View key={index} style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBar,
                index === currentStoryIndex && progressStyle,
                index < currentStoryIndex && styles.progressBarCompleted,
                { backgroundColor: '#FF69B4' },
              ]}
            />
          </View>
        ))}
      </View>

      <TouchableOpacity
        activeOpacity={1}
        style={styles.storyContainer}
        onPress={handlePress}
      >
        {renderMediaItem(currentMediaItem)}

        {/* Caption display - now using the caption from the current media item */}
        {currentMediaItem && currentMediaItem.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>{currentMediaItem.caption}</Text>
          </View>
        )}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BackIcon color="#FFF" />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            {/* Use a colored circle as a fallback instead of an image */}
            {story.userAvatar ? (
              <Image
                source={{ uri: story.userAvatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: '#FF69B4' }]}>
                <Text style={styles.avatarText}>
                  {story.username?.charAt(0).toUpperCase() || ''}
                </Text>
              </View>
            )}
            <Text style={styles.username}>{story.username}</Text>
          </View>
          
          {/* Story Actions Menu Button */}
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setMenuVisible(!menuVisible)}
          >
            <MoreIcon color="#FFF" size={24} />
          </TouchableOpacity>
          
          {/* Story Actions Menu */}
          {menuVisible && (
            <View style={styles.menuContainer}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleDeleteStory}
              >
                <Text style={styles.menuText}>Delete Story</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleShareStory}
              >
                <Text style={styles.menuText}>Share Story</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleArchiveStory}
              >
                <Text style={styles.menuText}>Archive Story</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Comments/Viewers toggle button */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleDropdown}
        >
          <View style={styles.toggleButtonContent}>
            <Text style={styles.toggleButtonText}>
              {viewers.length} {viewers.length === 1 ? 'viewer' : 'viewers'} · {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </Text>
            <Text style={styles.toggleButtonIcon}>▲</Text>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Dropdown for viewers and comments */}
      {showDropdown && (
        <RNAnimated.View style={[styles.dropdown, { height: dropdownHeight }]}>
          <View style={styles.dropdownTabs}>
            <TouchableOpacity
              style={[
                styles.dropdownTab,
                activeTab === 'viewers' && styles.activeTab
              ]}
              onPress={() => setActiveTab('viewers')}
            >
              <Text style={[
                styles.dropdownTabText,
                activeTab === 'viewers' && styles.activeTabText
              ]}>
                Viewers ({viewers.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.dropdownTab,
                activeTab === 'comments' && styles.activeTab
              ]}
              onPress={() => setActiveTab('comments')}
            >
              <Text style={[
                styles.dropdownTabText,
                activeTab === 'comments' && styles.activeTabText
              ]}>
                Comments ({comments.length})
              </Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView 
            style={styles.dropdownContent}
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
          >
            {activeTab === 'viewers' ? renderViewersTab() : renderCommentsTab()}
          </KeyboardAvoidingView>
        </RNAnimated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  progressBarBackground: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 2,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    width: '0%',
  },
  progressBarCompleted: {
    width: '100%',
  },
  storyContainer: {
    flex: 1,
    position: 'relative',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  captionContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  captionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  avatarFallback: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  username: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleButton: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  toggleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 14,
    marginRight: 5,
  },
  toggleButtonIcon: {
    color: 'white',
    fontSize: 12,
    transform: [{ rotate: '180deg' }],
  },
  dropdown: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  dropdownTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownTab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF69B4',
  },
  dropdownTabText: {
    fontSize: 14,
    color: '#888',
  },
  activeTabText: {
    color: '#FF69B4',
    fontWeight: 'bold',
  },
  dropdownContent: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  defaultAvatar: {
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  commentContent: {
    flex: 1,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  commentUsername: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  commentText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
  timestamp: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyStateContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  commentsContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: 'white',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#3897f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(56, 151, 240, 0.5)',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Menu styles
  menuButton: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 90 : 70,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 5,
    zIndex: 10,
    minWidth: 150,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default StoryScreen;
