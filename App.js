import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { ThemeProvider } from './theme/ThemeContext';
import { ThreadProvider } from './context/ThreadContext';
import { KeyboardProvider } from './context/KeyboardContext';
import { PostsProvider } from './context/PostsContext';
import { UserProvider } from './context/UserContext';
import { ChatProvider } from './context/ChatContext';
import { StoriesProvider } from './context/StoriesContext';

// Auth & Onboarding Screens
import OnboardingScreen1 from './OnboardingScreen1';
import OnboardingScreen2 from './OnboardingScreen2';
import OnboardingScreen3 from './OnboardingScreen3';
import OnboardingScreen4 from './OnboardingScreen4';
import SignUp from './SignUp';
import Login from './Login';
import ForgotPassword from './ForgotPassword';

// Main App Navigation
import TabNavigator from './navigation/TabNavigator';
import CameraScreen from './screens/CameraScreen';
import PostScreen from './screens/PostScreen';
import ThreadScreen from './screens/ThreadScreen';
import StoryScreen from './screens/StoryScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import NewThreadScreen from './screens/NewThreadScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ChatScreen from './screens/ChatScreen';
import StoryEditor from './screens/StoryEditor';
import StoryDebugScreen from './screens/StoryDebugScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <ThreadProvider>
        <KeyboardProvider>
          <UserProvider>
            <PostsProvider>
              <ChatProvider>
                <StoriesProvider>
                  <View style={styles.container}>
                    <StatusBar style="light" />
                    <NavigationContainer>
                      <Stack.Navigator
                        initialRouteName="OnboardingScreen1"
                        screenOptions={{
                          headerShown: false,
                          animation: 'slide_from_right',
                        }}
                      >
                        <Stack.Screen name="OnboardingScreen1" component={OnboardingScreen1} />
                        <Stack.Screen name="OnboardingScreen2" component={OnboardingScreen2} />
                        <Stack.Screen name="OnboardingScreen3" component={OnboardingScreen3} />
                        <Stack.Screen name="OnboardingScreen4" component={OnboardingScreen4} />
                        <Stack.Screen name="SignUp" component={SignUp} />
                        <Stack.Screen name="Login" component={Login} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
                        <Stack.Screen 
                          name="MainApp" 
                          component={TabNavigator}
                          options={{
                            gestureEnabled: false,
                          }}
                        />
                        <Stack.Screen 
                          name="Camera" 
                          component={CameraScreen}
                          options={{
                            animation: 'slide_from_bottom',
                            presentation: 'modal',
                            gestureEnabled: true,
                            gestureDirection: 'vertical',
                          }}
                        />
                        <Stack.Screen 
                          name="Post" 
                          component={PostScreen}
                          options={{
                            animation: 'slide_from_right',
                            presentation: 'card',
                            gestureEnabled: true,
                            gestureDirection: 'horizontal',
                          }}
                        />
                        <Stack.Screen 
                          name="Thread" 
                          component={ThreadScreen}
                          options={{
                            animation: 'slide_from_right',
                            presentation: 'card',
                            gestureEnabled: true,
                            gestureDirection: 'horizontal',
                          }}
                        />
                        <Stack.Screen 
                          name="Story" 
                          component={StoryScreen}
                          options={{
                            animation: 'fade',
                            presentation: 'transparentModal',
                            gestureEnabled: true,
                            gestureDirection: 'horizontal',
                          }}
                        />
                        <Stack.Screen 
                          name="Notifications" 
                          component={NotificationsScreen}
                          options={{
                            animation: 'slide_from_right',
                            presentation: 'card',
                            gestureEnabled: true,
                            gestureDirection: 'horizontal',
                          }}
                        />
                        <Stack.Screen 
                          name="NewThread" 
                          component={NewThreadScreen}
                          options={{
                            animation: 'slide_from_bottom',
                            presentation: 'modal',
                            gestureEnabled: true,
                            gestureDirection: 'vertical',
                          }}
                        />
                        <Stack.Screen 
                          name="EditProfile" 
                          component={EditProfileScreen}
                          options={{
                            animation: 'slide_from_right',
                            presentation: 'card',
                            gestureEnabled: true,
                            gestureDirection: 'horizontal',
                          }}
                        />
                        <Stack.Screen 
                          name="Chat" 
                          component={ChatScreen}
                          options={{
                            animation: 'slide_from_right',
                            presentation: 'card',
                            gestureEnabled: true,
                            gestureDirection: 'horizontal',
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen 
                          name="StoryEditor" 
                          component={StoryEditor}
                          options={{
                            animation: 'slide_from_right',
                            presentation: 'card',
                            gestureEnabled: true,
                            gestureDirection: 'horizontal',
                          }}
                        />
                        <Stack.Screen 
                          name="StoryDebug" 
                          component={StoryDebugScreen}
                          options={{
                            animation: 'slide_from_right',
                            presentation: 'card',
                            gestureEnabled: true,
                            gestureDirection: 'horizontal',
                            headerShown: true,
                            title: 'Story Debugger'
                          }}
                        />
                      </Stack.Navigator>
                    </NavigationContainer>
                  </View>
                </StoriesProvider>
              </ChatProvider>
            </PostsProvider>
          </UserProvider>
        </KeyboardProvider>
      </ThreadProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
