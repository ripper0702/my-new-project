import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { usePosts } from '../context/PostsContext';
import { useNavigation } from '@react-navigation/native';
import PostCard from './PostCard';
import Stories from './Stories';
import { Audio } from 'expo-av';
import { useStories } from '../context/StoriesContext';

const THEME_PINK = '#FF69B4';
const HEADER_HEIGHT = 60;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function Feed() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { posts } = usePosts();
  const navigation = useNavigation();
  const { stories } = useStories();
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [currentSound, setCurrentSound] = useState(null);
  const [scrollY] = useState(new Animated.Value(0));

  // Cleanup sound on unmount
  React.useEffect(() => {
    return () => {
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, [currentSound]);

  const handlePlayVoice = async (postId) => {
    try {
      // If there's a sound playing and it's the same post, pause it
      if (currentSound && playingVoiceId === postId) {
        await currentSound.pauseAsync();
        setPlayingVoiceId(null);
        return;
      }

      // If there's a different sound playing, stop it
      if (currentSound) {
        await currentSound.unloadAsync();
      }

      const post = posts.find(p => p.id === postId);
      if (!post?.voiceNote) return;

      const { sound } = await Audio.Sound.createAsync(
        { uri: post.voiceNote },
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

  const renderItem = ({ item }) => (
    <PostCard
      post={item}
      playingVoiceId={playingVoiceId}
      handlePlayVoice={handlePlayVoice}
      onPress={() => navigation.navigate('Thread', { post: item })}
      navigation={navigation}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        transform: [{ translateY: scrollY.interpolate({
          inputRange: [0, 100],
          outputRange: [0, -150],
          extrapolate: 'clamp'
        })}],
        opacity: scrollY.interpolate({
          inputRange: [0, 100],
          outputRange: [1, 0],
          extrapolate: 'clamp'
        })
      }}>
        <Stories stories={stories} />
      </Animated.View>
      <AnimatedFlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: HEADER_HEIGHT + insets.top + 44,
            paddingBottom: insets.bottom + 16,
            paddingHorizontal: 16,
          }
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
