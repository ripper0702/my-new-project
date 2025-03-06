import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Easing,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import {
  PlusIcon,
  SearchIcon,
  MarketIcon,
  CameraIcon,
  ShareIcon,
  CloseIcon,
} from './icons/TabBarIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = SCREEN_WIDTH * 0.75;

export const FloatingActionButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const navigation = useNavigation();
  
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const menuAnim = React.useRef(new Animated.Value(0)).current;
  const loadingAnim = React.useRef(new Animated.Value(0)).current;
  const liquidAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(loadingAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      loadingAnim.setValue(0);
    }
  }, [isLoading]);

  const animatePress = (pressed) => {
    Animated.spring(scaleAnim, {
      toValue: pressed ? 0.9 : 1,
      useNativeDriver: true,
    }).start();
    setIsPressed(pressed);
  };

  const toggleMenu = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    // Reset liquid animation
    liquidAnim.setValue(0);
    
    // Animate menu expansion with liquid effect
    Animated.parallel([
      Animated.spring(menuAnim, {
        toValue,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(liquidAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(liquidAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const handleAction = async (action) => {
    setIsLoading(true);
    setIsExpanded(false);
    menuAnim.setValue(0);

    switch (action) {
      case 'search':
        navigation.navigate('MainApp', { screen: 'Search' });
        break;
      case 'market':
        navigation.navigate('MainApp', { screen: 'Market' });
        break;
      case 'share':
        // Share functionality
        break;
    }
    
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleCameraPress = () => {
    setIsExpanded(false);
    setIsLoading(true);
    navigation.navigate('Camera');
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const renderActionButton = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Animated.View 
            style={[
              styles.loadingBar,
              {
                transform: [
                  {
                    translateX: loadingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 50],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      );
    }

    return (
      <PlusIcon size={24} color={isPressed ? '#FFFFFF' : '#FF69B4'} />
    );
  };

  const menuScale = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const menuOpacity = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const liquidTransform = liquidAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  return (
    <View style={styles.container}>
      {isExpanded && (
        <Animated.View
          style={[
            styles.menu,
            {
              transform: [
                { scale: menuScale },
                { scaleY: liquidTransform },
              ],
              opacity: menuOpacity,
            },
          ]}
        >
          <BlurView intensity={80} tint="dark" style={styles.menuBlur}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleAction('search')}
            >
              <SearchIcon size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleAction('market')}
            >
              <MarketIcon size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleCameraPress}
            >
              <CameraIcon size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleAction('share')}
            >
              <ShareIcon size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={toggleMenu}
            >
              <CloseIcon size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      )}
      <Animated.View
        style={[
          styles.buttonContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            isPressed && styles.buttonPressed,
          ]}
          onPress={toggleMenu}
          onPressIn={() => animatePress(true)}
          onPressOut={() => animatePress(false)}
          activeOpacity={1}
        >
          {renderActionButton()}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: Platform.OS === 'ios' ? 40 : 36,
    zIndex: 1000,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  buttonPressed: {
    backgroundColor: '#FF69B4',
  },
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    height: 56,
    bottom: 84,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    borderRadius: 28,
    overflow: 'hidden',
  },
  menuBlur: {
    flexDirection: 'row',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 105, 180, 0.3)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#FF69B4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingContainer: {
    width: 40,
    height: 3,
    backgroundColor: 'rgba(255, 105, 180, 0.2)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  loadingBar: {
    position: 'absolute',
    width: 40,
    height: '100%',
    backgroundColor: '#FF69B4',
    borderRadius: 1.5,
  },
});
