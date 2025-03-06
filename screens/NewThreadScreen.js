import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { CloseIcon } from '../components/icons/TabBarIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import GifPicker from '../components/GifPicker';
import VoiceRecorder from '../components/VoiceRecorder';
import HashtagPicker from '../components/HashtagPicker';
import LocationPicker from '../components/LocationPicker';
import { Audio } from 'expo-av';
import { usePosts } from '../context/PostsContext';
import { useUser } from '../context/UserContext';
import { useRoute } from '@react-navigation/native';

const THEME_PINK = '#FF69B4';

export default function NewThreadScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { addPost } = usePosts();
  const { userProfile } = useUser();
  const route = useRoute();
  const [threadText, setThreadText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedGif, setSelectedGif] = useState(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showHashtagPicker, setShowHashtagPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [voiceUri, setVoiceUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoiceNote, setSelectedVoiceNote] = useState(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Handle image from camera when returning
  React.useEffect(() => {
    if (route?.params?.capturedImage) {
      setSelectedMedia({
        uri: route.params.capturedImage,
        type: 'image'
      });
      setSelectedGif(null);
    }
  }, [route?.params?.capturedImage]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const media = result.assets[0];
        setSelectedMedia({
          uri: media.uri,
          type: media.type
        });
      }
    } catch (error) {
      console.log('Error picking image:', error);
    }
  };

  const openCamera = () => {
    navigation.navigate('Camera', {
      returnTo: 'NewThread'
    });
  };

  const handleSelectGif = (gifUrl) => {
    setSelectedGif(gifUrl);
    setSelectedMedia(null);
    setShowGifPicker(false);
  };

  const handleSelectHashtag = (hashtag) => {
    if (!selectedHashtags.includes(hashtag)) {
      setSelectedHashtags([...selectedHashtags, hashtag]);
      setThreadText((currentText) => {
        const space = currentText.length > 0 && !currentText.endsWith(' ') ? ' ' : '';
        return `${currentText}${space}#${hashtag} `;
      });
    }
    setShowHashtagPicker(false);
  };

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
  };

  const handleVoiceSave = async (uri) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      setVoiceUri(uri);
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      setSelectedVoiceNote(uri);
    } catch (error) {
      console.error('Error saving voice note:', error);
      Alert.alert('Error', 'Failed to save voice note. Please try again.');
    }
  };

  const playVoice = async () => {
    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }

      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          await sound.setPositionAsync(0);
        }
      });
    } catch (error) {
      console.error('Error playing voice note:', error);
    }
  };

  const cancelVoice = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      setSound(null);
      setVoiceUri(null);
      setIsPlaying(false);
      setSelectedVoiceNote(null);
    } catch (error) {
      console.error('Error canceling voice note:', error);
    }
  };

  const handlePost = async () => {
    if (!threadText.trim() && !selectedVoiceNote && !selectedMedia) {
      Alert.alert('Error', 'Please add some content to your post');
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      username: (userProfile.username || '').replace('@', ''),
      userAvatar: userProfile.avatar,
      location: selectedLocation || null,
      media: selectedMedia,
      voiceNote: selectedVoiceNote,
      caption: threadText,
      likes: 0,
      comments: [],
      timestamp: new Date().toISOString(),
      liked: false,
      saved: false,
      sponsored: false
    };

    try {
      addPost(newPost);
      navigation.goBack();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  const renderMediaButton = (icon, onPress) => (
    <TouchableOpacity 
      style={styles.mediaButton}
      onPress={onPress}
    >
      <Text style={[styles.mediaIcon, { color: THEME_PINK }]}>{icon}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 44 : 0}
    >
      <LinearGradient
        colors={[
          'rgba(255, 105, 180, 0.1)',
          'rgba(255, 105, 180, 0.05)',
          'rgba(255, 105, 180, 0.02)'
        ]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={[styles.header, { 
        paddingTop: insets.top,
        borderBottomColor: 'rgba(255, 105, 180, 0.2)'
      }]}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: 'rgba(255, 105, 180, 0.1)' }]}
          onPress={() => navigation.goBack()}
        >
          <CloseIcon size={24} color={THEME_PINK} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Post</Text>
        <TouchableOpacity
          style={[
            styles.headerButton,
            { opacity: threadText.trim().length > 0 || selectedMedia || selectedGif || selectedVoiceNote ? 1 : 0.5 }
          ]}
          onPress={handlePost}
          disabled={!threadText.trim().length && !selectedMedia && !selectedGif && !selectedVoiceNote}
        >
          <Text style={[styles.postButtonText, { color: THEME_PINK }]}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.threadContainer}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: 'rgba(255, 105, 180, 0.1)' }]} />
            <View style={styles.userNameContainer}>
              <Text style={[styles.userName, { color: colors.text }]}>Current User</Text>
            </View>
          </View>
          
          <TextInput
            style={[styles.threadInput, { color: colors.text }]}
            placeholder="What's happening?"
            placeholderTextColor={colors.textSecondary}
            multiline
            value={threadText}
            onChangeText={setThreadText}
          />

          {selectedLocation && (
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              📍 {selectedLocation}
            </Text>
          )}

          {selectedMedia && (
            <View style={styles.imagePreviewContainer}>
              <Image 
                source={{ uri: selectedMedia.uri }} 
                style={styles.imagePreview} 
              />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setSelectedMedia(null)}
              >
                <Text style={styles.removeImageText}>×</Text>
              </TouchableOpacity>
            </View>
          )}

          {selectedGif && (
            <View style={styles.imagePreviewContainer}>
              <Image 
                source={{ uri: selectedGif }} 
                style={styles.imagePreview} 
              />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setSelectedGif(null)}
              >
                <Text style={styles.removeImageText}>×</Text>
              </TouchableOpacity>
            </View>
          )}

          {selectedVoiceNote && (
            <View style={styles.voicePreviewContainer}>
              <TouchableOpacity 
                style={[styles.playButton, { backgroundColor: THEME_PINK }]}
                onPress={playVoice}
              >
                <Text style={styles.playButtonText}>{isPlaying ? '⏸️' : '▶️'}</Text>
              </TouchableOpacity>
              <View style={styles.voiceInfo}>
                <Text style={[styles.voiceText, { color: colors.text }]}>Voice Message</Text>
                <TouchableOpacity onPress={cancelVoice}>
                  <Text style={[styles.removeVoiceText, { color: THEME_PINK }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.mediaBar}>
            {renderMediaButton('🖼️', pickImage)}
            {renderMediaButton('📸', openCamera)}
            {renderMediaButton('🎞️', () => setShowGifPicker(true))}
            {renderMediaButton('🎤', () => setShowVoiceRecorder(true))}
            {renderMediaButton('#️⃣', () => setShowHashtagPicker(true))}
            {renderMediaButton('📍', () => setShowLocationPicker(true))}
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.footer, { borderTopColor: 'rgba(255, 105, 180, 0.2)' }]}
        >
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Anyone can reply & quote
          </Text>
          <View style={[styles.footerIndicator, { backgroundColor: 'rgba(255, 105, 180, 0.2)' }]} />
        </TouchableOpacity>
      </ScrollView>

      <GifPicker
        visible={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelectGif={handleSelectGif}
      />

      <VoiceRecorder
        visible={showVoiceRecorder}
        onClose={() => setShowVoiceRecorder(false)}
        onSave={handleVoiceSave}
      />

      <HashtagPicker
        visible={showHashtagPicker}
        onClose={() => setShowHashtagPicker(false)}
        onSelectHashtag={handleSelectHashtag}
      />

      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={handleSelectLocation}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButton: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  threadContainer: {
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  userNameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  threadInput: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 16,
  },
  imagePreviewContainer: {
    marginTop: 16,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.2)',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 20,
  },
  voicePreviewContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    borderRadius: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  voiceInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voiceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeVoiceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mediaBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginHorizontal: -8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 105, 180, 0.2)',
  },
  mediaButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  mediaIcon: {
    fontSize: 24,
    opacity: 0.9,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerText: {
    fontSize: 14,
  },
  footerIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
