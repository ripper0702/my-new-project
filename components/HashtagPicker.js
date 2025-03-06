import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeContext';

const THEME_PINK = '#FF69B4';

// Mock trending hashtags - we can replace these with real data later
const TRENDING_HASHTAGS = [
  'aesthetic',
  'vibes',
  'lifestyle',
  'fashion',
  'art',
  'photography',
  'design',
  'minimal',
  'creative',
  'inspiration',
];

export default function HashtagPicker({ visible, onClose, onSelectHashtag }) {
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHashtags, setFilteredHashtags] = useState(TRENDING_HASHTAGS);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const slideAnim = new Animated.Value(0);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = TRENDING_HASHTAGS.filter(tag => 
      tag.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredHashtags(filtered);
  };

  const handleSelectHashtag = (hashtag) => {
    onSelectHashtag(hashtag);
    setSearchQuery('');
    setFilteredHashtags(TRENDING_HASHTAGS);
    Keyboard.dismiss();
  };

  const renderHashtag = ({ item }) => (
    <TouchableOpacity
      style={styles.hashtagItem}
      onPress={() => handleSelectHashtag(item)}
    >
      <Text style={[styles.hashtagText, { color: colors.text }]}>
        #{item}
      </Text>
      <Text style={[styles.hashtagCount, { color: colors.textSecondary }]}>
        {Math.floor(Math.random() * 1000)}k posts
      </Text>
    </TouchableOpacity>
  );

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -keyboardHeight],
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => Keyboard.dismiss()}
          >
            <BlurView
              intensity={100}
              tint={isDark ? 'dark' : 'light'}
              style={styles.blurContainer}
            >
              <View style={styles.content}>
                <View style={styles.header}>
                  <Text style={[styles.title, { color: colors.text }]}>
                    Add Hashtags
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      Keyboard.dismiss();
                      onClose();
                    }}
                  >
                    <Text style={[styles.closeText, { color: THEME_PINK }]}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
                  <Text style={[styles.searchIcon, { color: THEME_PINK }]}>
                    🔍
                  </Text>
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search hashtags"
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={handleSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.trendingSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Trending Hashtags
                  </Text>
                  <FlatList
                    data={filteredHashtags}
                    renderItem={renderHashtag}
                    keyExtractor={item => item}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.hashtagList}
                    keyboardShouldPersistTaps="handled"
                  />
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  blurContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 20,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  trendingSection: {
    flex: 1,
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  hashtagList: {
    paddingBottom: 20,
  },
  hashtagItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 105, 180, 0.2)',
  },
  hashtagText: {
    fontSize: 16,
  },
  hashtagCount: {
    fontSize: 14,
  },
});
