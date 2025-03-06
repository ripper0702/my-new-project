import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getInputStyle = (inputName) => {
    return [
      styles.input,
      focusedInput === inputName && styles.inputFocused,
      styles.inputWithIcon,
    ];
  };

  const handleSubmit = () => {
    // Here you would implement the actual password reset logic
    setIsSubmitted(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#EBF5FB', '#F8E8F2']}
        style={styles.gradient}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back to Login</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {!isSubmitted 
              ? "Don't worry! It happens. Please enter the email address associated with your account."
              : "Check your email for instructions to reset your password."}
          </Text>
        </View>

        <BlurView intensity={60} tint="light" style={styles.formContainer}>
          {!isSubmitted ? (
            <>
              <Image
                source={require('./assets/illustrations/forgot-password.png')}
                style={styles.illustration}
                resizeMode="contain"
              />
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={getInputStyle('email')}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <TouchableOpacity 
                style={styles.resetButton}
                onPress={handleSubmit}
              >
                <Text style={styles.resetButtonText}>Send Reset Link</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Image
                source={require('./assets/illustrations/email-sent.gif')}
                style={[styles.illustration, styles.successIllustration]}
                resizeMode="contain"
              />
              
              <View style={styles.successMessage}>
                <Text style={styles.successTitle}>Email Sent!</Text>
                <Text style={styles.successText}>
                  We've sent you an email with instructions to reset your password.
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.resetButtonText}>Back to Login</Text>
              </TouchableOpacity>
            </>
          )}
        </BlurView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Didn't receive the email? </Text>
          <TouchableOpacity onPress={() => setIsSubmitted(false)}>
            <Text style={styles.resendLink}>Try again</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF5FB',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: Dimensions.get('window').height,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 32,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  illustration: {
    width: '80%',
    height: 200,
    marginBottom: 24,
  },
  successIllustration: {
    height: 250,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333333',
    width: '100%',
  },
  inputFocused: {
    borderColor: '#F25EA2',
    borderWidth: 2,
    shadowColor: '#F25EA2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputWithIcon: {
    paddingRight: 50,
  },
  resetButton: {
    backgroundColor: '#F25EA2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successMessage: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 16,
    color: '#666666',
  },
  resendLink: {
    fontSize: 16,
    color: '#F25EA2',
    fontWeight: 'bold',
  },
});

export default ForgotPassword;
