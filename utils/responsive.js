import { Dimensions, Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';

export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
};

export const getWindowDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

export const useResponsive = () => {
  const { width } = getWindowDimensions();
  
  return {
    isMobile: width <= BREAKPOINTS.mobile,
    isTablet: width > BREAKPOINTS.mobile && width <= BREAKPOINTS.tablet,
    isDesktop: width > BREAKPOINTS.tablet,
    currentWidth: width,
  };
};

export const getResponsiveValue = (mobile, tablet, desktop) => {
  if (isWeb) {
    const { width } = getWindowDimensions();
    if (width <= BREAKPOINTS.mobile) return mobile;
    if (width <= BREAKPOINTS.tablet) return tablet;
    return desktop;
  }
  return mobile; // Default to mobile value for native platforms
};
