import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeContext';

const THEME_PINK = '#FF69B4';
const NUM_OF_BARS = 30;
const RECORDING_OPTIONS = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 256000,
  },
  ios: {
    extension: '.m4a',
    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 256000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};

export default function VoiceRecorder({ visible, onClose, onSave }) {
  const { colors, isDark } = useTheme();
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const animatedBars = useRef([...Array(NUM_OF_BARS)].map(() => new Animated.Value(0))).current;
  const animationRef = useRef(null);
  const durationRef = useRef(null);

  useEffect(() => {
    setupAudio();
    return () => {
      cleanupAudio();
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      resetRecording();
    }
  }, [visible]);

  const setupAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const cleanupAudio = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
      }
      if (sound) {
        await sound.unloadAsync();
      }
      clearInterval(durationRef.current);
      stopBarAnimation();
      setRecording(null);
      setSound(null);
      setIsRecording(false);
      setIsPlaying(false);
      setAudioUri(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Error cleaning up audio:', error);
    }
  };

  const resetRecording = async () => {
    await cleanupAudio();
  };

  const startRecording = async () => {
    try {
      await resetRecording();
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      });

      const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS);
      setRecording(recording);
      setIsRecording(true);
      startBarAnimation();

      let duration = 0;
      durationRef.current = setInterval(() => {
        duration += 1000;
        setRecordingDuration(duration);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      clearInterval(durationRef.current);
      stopBarAnimation();

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stopped, URI:', uri);
      
      if (uri) {
        setAudioUri(uri);
        
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false
        });
        
        await loadSound(uri);
      }
      
      setRecording(null);
    } catch (error) {
      console.error('Error stopping recording:', error);
      alert('Failed to stop recording. Please try again.');
    }
  };

  const loadSound = async (uri) => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { 
          shouldPlay: false,
          volume: 1.0,
          rate: 1.0,
          shouldCorrectPitch: true,
          progressUpdateIntervalMillis: 100,
        },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      console.log('Sound loaded successfully');
    } catch (error) {
      console.error('Error loading sound:', error);
      alert('Failed to load recording. Please try again.');
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
      stopBarAnimation();
    }
  };

  const playSound = async () => {
    if (!sound) {
      console.log('No sound to play');
      return;
    }

    try {
      if (isPlaying) {
        console.log('Pausing sound');
        await sound.pauseAsync();
        setIsPlaying(false);
        stopBarAnimation();
      } else {
        console.log('Playing sound');
        await sound.setVolumeAsync(1.0);
        await sound.setPositionAsync(0);
        await sound.playAsync();
        setIsPlaying(true);
        startPlaybackAnimation();
      }
    } catch (error) {
      console.error('Error playing/pausing sound:', error);
      setIsPlaying(false);
      alert('Failed to play recording. Please try again.');
    }
  };

  const handleSave = () => {
    if (audioUri) {
      console.log('Saving audio with URI:', audioUri);
      onSave(audioUri);
      onClose();
    }
  };

  const startBarAnimation = () => {
    stopBarAnimation();
    animationRef.current = Animated.loop(
      Animated.sequence(
        animatedBars.map((bar) =>
          Animated.sequence([
            Animated.timing(bar, {
              toValue: Math.random(),
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(bar, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        )
      )
    );
    animationRef.current.start();
  };

  const startPlaybackAnimation = () => {
    stopBarAnimation();
    animationRef.current = Animated.loop(
      Animated.sequence([
        ...animatedBars.map((bar) =>
          Animated.timing(bar, {
            toValue: Math.random() * 0.5 + 0.5,
            duration: 200,
            useNativeDriver: true,
          })
        ),
        ...animatedBars.map((bar) =>
          Animated.timing(bar, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          })
        ),
      ])
    );
    animationRef.current.start();
  };

  const stopBarAnimation = () => {
    if (animationRef.current) {
      animationRef.current.stop();
      animatedBars.forEach((bar) => bar.setValue(0));
    }
  };

  const formatDuration = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <BlurView
          intensity={100}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blurContainer}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                {isRecording ? 'Recording...' : sound ? 'Preview' : 'Record Voice'}
              </Text>
              {sound && (
                <TouchableOpacity
                  style={styles.reRecordButton}
                  onPress={resetRecording}
                >
                  <Text style={[styles.reRecordText, { color: THEME_PINK }]}>Re-record</Text>
                </TouchableOpacity>
              )}
            </View>

            {isRecording && (
              <Text style={[styles.duration, { color: colors.text }]}>
                {formatDuration(recordingDuration)}
              </Text>
            )}

            <View style={styles.waveformContainer}>
              {animatedBars.map((bar, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.bar,
                    {
                      backgroundColor: THEME_PINK,
                      transform: [{
                        scaleY: bar.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.1, 1],
                        }),
                      }],
                    },
                  ]}
                />
              ))}
            </View>

            <View style={styles.controls}>
              {!sound ? (
                <TouchableOpacity
                  style={[
                    styles.recordButton,
                    { backgroundColor: isRecording ? '#FF4B4B' : THEME_PINK },
                  ]}
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  <View style={[
                    styles.recordButtonInner,
                    { backgroundColor: isRecording ? '#FF4B4B' : THEME_PINK },
                  ]} />
                </TouchableOpacity>
              ) : (
                <View style={styles.playbackControls}>
                  <TouchableOpacity
                    style={[styles.playButton, { backgroundColor: THEME_PINK }]}
                    onPress={playSound}
                  >
                    <Text style={styles.playButtonText}>
                      {isPlaying ? '⏸️' : '▶️'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: THEME_PINK }]}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveButtonText}>Add to Post</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={[styles.closeText, { color: THEME_PINK }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  blurContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  reRecordButton: {
    padding: 8,
  },
  reRecordText: {
    fontSize: 16,
    fontWeight: '600',
  },
  duration: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
    marginBottom: 30,
  },
  bar: {
    width: 3,
    height: 40,
    marginHorizontal: 2 / 2,
    borderRadius: 3 / 2,
  },
  controls: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recordButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  playButtonText: {
    color: '#FFF',
    fontSize: 20,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 20,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
