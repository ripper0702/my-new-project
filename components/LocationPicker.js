import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { useTheme } from '../theme/ThemeContext';

const THEME_PINK = '#FF69B4';

export default function LocationPicker({ visible, onClose, onSelectLocation }) {
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);
  const { height: windowHeight } = Dimensions.get('window');

  useEffect(() => {
    if (visible) {
      getCurrentLocation();
      
      // Slight delay to ensure smooth animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setError(null);
      Keyboard.dismiss();
    }
  }, [visible]);

  useEffect(() => {
    const keyboardWillShow = (e) => {
      const keyboardHeight = e.endCoordinates.height;
      setKeyboardHeight(keyboardHeight);
      
      Animated.spring(slideAnim, {
        toValue: -keyboardHeight,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
    };

    const keyboardWillHide = () => {
      setKeyboardHeight(0);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
    };

    const showListener = Platform.OS === 'ios' 
      ? Keyboard.addListener('keyboardWillShow', keyboardWillShow)
      : Keyboard.addListener('keyboardDidShow', keyboardWillShow);
      
    const hideListener = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', keyboardWillHide)
      : Keyboard.addListener('keyboardDidHide', keyboardWillHide);

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
      fetchNearbyPlaces(location.coords.latitude, location.coords.longitude);
    } catch (err) {
      setError('Error getting location');
      console.log('Location error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyPlaces = async (latitude, longitude) => {
    try {
      // Using OpenStreetMap's Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
        `lat=${latitude}&lon=${longitude}&` +
        `format=json&addressdetails=1&limit=1`
      );
      const mainLocation = await response.json();

      // Get nearby places
      const nearbyResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(mainLocation.address.suburb || mainLocation.address.city || '')}&` +
        `format=json&addressdetails=1&limit=10&` +
        `viewbox=${longitude - 0.1},${latitude + 0.1},${longitude + 0.1},${latitude - 0.1}`
      );
      const nearbyPlaces = await nearbyResponse.json();

      const places = nearbyPlaces.map(place => ({
        id: place.place_id,
        name: place.display_name.split(',')[0],
        fullAddress: place.display_name,
        distance: calculateDistance(latitude, longitude, place.lat, place.lon),
      }));

      setNearbyPlaces(places);
    } catch (err) {
      console.error('Error fetching places:', err);
      setError('Error fetching nearby places');
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      if (currentLocation) {
        fetchNearbyPlaces(currentLocation.coords.latitude, currentLocation.coords.longitude);
      }
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(text)}&` +
        `format=json&addressdetails=1&limit=10`
      );
      const results = await response.json();

      const places = results.map(place => ({
        id: place.place_id,
        name: place.display_name.split(',')[0],
        fullAddress: place.display_name,
        distance: currentLocation ? 
          calculateDistance(
            currentLocation.coords.latitude,
            currentLocation.coords.longitude,
            place.lat,
            place.lon
          ) : null
      }));

      setNearbyPlaces(places);
    } catch (err) {
      console.error('Search error:', err);
      setError('Error searching places');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (place) => {
    onSelectLocation(place.name);
    onClose();
  };

  const renderPlace = ({ item }) => (
    <TouchableOpacity
      style={styles.placeItem}
      onPress={() => handleSelectLocation(item)}
    >
      <View style={styles.placeInfo}>
        <Text style={[styles.placeName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text 
          style={[styles.placeAddress, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {item.fullAddress}
        </Text>
      </View>
      {item.distance && (
        <Text style={[styles.placeDistance, { color: colors.textSecondary }]}>
          {item.distance}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        Keyboard.dismiss();
        onClose();
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            {
              transform: [{
                translateY: slideAnim
              }]
            }
          ]}
        >
          <BlurView
            intensity={100}
            tint={isDark ? 'dark' : 'light'}
            style={styles.blurContainer}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                  Add Location
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
                  ref={inputRef}
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search places nearby"
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>

              {loading ? (
                <View style={styles.centerContent}>
                  <ActivityIndicator color={THEME_PINK} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Finding nearby places...
                  </Text>
                </View>
              ) : error ? (
                <View style={styles.centerContent}>
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {error}
                  </Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={getCurrentLocation}
                  >
                    <Text style={[styles.retryText, { color: THEME_PINK }]}>
                      Retry
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={nearbyPlaces}
                  renderItem={renderPlace}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.placesList}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                  style={styles.list}
                />
              )}
            </View>
          </BlurView>
        </Animated.View>
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
  contentContainer: {
    backgroundColor: 'transparent',
  },
  blurContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 16,
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
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    padding: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  placesList: {
    paddingBottom: 16,
  },
  list: {
    maxHeight: Dimensions.get('window').height * 0.4,
  },
  placeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 105, 180, 0.2)',
  },
  placeInfo: {
    flex: 1,
    marginRight: 12,
  },
  placeName: {
    fontSize: 16,
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 12,
    marginTop: 2,
  },
  placeDistance: {
    fontSize: 12,
    fontWeight: '500',
  },
});
