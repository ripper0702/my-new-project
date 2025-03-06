import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const OnboardingScreen2 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image 
        source={require('./assets/illustrations/community.jpg')} 
        style={styles.backgroundImage} 
        resizeMode="cover" 
      />
      <LinearGradient
        colors={['transparent', 'rgba(235, 245, 251, 0.9)', '#EBF5FB']}
        style={styles.gradient}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.headline}>Connect with{'\n'}Your Community</Text>
        <Text style={styles.subheadline}>See what's happening nearby, share your experiences, and connect with moms who share your interests. Discover local recommendations and join conversations.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('OnboardingScreen3')}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.progressContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('OnboardingScreen1')}>
          <View style={styles.progressDot} />
        </TouchableOpacity>
        <TouchableOpacity>
          <View style={styles.progressDotActive} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('OnboardingScreen3')}>
          <View style={styles.progressDot} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('OnboardingScreen4')}>
          <View style={styles.progressDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF5FB',
  },
  backgroundImage: {
    position: 'absolute',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.7,
    top: 0,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: Dimensions.get('window').height * 0.8,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    paddingBottom: 100,
  },
  headline: {
    fontWeight: 'bold',
    fontSize: 36,
    color: '#333333',
    marginBottom: 16,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subheadline: {
    fontSize: 18,
    color: '#7F8C8D',
    marginBottom: 32,
    lineHeight: 26,
  },
  button: {
    backgroundColor: '#F25EA2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(216, 216, 216, 0.8)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F25EA2',
    marginHorizontal: 4,
  },
});

export default OnboardingScreen2;