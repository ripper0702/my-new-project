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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('Chat')}
          >
            <Text style={[styles.iconButtonText, { color: colors.primary }]}>💬</Text>
            {totalUnread > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{totalUnread}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <SettingsIcon size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileInfo}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => navigation.navigate('EditProfile')}
            >
              {currentUser.avatar ? (
                <Image 
                  source={{ uri: currentUser.avatar }} 
                  style={[styles.avatar, { backgroundColor: colors.surface }]}
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.addPhotoText, { color: colors.primary }]}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <View style={styles.statsContainer}>
              <TouchableOpacity style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>{filteredPosts.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Posts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Details */}
          <View style={styles.profileDetails}>
            <TouchableOpacity 
              style={styles.editNameContainer}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={[styles.name, { color: colors.text }]}>{currentUser.name}</Text>
              <Text style={[styles.editText, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>

            <View style={styles.usernameContainer}>
              <Text style={[styles.username, { color: colors.textSecondary }]}>{currentUser.username}</Text>
            </View>

            <TouchableOpacity 
              style={styles.locationContainer}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={[styles.location, { color: colors.textSecondary }]}>📍 {currentUser.location}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.childInfoContainer}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={[styles.childInfo, { color: colors.text }]}>
                {currentUser.childInfo.age} • {currentUser.childInfo.dietaryNeeds}
              </Text>
              <Text style={[styles.editText, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Primary Action */}
          <TouchableOpacity 
            style={[styles.addPostButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('NewThread')}
          >
            <Text style={[styles.addPostButtonText, { color: isDark ? colors.text : '#FFFFFF' }]}>
              New Post
            </Text>
          </TouchableOpacity>

          {/* Mom Support Tools */}
          <View style={[styles.supportTools, { borderTopColor: colors.border }]}>
            <Text style={[styles.supportTitle, { color: colors.textSecondary }]}>Mom Support</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={[styles.quickActionButton, { backgroundColor: colors.surface }]}
                onPress={() => {/* Navigate to Memories */}}
              >
                <Text style={styles.quickActionIcon}>📸</Text>
                <Text style={[styles.quickActionText, { color: colors.text }]}>Memories</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickActionButton, { backgroundColor: colors.surface }]}
                onPress={() => {/* Navigate to Meal Planner */}}
              >
                <Text style={styles.quickActionIcon}>🍽️</Text>
                <Text style={[styles.quickActionText, { color: colors.text }]}>Plan Meals</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickActionButton, { backgroundColor: colors.surface }]}
                onPress={() => {/* Navigate to Services */}}
              >
                <Text style={styles.quickActionIcon}>👶</Text>
                <Text style={[styles.quickActionText, { color: colors.text }]}>Find Care</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickActionButton, { backgroundColor: colors.surface }]}
                onPress={() => {/* Navigate to Wallet */}}
              >
                <Text style={styles.quickActionIcon}>💳</Text>
                <Text style={[styles.quickActionText, { color: colors.text }]}>Wallet</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* User's Threads */}
          <View style={[styles.threadsContainer, { borderTopColor: colors.border }]}>
            <Text style={[styles.threadsTitle, { color: colors.text }]}>Threads</Text>
            {filteredPosts.length > 0 ? (
              <View style={styles.threadsList}>
                {filteredPosts.map((post, index) => (
                  <ThreadItem 
                    key={post.id} 
                    thread={post}
                    isLast={index === filteredPosts.length - 1}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  No posts yet. Share your first post!
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerButton: {
    padding: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconButtonText: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF4B4B',  // Using accent red as it's more appropriate for notifications
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  profileInfo: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  profileDetails: {
    marginBottom: 24,
  },
  editNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
  },
  editText: {
    fontSize: 14,
    fontWeight: '500',
  },
  usernameContainer: {
    marginBottom: 8,
  },
  username: {
    fontSize: 14,
  },
  locationContainer: {
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
  },
  childInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  childInfo: {
    fontSize: 14,
  },
  addPostButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  addPostButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  supportTools: {
    borderTopWidth: 1,
    paddingTop: 24,
    marginBottom: 24,
  },
  supportTitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  threadsContainer: {
    borderTopWidth: 1,
    paddingTop: 24,
  },
  threadsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  threadsList: {
    gap: 16,
  },
  threadItem: {
    position: 'relative',
  },
  threadContent: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  threadTimestamp: {
    fontSize: 14,
  },
  threadText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  threadActions: {
    flexDirection: 'row',
    gap: 16,
  },
  threadStat: {
    fontSize: 14,
  },
  threadConnector: {
    position: 'absolute',
    width: 2,
    left: 16,
    top: '100%',
    height: 16,
  },
  mediaContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  mediaVideo: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
  },
});

export default ProfileScreen;