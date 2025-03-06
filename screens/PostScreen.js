import React, { useState } from 'react';
import {
  View,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { CloseIcon, CheckIcon } from '../components/icons/TabBarIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THEME_PINK = '#FF69B4';

export default function PostScreen({ route, navigation }) {
  const { imageUri } = route.params;
  const [caption, setCaption] = useState('');

  const handlePost = async () => {
    try {
      // TODO: Implement post creation logic here
      navigation.navigate('MainApp', { screen: 'Home' });
    } catch (error) {
      console.log('Error creating post:', error);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          'rgba(255, 105, 180, 0.3)',
          'rgba(255, 105, 180, 0.1)',
          'rgba(255, 105, 180, 0.3)'
        ]}
        style={StyleSheet.absoluteFillObject}
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} bounces={false}>
          <BlurView intensity={80} tint="dark" style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <CloseIcon size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Post</Text>
            <TouchableOpacity
              style={[styles.headerButton, styles.postButton]}
              onPress={handlePost}
            >
              <CheckIcon size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </BlurView>

          <View style={styles.imageContainer}>
            <BlurView intensity={20} tint="dark" style={styles.imageBlur}>
              <Image 
                source={{ uri: imageUri }}
                style={styles.backgroundImage}
                blurRadius={25}
              />
              <LinearGradient
                colors={['transparent', 'rgba(255, 105, 180, 0.2)']}
                style={StyleSheet.absoluteFillObject}
              />
            </BlurView>
            <Image 
              source={{ uri: imageUri }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          </View>

          <BlurView intensity={80} tint="dark" style={styles.captionContainer}>
            <LinearGradient
              colors={[
                'rgba(255, 105, 180, 0.2)',
                'rgba(255, 105, 180, 0.1)',
                'rgba(255, 105, 180, 0.2)'
              ]}
              style={styles.captionGradient}
            >
              <TextInput
                style={[
                  styles.captionInput,
                  { 
                    color: '#FFFFFF',
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    borderColor: 'transparent',
                    borderRadius: 0,
                    paddingVertical: 12,
                    textAlignVertical: 'center',
                    minHeight: 45
                  }
                ]}
                placeholder="Write a caption..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={caption}
                onChangeText={setCaption}
                multiline
                maxLength={2200}
              />
            </LinearGradient>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 105, 180, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.2)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(255, 105, 180, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  postButton: {
    backgroundColor: THEME_PINK,
    borderWidth: 0,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    marginBottom: 20,
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.2)',
  },
  imageBlur: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  captionContainer: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.2)',
    shadowColor: THEME_PINK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  captionGradient: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  captionInput: {
    padding: 20,
    minHeight: 100,
    fontSize: 16,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 105, 180, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
});
