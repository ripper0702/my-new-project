import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import Feed from '../components/Feed';
import { ThemeIcon, NotificationIcon } from '../components/icons';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const HEADER_HEIGHT = Platform.OS === 'ios' ? 92 : 72;

const Header = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.headerContainer]}>
      <View style={styles.headerContent}>
        <View style={styles.leftSection}>
          <Image 
            source={require('../assets/header.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.rightSection}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={toggleTheme}
          >
            <ThemeIcon color={colors.text} size={24} isDark={isDark} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={[styles.notificationBadge, { backgroundColor: colors.notification }]}>
              <Text style={styles.badgeText}>2</Text>
            </View>
            <NotificationIcon color={colors.text} size={24} />
          </TouchableOpacity>
          
          {/* Temporary Debug Button */}
          <TouchableOpacity 
            style={[styles.iconButton, styles.debugButton]}
            onPress={() => navigation.navigate('StoryDebug')}
          >
            <Text style={styles.debugButtonText}>Debug</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const HomeScreen = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.isDark ? 'light' : 'dark'} />
      <Header />
      <View style={styles.content}>
        <Feed />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginTop: HEADER_HEIGHT,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    height: HEADER_HEIGHT,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 0,
  },
  rightSection: {
    flexDirection: 'row',
    gap: 16,
  },
  logo: {
    height: 63,
    width: 165,
    marginLeft: -24,
    marginVertical: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  debugButton: {
    backgroundColor: 'red',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default HomeScreen;
