import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStories } from '../context/StoriesContext';
import { useUser } from '../context/UserContext';
import StoryContextTest from '../tests/StoryContextTest';

const StoryDebugScreen = () => {
  const navigation = useNavigation();
  const { stories, addStory } = useStories();
  const { userProfile } = useUser();
  const [testCaption, setTestCaption] = useState('Test caption');
  
  const myStory = stories.find(s => s.username === userProfile.username);
  
  const handleAddTestMedia = async () => {
    // Create a test media item
    const testMedia = {
      uri: `https://picsum.photos/500/500?random=${Date.now()}`,
      type: 'image'
    };
    
    console.log("Adding test media:", testMedia);
    
    try {
      // Add the test media to the user's story
      const updatedStory = await addStory(testMedia);
      console.log("Story updated with test media:", updatedStory);
      
      // Navigate to the story to see the result
      navigation.navigate('Story', { story: updatedStory });
    } catch (error) {
      console.error("Error adding test media:", error);
    }
  };
  
  const handleAddMediaWithCaption = async () => {
    // Create a test media item
    const testMedia = {
      uri: `https://picsum.photos/500/500?random=${Date.now()}`,
      type: 'image'
    };
    
    console.log("Adding test media with caption:", testMedia, testCaption);
    
    try {
      // Add the test media to the user's story with the specified caption
      const updatedStory = await addStory(testMedia, {
        caption: testCaption,
        allowComments: true
      });
      console.log("Story updated with captioned media:", updatedStory);
      
      // Navigate to the story to see the result
      navigation.navigate('Story', { story: updatedStory });
    } catch (error) {
      console.error("Error adding test media with caption:", error);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Story Debug Screen</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <Button 
          title="Take a Photo for Story" 
          onPress={() => navigation.navigate('Camera', { isStory: true })}
        />
        <View style={styles.spacer} />
        <Button 
          title="Add Test Media (No Caption)" 
          onPress={handleAddTestMedia}
        />
        <View style={styles.spacer} />
        
        <Text style={styles.label}>Test Caption:</Text>
        <TextInput
          style={styles.input}
          value={testCaption}
          onChangeText={setTestCaption}
          placeholder="Enter a test caption"
        />
        <View style={styles.spacer} />
        <Button 
          title="Add Media with Caption" 
          onPress={handleAddMediaWithCaption}
        />
        <View style={styles.spacer} />
        
        {myStory && (
          <Button 
            title="View My Story" 
            onPress={() => navigation.navigate('Story', { story: myStory })}
          />
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Story Context</Text>
        <StoryContextTest />
      </View>
      
      <View style={styles.spacer} />
      <Button 
        title="Back to Home" 
        onPress={() => navigation.navigate('Home')}
      />
      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  spacer: {
    height: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginVertical: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default StoryDebugScreen;
