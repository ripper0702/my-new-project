import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useStories } from '../context/StoriesContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Video } from 'expo-av';

export default function StoryEditor({ route, navigation }) {
  const { colors } = useTheme();
  const { addStory } = useStories();
  const { media } = route.params;

  console.log("[StoryEditor] Media received:", JSON.stringify(media, null, 2));

  const [caption, setCaption] = useState('');
  const [allowComments, setAllowComments] = useState(true);
  const [saveToPhone, setSaveToPhone] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handlePost = async () => {
    if (isUploading) return;
    
    console.log("[StoryEditor] Publishing story with media:", JSON.stringify(media, null, 2));
    
    setIsUploading(true);
    try {
      const result = await addStory(media, {
        caption,
        allowComments,
        saveToPhone
      });
      console.log("[StoryEditor] Story published successfully:", JSON.stringify(result, null, 2));
      navigation.navigate('MainApp', { screen: 'Home' });
    } catch (error) {
      console.error("[StoryEditor] Error publishing story:", error);
      Alert.alert('Error', 'Failed to post story. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <View style={styles.mediaPreview}>
          {media.type === 'video' ? (
            <Video
              source={{ uri: media.uri }}
              style={styles.mediaContent}
              resizeMode="cover"
              shouldPlay={true}
              isLooping={true}
              isMuted={true}
            />
          ) : (
            <Image source={{ uri: media.uri }} style={styles.mediaContent} />
          )}
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.caption, { color: colors.text }]}
            placeholder="Write a caption..."
            placeholderTextColor={colors.text + '80'}
            value={caption}
            onChangeText={setCaption}
            multiline
          />
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <View style={styles.option}>
            <Text style={[styles.optionText, { color: colors.text }]}>
              Allow comments
            </Text>
            <Switch
              value={allowComments}
              onValueChange={setAllowComments}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={allowComments ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.option}>
            <Text style={[styles.optionText, { color: colors.text }]}>
              Save to phone
            </Text>
            <Switch
              value={saveToPhone}
              onValueChange={setSaveToPhone}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={saveToPhone ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.postButton, { backgroundColor: colors.primary }]}
        onPress={handlePost}
        disabled={isUploading}
      >
        <Text style={styles.postButtonText}>
          {isUploading ? 'Posting...' : 'Post Story'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  mediaPreview: {
    width: '100%',
    height: 400,
    backgroundColor: '#000',
  },
  mediaContent: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
  },
  caption: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
  },
  postButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
