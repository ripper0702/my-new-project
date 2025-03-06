import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { colors } from '../theme';

const SignUpScreen = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  return (
    <View>
      <TextInput
        style={[
          styles.input,
          { 
            color: colors.text,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: 'rgba(128, 128, 128, 0.2)',
            borderRadius: 20,
            paddingVertical: 12,
            textAlignVertical: 'center',
            minHeight: 45
          }
        ]}
        placeholder="Email"
        placeholderTextColor={colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={[
          styles.input,
          { 
            color: colors.text,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: 'rgba(128, 128, 128, 0.2)',
            borderRadius: 20,
            paddingVertical: 12,
            textAlignVertical: 'center',
            minHeight: 45
          }
        ]}
        placeholder="Password"
        placeholderTextColor={colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    // existing styles
  }
});

export default SignUpScreen;