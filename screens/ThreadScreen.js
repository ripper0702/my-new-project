import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  ActivityIndicator, 
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useThread } from '../context/ThreadContext';
import { useKeyboard } from '../context/KeyboardContext';
import { Audio } from 'expo-av';
import PostCard from '../components/PostCard';

const ThreadScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { post, scrollToReply } = route.params || {};
  const { getReplies } = useThread();
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { keyboardHeight, isKeyboardVisible } = useKeyboard();
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [currentSound, setCurrentSound] = useState(null);
  const scrollViewRef = useRef(null);
  const [replyLayouts, setReplyLayouts] = useState({});

  useEffect(() => {
    const loadReplies = async () => {
      if (post?.id) {
        try {
          const threadReplies = await getReplies(post.id);
          setReplies(threadReplies);
        } catch (error) {
          console.error('Error loading replies:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadReplies();
  }, [post?.id, getReplies]);

  // Cleanup sound on unmount
  React.useEffect(() => {
    return () => {
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, [currentSound]);

  // Store layout information for each reply
  const handleReplyLayout = (replyId, event) => {
    const { y } = event.nativeEvent.layout;
    setReplyLayouts(prev => ({
      ...prev,
      [replyId]: y
    }));
  };

  useEffect(() => {
    if (scrollToReply && replyLayouts[scrollToReply] && scrollViewRef.current) {
      // Wait for layout to complete
      setTimeout(() => {
        scrollViewRef.current.scrollTo({
          y: replyLayouts[scrollToReply],
          animated: true
        });
      }, 300);
    }
  }, [scrollToReply, replyLayouts]);

  const handlePlayVoice = async (voiceUri, postId) => {
    try {
      if (currentSound) {
        if (playingVoiceId === postId) {
          await currentSound.pauseAsync();
          setPlayingVoiceId(null);
          return;
        }
        await currentSound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: voiceUri },
        { shouldPlay: true }
      );

      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          setPlayingVoiceId(null);
        }
      });

      setCurrentSound(sound);
      setPlayingVoiceId(postId);
    } catch (error) {
      console.error('Error playing voice note:', error);
    }
  };

  if (!post) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]} />
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 44 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: 16,
            paddingTop: insets.top + 16,
            paddingBottom: isKeyboardVisible ? keyboardHeight : insets.bottom + 16
          }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        <View 
          onLayout={(event) => handleReplyLayout(post.id, event)}
        >
          <PostCard 
            post={post}
            isThread={true}
            playingVoiceId={playingVoiceId}
            handlePlayVoice={handlePlayVoice}
            onReplyLayout={handleReplyLayout}
          />
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator 
              size="large"
              color="#FF69B4"
              style={styles.loading}
            />
          </View>
        ) : replies.length > 0 ? (
          <View style={styles.repliesContainer}>
            {replies.map((reply, index) => (
              <View 
                key={reply.id}
                onLayout={(event) => handleReplyLayout(reply.id, event)}
              >
                <PostCard
                  post={reply}
                  isThread={true}
                  playingVoiceId={playingVoiceId}
                  handlePlayVoice={handlePlayVoice}
                  onReplyLayout={handleReplyLayout}
                />
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  loading: {
    marginVertical: 16,
  },
  repliesContainer: {
    marginTop: 8,
  },
});

export default ThreadScreen;
