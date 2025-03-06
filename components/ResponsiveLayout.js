import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { useResponsive, isWeb } from '../utils/responsive';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ResponsiveLayout = ({ children, style }) => {
  const { isDesktop } = useResponsive();

  return (
    <SafeAreaView style={[
      styles.container,
      isWeb && isDesktop && styles.desktopContainer,
      style
    ]}>
      <View style={[
        styles.content,
        isWeb && isDesktop && styles.desktopContent
      ]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF5FB',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  desktopContainer: {
    paddingTop: 64, // Account for top navigation
  },
  desktopContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
  },
});
