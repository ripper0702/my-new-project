import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { SettingsIcon } from '../components/icons';
import { usePosts } from '../context/PostsContext';
import { useUser } from '../context/UserContext';
import { useChat } from '../context/ChatContext';
import { Video } from 'expo-av';

const getTimeAgo = (timestamp) => {
  const now = new Date();
  const postDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now - postDate) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  return `${Math.floor(diffInSeconds / 86400)}d`;
};

const ThreadItem = ({ thread, isLast }) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.threadItem}>
      <View style={styles.threadContent}>
        <View style={styles.threadHeader}>
          <Text style={[styles.threadTimestamp, { color: colors.textSecondary }]}>
            {getTimeAgo(thread.timestamp)}
          </Text>
        </View>
        <Text style={[styles.threadText, { color: colors.text }]}>
          {thread.caption}
        </Text>
        {thread.media && thread.media.map((item, index) => (
          <View key={index} style={styles.mediaContainer}>
            {item.type === 'image' && (
              <Image 
                source={{ uri: item.uri }} 
                style={styles.mediaImage}
                resizeMode="cover"
              />
            )}
            {item.type === 'video' && (
              <Video
                source={{ uri: item.uri }}
                style={styles.mediaVideo}
                useNativeControls
                shouldPlay={false}
                resizeMode="cover"
                isLooping={false}
              />
            )}
          </View>
        ))}
        <View style={styles.threadActions}>
          <Text style={[styles.threadStat, { color: colors.textSecondary }]}>
            {thread.likes} likes
          </Text>
          <Text style={[styles.threadStat, { color: colors.textSecondary }]}>
            {(thread.comments || []).length} replies
          </Text>
          <Text style={[styles.threadStat, { color: colors.textSecondary }]}>
            {thread.reposts || 0} reposts
          </Text>
        </View>
      </View>
      {!isLast && (
        <View 
          style={[styles.threadConnector, { backgroundColor: colors.border }]} 
        />
      )}
    </View>
  );
};

const ProfileScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { posts } = usePosts();
  const { userProfile } = useUser();
  const { chats } = useChat();
  
  const totalUnread = chats.reduce((sum, chat) => sum + (chat.unread || 0), 0);

  const currentUser = {
    ...userProfile,
    username: userProfile.username || '@CurrentUser',
  };

  const filteredPosts = posts.filter(post => 
    post.username === (userProfile.username || '').replace('@', '')
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>Profile Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;