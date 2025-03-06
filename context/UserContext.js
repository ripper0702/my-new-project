import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const initialUserProfile = {
    name: 'Current User',
    username: '@CurrentUser',
    bio: '',
    location: '',
    avatar: null,
    childInfo: {
      age: '',
      dietaryNeeds: ''
    }
  };

  const [userProfile, setUserProfile] = useState(initialUserProfile);

  const updateProfile = async (updates) => {
    try {
      const newProfile = { ...userProfile, ...updates };
      setUserProfile(newProfile);
      await AsyncStorage.setItem('userProfile', JSON.stringify(newProfile));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  React.useEffect(() => {
    loadProfile();
  }, []);

  return (
    <UserContext.Provider value={{ userProfile, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
