import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import BackIcon from '../components/icons/BackIcon';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const mockNotifications = [];

const NotificationItem = ({ item, index }) => {
  const { colors, isDark } = useTheme();
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      index * 100,
      withSpring(0, { damping: 12, stiffness: 100 })
    );
    opacity.value = withDelay(
      index * 100,
      withTiming(1, { duration: 500 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedTouchable
      style={[
        styles.notificationItem,
        animatedStyle,
        {
          backgroundColor: isDark ? colors.surface : '#FFFFFF',
        },
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
        <View style={styles.textContainer}>
          <Text style={[styles.username, { color: colors.text }]}>
            {item.username}{' '}
            <Text style={[styles.action, { color: colors.textSecondary }]}>
              {item.action}
            </Text>
          </Text>
          {item.comment && (
            <Text style={[styles.comment, { color: colors.textSecondary }]}>
              {item.comment}
            </Text>
          )}
          <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
            {item.timeAgo}
          </Text>
        </View>
        {item.postImage && (
          <Image source={{ uri: item.postImage }} style={styles.postImage} />
        )}
      </View>
      {item.isNew && (
        <View style={[styles.newDot, { backgroundColor: '#FF69B4' }]} />
      )}
    </AnimatedTouchable>
  );
};

const NotificationsScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <LinearGradient
        colors={[isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)', 'transparent']}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <BackIcon color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mockNotifications.map((notification, index) => (
          <NotificationItem
            key={notification.id}
            item={notification}
            index={index}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  notificationItem: {
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
  },
  action: {
    fontSize: 14,
    fontWeight: '400',
  },
  comment: {
    fontSize: 13,
    marginTop: 4,
  },
  timeAgo: {
    fontSize: 12,
    marginTop: 4,
  },
  postImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginLeft: 12,
  },
  newDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default NotificationsScreen;
