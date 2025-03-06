import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useResponsive, isWeb } from '../utils/responsive';
import { TabBar } from './TabBar';

export const ResponsiveNavigation = ({ state, descriptors, navigation }) => {
  const { isDesktop } = useResponsive();

  if (!isWeb || !isDesktop) {
    return <TabBar state={state} descriptors={descriptors} navigation={navigation} />;
  }

  // Web Desktop Navigation
  return (
    <View style={styles.desktopNav}>
      <BlurView intensity={20} tint="light" style={styles.container}>
        <View style={styles.content}>
          {state.routes.map((route, index) => {
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

            return (
              <View
                key={route.key}
                style={[
                  styles.tabItem,
                  isFocused && styles.tabItemActive,
                ]}
                onClick={onPress}
                role="button"
                tabIndex={0}
              >
                {options.tabBarIcon?.({
                  focused: isFocused,
                  color: isFocused ? '#FF69B4' : '#808080',
                  size: 24,
                })}
                <span style={styles.tabLabel}>
                  {route.name}
                </span>
              </View>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  desktopNav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    zIndex: 1000,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 20,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(0,0,0,0.05)',
    },
  },
  tabItemActive: {
    backgroundColor: 'rgba(255,105,180,0.1)',
  },
  tabLabel: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
});
