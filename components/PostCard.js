import React, { useState, useCallback, useRef } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, TextInput, Dimensions, Share } from 'react-native';
import { Video } from 'expo-av';
import { Audio } from 'expo-av';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../theme/ThemeContext';
import { usePosts } from '../context/PostsContext';

const THEME_PINK = '#FF69B4';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MediaContent = ({ media, onPlayVoice, isPlaying }) => {
  const videoRef = useRef(null);

  if (!media) return null;

  const isGif = media.uri?.toLowerCase().endsWith('.gif');
  const isVideo = media.uri?.toLowerCase().match(/\.(mp4|mov|avi|wmv)$/);
  const isAudio = media.uri?.toLowerCase().match(/\.(mp3|wav|m4a)$/);

  if (isGif) {
    return (
      <FastImage
        style={styles.mediaContent}
        source={{ uri: media.uri }}
        resizeMode={FastImage.resizeMode.cover}
      />
    );
  }

  if (isVideo) {
    return (
      <Video
        ref={videoRef}
        style={styles.mediaContent}
        source={{ uri: media.uri }}
        useNativeControls
        resizeMode="cover"
        isLooping
        shouldPlay={false}
      />
    );
  }

  if (isAudio) {
    return (
      <TouchableOpacity 
        style={styles.audioContainer}
        onPress={onPlayVoice}
      >
        <View style={[styles.audioContent, { backgroundColor: THEME_PINK }]}>
          <Text style={styles.audioIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
          <View style={styles.audioWaveform}>
            {/* Waveform bars */}
            {Array(12).fill(0).map((_, i) => (
              <View 
                key={i}
                style={[
                  styles.waveformBar,
                  { 
                    height: Math.random() * 20 + 5,
                    backgroundColor: '#fff'
                  }
                ]} 
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Regular image
  return (
    <Image
      style={styles.mediaContent}
      source={{ uri: media.uri }}
      resizeMode="cover"
    />
  );
};

const VoiceNotePlayer = ({ uri, onPlay, isPlaying }) => {
  return (
    <TouchableOpacity 
      style={styles.audioContainer}
      onPress={onPlay}
    >
      <View style={[styles.audioContent, { backgroundColor: THEME_PINK }]}>
        <Text style={styles.audioIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
        <View style={styles.audioWaveform}>
          {/* Waveform bars */}
          {Array(12).fill(0).map((_, i) => (
            <View 
              key={i}
              style={[
                styles.waveformBar,
                { 
                  height: Math.random() * 20 + 5,
                  backgroundColor: '#fff'
                }
              ]} 
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function PostCard({ 
  post, 
  onPress, 
  isThread = false,
  playingVoiceId,
  handlePlayVoice,
  showReplies = false,
  level = 0,
  isLastReply = false,
  parentIds = [], 
  navigation,
  onReplyLayout
}) {
  const { colors } = useTheme();
  const { likePost, savePost, addReply, repostPost } = usePosts();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showNestedReplies, setShowNestedReplies] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const hasReplies = post.comments && post.comments.length > 0;

  // Calculate total replies at all levels
  const getTotalReplies = useCallback((comments) => {
    if (!comments || comments.length === 0) return 0;
    return comments.reduce((total, comment) => {
      return total + 1 + getTotalReplies(comment.comments);
    }, 0);
  }, []);

  const totalReplies = getTotalReplies(post.comments);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    
    try {
      const newReply = {
        id: Date.now().toString(),
        username: 'currentUser', // Replace with actual user
        userAvatar: null,
        caption: replyText,
        likes: 0,
        comments: [],
        timestamp: new Date().toISOString(),
        liked: false,
        saved: false,
        parentIds: [...parentIds, post.id] // Track reply hierarchy
      };

      const updatedPost = await addReply(post.id, newReply);
      setReplyText('');
      setIsReplying(false);
      
      // If we're not already in the thread screen, navigate there
      if (!isThread && navigation) {
        navigation.navigate('Thread', { 
          post: updatedPost,
          scrollToReply: newReply.id
        });
      } else {
        setShowNestedReplies(true); // Auto-expand to show new reply
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this post by ${post.username}: ${post.caption}`,
        url: post.media?.uri || post.image,
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleRepost = async () => {
    try {
      await repostPost(post.id);
    } catch (error) {
      console.error('Error reposting:', error);
    }
  };

  const handleOptionsPress = () => {
    setIsOptionsVisible(true);
  };

  const toggleReplies = () => {
    setShowNestedReplies(!showNestedReplies);
  };

  const PostContainer = isThread ? View : TouchableOpacity;

  return (
    <View 
      style={[styles.threadContainer, level > 0 && styles.replyContainer, level > 0 && { marginLeft: 16 }, isLastReply && styles.lastReply]}
      onLayout={(event) => onReplyLayout?.(post.id, event)}
    >
      {level > 0 && (
        <View style={[
          styles.replyLine,
          { backgroundColor: THEME_PINK }
        ]} />
      )}

      <PostContainer 
        activeOpacity={0.9}
        onPress={onPress}
        style={[styles.post, { backgroundColor: colors.card }]}
      >
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <TouchableOpacity>
              {post.userAvatar ? (
                <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: 'rgba(193, 161, 115, 0.2)' }]}>
                  <Text style={styles.avatarInitial}>
                    {post.username?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <View>
              <TouchableOpacity>
                <Text style={[styles.username, { color: colors.text }]}>{post.username}</Text>
              </TouchableOpacity>
              {post.location && (
                <TouchableOpacity>
                  <Text style={[styles.location, { color: colors.textSecondary }]}>
                    📍 {post.location}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity onPress={handleOptionsPress}>
            <Text style={styles.moreIcon}>•••</Text>
          </TouchableOpacity>
        </View>

        {post.caption && (
          <Text style={[styles.caption, { color: colors.text }]}>
            {post.caption}
          </Text>
        )}

        {(post.media || post.image) && (
          <MediaContent
            media={post.media || { uri: post.image, type: 'image' }}
            onPlayVoice={() => handlePlayVoice(post.id)}
            isPlaying={playingVoiceId === post.id}
          />
        )}

        {post.voiceNote && (
          <VoiceNotePlayer
            uri={post.voiceNote}
            onPlay={() => handlePlayVoice(post.id)}
            isPlaying={playingVoiceId === post.id}
          />
        )}

        <View style={styles.postActions}>
          <View style={styles.leftActions}>
            <TouchableOpacity 
              onPress={() => likePost(post.id)} 
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionIcon, post.liked && styles.likedIcon]}>
                {post.liked ? '❤️' : '🤍'}
              </Text>
              <Text style={[styles.actionCount, { color: colors.textSecondary }]}>
                {post.likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setIsReplying(!isReplying)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>💭</Text>
              <Text style={[styles.actionCount, { color: colors.textSecondary }]}>
                {totalReplies}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleRepost}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>🔄</Text>
              {post.reposts > 0 && (
                <Text style={[styles.actionCount, { color: colors.textSecondary }]}>
                  {post.reposts}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>↗️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rightActions}>
            {totalReplies > 0 && isThread && (
              <TouchableOpacity 
                style={[
                  styles.dropdownButton,
                  { 
                    backgroundColor: showNestedReplies ? colors.primary : 'rgba(193, 161, 115, 0.1)',
                  }
                ]}
                onPress={() => setShowNestedReplies(!showNestedReplies)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dropdownIcon,
                  { 
                    color: showNestedReplies ? '#fff' : colors.primary,
                  }
                ]}>
                  {showNestedReplies ? '▼' : '▶'}
                </Text>
                <View style={[styles.replyCountBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.replyCountText}>{totalReplies}</Text>
                </View>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => savePost(post.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionIcon, { color: post.saved ? colors.primary : colors.text }]}>
                {post.saved ? '📥' : '📤'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isReplying && (
          <View style={styles.replyInputContainer}>
            <TextInput
              style={[styles.replyInput, { color: colors.text }]}
              placeholder="Write a reply..."
              placeholderTextColor={colors.textSecondary}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              autoFocus
              onSubmitEditing={handleReply}
            />
            <TouchableOpacity
              style={[styles.replyButton, { backgroundColor: THEME_PINK }]}
              onPress={handleReply}
              activeOpacity={0.7}
            >
              <Text style={styles.replyButtonText}>Reply</Text>
            </TouchableOpacity>
          </View>
        )}
      </PostContainer>

      {showNestedReplies && post.comments?.length > 0 && (
        <View style={styles.repliesContainer}>
          {post.comments.map((reply, index) => (
            <PostCard
              key={reply.id}
              post={{
                ...reply,
                comments: reply.comments || []
              }}
              isThread={true}
              playingVoiceId={playingVoiceId}
              handlePlayVoice={handlePlayVoice}
              showReplies={true}
              level={level + 1}
              isLastReply={index === post.comments.length - 1}
              parentIds={[...parentIds, post.id]}
              onReplyLayout={onReplyLayout}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  threadContainer: {
    position: 'relative',
  },
  replyContainer: {
    marginTop: 1,
  },
  replyLine: {
    position: 'absolute',
    width: 2,
    left: -8,
    top: 0,
    bottom: 0,
    borderRadius: 1,
    opacity: 0.6,
  },
  lastReply: {
    marginBottom: 16,
  },
  post: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
  },
  location: {
    fontSize: 12,
    marginTop: 2,
  },
  moreIcon: {
    fontSize: 16,
    color: THEME_PINK,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 105, 180, 0.2)',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionCount: {
    fontSize: 14,
  },
  likedIcon: {
    transform: [{ scale: 1.1 }],
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dropdownButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dropdownIcon: {
    fontSize: 16,
    fontWeight: '600',
  },
  replyCountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  replyCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    marginLeft: 4,
  },
  replyInputContainer: {
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 105, 180, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    marginRight: 8,
  },
  replyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  replyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  repliesContainer: {
    marginTop: 1,
    marginLeft: 16,
  },
  mediaContent: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_WIDTH - 32,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  voiceNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    padding: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  voiceNoteWaveform: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  voiceNoteLine: {
    width: 3,
    height: '100%',
    borderRadius: 1.5,
    backgroundColor: '#fff',
  },
});
