import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  TextInput,
  Animated,
  LayoutAnimation,
  UIManager,
  ActivityIndicator,
  KeyboardAvoidingView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useThread } from '../context/ThreadContext';
import { useKeyboard } from '../context/KeyboardContext';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const FeedPost = ({ post, isFirst, isLast, isThreadScreen, depth = 0 }) => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { 
    handleLike, 
    handleRepost, 
    handleReply, 
    handleShare,
    isLiked,
    isReposted,
    getReplies 
  } = useThread();
  const { keyboardHeight, isKeyboardVisible } = useKeyboard();

  // Add safety check for post
  if (!post) {
    return null;
  }
  
  // Add state for counts
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [replyCount, setReplyCount] = useState(post.replies || 0);
  const [repostCount, setRepostCount] = useState(post.reposts || 0);
  const [shareCount, setShareCount] = useState(post.shares || 0);

  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [likeScale] = useState(new Animated.Value(1));
  const [showReplies, setShowReplies] = useState(false);
  const [nestedReplies, setNestedReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const navigateToThread = async () => {
    if (!isThreadScreen && post.id) {
      try {
        const threadPost = {
          ...post,
          likes: likeCount,
          replies: replyCount,
          reposts: repostCount,
          shares: shareCount
        };
        navigation.navigate('Thread', { post: threadPost });
      } catch (error) {
        console.error('Error navigating to thread:', error);
      }
    }
  };

  const animateLike = () => {
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.2,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }),
    ]).start();
  };

  const onLike = async () => {
    const newLikeState = !isLiked(post.id);
    await handleLike(post.id);
    // Update like count
    setLikeCount(prev => newLikeState ? prev + 1 : prev - 1);
    animateLike();
  };

  const onRepost = async () => {
    const newRepostState = !isReposted(post.id);
    await handleRepost(post.id);
    // Update repost count
    setRepostCount(prev => newRepostState ? prev + 1 : prev - 1);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const onShare = async () => {
    await handleShare(post);
    // Update share count
    setShareCount(prev => prev + 1);
  };

  const loadNestedReplies = async () => {
    if (!showReplies) {
      setLoadingReplies(true);
      try {
        const replies = await getReplies(post.id);
        if (replies && replies.length > 0) {
          setNestedReplies(replies);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setShowReplies(true);
        }
      } catch (error) {
        console.error('Error loading replies:', error);
      }
      setLoadingReplies(false);
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowReplies(false);
    }
  };

  const toggleReply = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsReplying(!isReplying);
  };

  const onSubmitReply = () => {
    if (replyText.trim()) {
      handleReply(post.id, replyText);
      setReplyText('');
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsReplying(false);
      setReplyCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    return () => {
      if (isReplying) {
        setIsReplying(false);
      }
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      style={[
        styles.container,
        isFirst && styles.firstPost,
        isLast && styles.lastPost,
        isThreadScreen && styles.threadScreenPost,
      ]}
    >
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={navigateToThread}
        disabled={isThreadScreen}
        style={[
          styles.card,
          { 
            backgroundColor: isDark ? colors.surface : '#FFFFFF',
            shadowColor: isDark ? '#000000' : '#2C2C2C',
          }
        ]}
      >
        <View style={styles.contentContainer}>
          <View style={styles.avatarContainer}>
            {post.userAvatar ? (
              <Image 
                source={{ uri: post.userAvatar }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: 'rgba(128, 128, 128, 0.1)' }]} />
            )}
            {post.hasThread && !isLast && (
              <View style={[styles.threadLine, { backgroundColor: colors.border }]} />
            )}
          </View>
          <View style={styles.mainContent}>
            <View style={styles.header}>
              <View style={styles.userInfo}>
                <Text style={[styles.username, { color: colors.text }]}>
                  {post.username}
                  {post.verified && (
                    <Text style={[styles.verifiedIcon, { color: colors.primary }]}>
                      {' '}✓
                    </Text>
                  )}
                </Text>
                <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                  • {post.timestamp}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.moreButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => handleShare(post)}
              >
                <Text style={[styles.moreText, { color: colors.text }]}>•••</Text>
              </TouchableOpacity>
            </View>

            {/* Reply to */}
            {post.replyTo && (
              <Text style={[styles.replyTo, { color: colors.textSecondary }]}>
                Replying to <Text style={{ color: colors.primary }}>@{post.replyTo}</Text>
              </Text>
            )}

            {/* Thread Text */}
            <Text style={[styles.threadText, { color: colors.text }]}>
              {post.text}
            </Text>

            {/* Thread Image */}
            {post.image && (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: post.image }} 
                  style={[styles.threadImage, { backgroundColor: colors.border }]} 
                />
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={onLike}
                >
                  <Animated.Text 
                    style={[
                      styles.actionIcon,
                      { transform: [{ scale: likeScale }] }
                    ]}
                  >
                    {isLiked(post.id) ? '❤️' : '🤍'}
                  </Animated.Text>
                  <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                    {likeCount}
                  </Text>
                </TouchableOpacity>

                <View style={styles.actionGroup}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={toggleReply}
                  >
                    <Text style={styles.actionIcon}>💬</Text>
                    <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                      {replyCount}
                    </Text>
                  </TouchableOpacity>
                  
                  {isThreadScreen && !isFirst && replyCount > 0 && (
                    <TouchableOpacity 
                      style={[styles.dropdownButton, { backgroundColor: '#FF69B4' }]}
                      onPress={loadNestedReplies}
                    >
                      <Text style={[styles.dropdownIcon, { color: '#FFFFFF' }]}>
                        {showReplies ? '▼' : '▶'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={onRepost}
                >
                  <Text style={[
                    styles.actionIcon,
                    isReposted(post.id) && { color: colors.primary }
                  ]}>
                    {isReposted(post.id) ? '🔄' : '↩️'}
                  </Text>
                  <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                    {repostCount}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={onShare}
                >
                  <Text style={styles.actionIcon}>📤</Text>
                  <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                    {shareCount}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reply Input */}
            {isReplying && (
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
              >
                <View style={[
                  styles.replyContainer,
                  { backgroundColor: colors.background }
                ]}>
                  <TextInput
                    style={[
                      styles.replyInput,
                      { 
                        color: colors.text,
                        backgroundColor: colors.background,
                        borderWidth: 1,
                        borderColor: 'rgba(128, 128, 128, 0.2)',
                        borderRadius: 20,
                        paddingVertical: 12,
                        textAlignVertical: 'center',
                        minHeight: 45
                      }
                    ]}
                    placeholder="Write your reply..."
                    placeholderTextColor={colors.textSecondary}
                    value={replyText}
                    onChangeText={setReplyText}
                    multiline
                    autoFocus
                  />
                  <TouchableOpacity 
                    style={[
                      styles.replyButton,
                      { backgroundColor: colors.primary },
                      !replyText.trim() && { opacity: 0.5 }
                    ]}
                    onPress={onSubmitReply}
                    disabled={!replyText.trim()}
                  >
                    <Text style={styles.replyButtonText}>Reply</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Nested Replies Dropdown */}
      {isThreadScreen && !isFirst && replyCount > 0 && (
        <View style={styles.nestedReplies}>
          {loadingReplies ? (
            <ActivityIndicator color="#FF69B4" style={styles.loadingIndicator} />
          ) : (
            showReplies && nestedReplies.map((reply, index) => (
              <FeedPost
                key={reply.id}
                post={reply}
                isLast={index === nestedReplies.length - 1}
                isThreadScreen={true}
                depth={depth + 1}
              />
            ))
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  firstPost: {
    marginTop: 0,
  },
  lastPost: {
    marginBottom: 0,
  },
  threadScreenPost: {
    marginLeft: 0,
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  verifiedIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  timestamp: {
    fontSize: 14,
    color: '#808080',
  },
  threadText: {
    fontSize: 16,
    lineHeight: 22,
    marginTop: 4,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
  },
  threadImage: {
    width: '100%',
    aspectRatio: 16/9,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  dropdownIcon: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  replyContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replyInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#2C2C2C',
  },
  replyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FF69B4',
  },
  replyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  nestedReplies: {
    marginTop: 8,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#FF69B4',
  },
  loadingIndicator: {
    padding: 16,
  }
});

export default FeedPost;
