import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const GIPHY_API_KEY = 'aVz18GhWEFNnqjQQnC1vR2Q2hGpbmNcD'; 
const WINDOW_WIDTH = Dimensions.get('window').width;
const THEME_PINK = '#FF69B4';

export default function GifPicker({ visible, onClose, onSelectGif }) {
  const { colors, isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchTrending();
    }
  }, [visible]);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20`
      );
      const data = await response.json();
      setTrending(data.data);
    } catch (error) {
      console.log('Error fetching trending GIFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async (text) => {
    setSearch(text);
    if (!text.trim()) {
      setGifs([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${text}&limit=20`
      );
      const data = await response.json();
      setGifs(data.data);
    } catch (error) {
      console.log('Error searching GIFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderGif = ({ item }) => (
    <TouchableOpacity
      style={styles.gifContainer}
      onPress={() => onSelectGif(item.images.fixed_height.url)}
    >
      <Image
        source={{ uri: item.images.fixed_height_still.url }}
        style={styles.gif}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Choose a GIF</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: THEME_PINK }]}>Close</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search GIFs..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={searchGifs}
          />
        </View>

        {loading ? (
          <ActivityIndicator color={THEME_PINK} style={styles.loader} />
        ) : (
          <FlatList
            data={search ? gifs : trending}
            renderItem={renderGif}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              !search && (
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Trending GIFs
                </Text>
              )
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 105, 180, 0.2)',
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
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchInput: {
    padding: 12,
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    padding: 8,
  },
  gifContainer: {
    width: (WINDOW_WIDTH - 40) / 2,
    height: (WINDOW_WIDTH - 40) / 2,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
  },
  gif: {
    width: '100%',
    height: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
  },
});
