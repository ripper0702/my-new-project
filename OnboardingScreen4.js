import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const OnboardingScreen4 = ({ navigation }) => {
  const goToScreen = (screenNumber) => {
    switch(screenNumber) {
      case 1:
        navigation.navigate('OnboardingScreen1');
        break;
      case 2:
        navigation.navigate('OnboardingScreen2');
        break;
      case 3:
        navigation.navigate('OnboardingScreen3');
        break;
      case 4:
        // Already on screen 4
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('./assets/illustrations/chat.jpg')} 
        style={styles.backgroundImage} 
        resizeMode="cover" 
      />
      <LinearGradient
        colors={['rgba(235, 245, 251, 0.2)', 'rgba(235, 245, 251, 0.8)', '#EBF5FB']}
        style={styles.gradient}
      />
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.headline}>Chat and Connect{'\n'}Privately</Text>
          <BlurView intensity={10} tint="light" style={styles.dialogBox}>
            <Text style={styles.subheadline}>Connect with friends, organize group events, and discuss your interests in real-time through private and group chats.</Text>
          </BlurView>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.signUpButton]}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.loginButton]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.buttonText, styles.loginButtonText]}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <TouchableOpacity onPress={() => goToScreen(1)}>
          <View style={styles.progressDot} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => goToScreen(2)}>
          <View style={styles.progressDot} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => goToScreen(3)}>
          <View style={styles.progressDot} />
        </TouchableOpacity>
        <TouchableOpacity>
          <View style={styles.progressDotActive} />
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
    height: Dimensions.get('window').height,
    opacity: 0.95,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: Dimensions.get('window').height,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -80,
  },
  headline: {
    fontWeight: 'bold',
    fontSize: 36,
    color: '#333333',
    marginBottom: 24,
    lineHeight: 44,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dialogBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        backgroundColor: 'transparent',
      },
      android: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
      },
    }),
  },
  subheadline: {
    fontSize: 18,
    color: '#333333',
    lineHeight: 26,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  signUpButton: {
    backgroundColor: '#F25EA2',
  },
  loginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#F25EA2',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  loginButtonText: {
    color: '#F25EA2',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(216, 216, 216, 0.8)',
  },
  progressDotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F25EA2',
  },
});

export default OnboardingScreen4;