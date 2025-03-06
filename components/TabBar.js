import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { HomeIcon, ProfileIcon } from './icons/TabBarIcons';
import { FloatingActionButton } from './FloatingActionButton';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_WIDTH = SCREEN_WIDTH * 0.85;

export const TabBar = ({ state, descriptors, navigation }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.safeArea}>
      <BlurView intensity={50} tint={isDark ? 'dark' : 'light'} style={styles.container}>
        <LinearGradient
          colors={[colors.primaryTransparent, colors.primaryLight]}
          style={styles.gradient}
        >
          <View style={styles.innerContainer}>
            {state.routes.map((route, index) => {
              if (route.name !== 'Home' && route.name !== 'Profile') return null;
              
              const { options } = descriptors[route.key];
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const getIcon = () => {
                const props = {
                  size: 24,
                  color: isFocused ? colors.primary : colors.textSecondary,
                  focused: isFocused,
                };

                switch (route.name) {
                  case 'Home':
                    return <HomeIcon {...props} />;
                  case 'Profile':
                    return <ProfileIcon {...props} />;
                  default:
                    return null;
                }
              };

              const isLeft = route.name === 'Home';
              const isRight = route.name === 'Profile';

              return (
                <TouchableOpacity
                  key={index}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  style={[
                    styles.tabButton,
                    isLeft && styles.leftTab,
                    isRight && styles.rightTab,
                  ]}
                  activeOpacity={0.7}
                >
                  {getIcon()}
                  {isFocused && <View style={[styles.indicator, { backgroundColor: colors.primary }]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>
      </BlurView>
      <FloatingActionButton />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
  },
  container: {
    width: TAB_BAR_WIDTH,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftTab: {
    alignItems: 'flex-start',
  },
  rightTab: {
    alignItems: 'flex-end',
  },
  indicator: {
    position: 'absolute',
    bottom: 12,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default TabBar;
