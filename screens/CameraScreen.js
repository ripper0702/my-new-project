import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Image,
  Text,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { manipulateAsync } from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FlashIcon,
  FlipCameraIcon,
  CaptureIcon,
  CloseIcon,
  CheckIcon,
} from '../components/icons/TabBarIcons';
import { Alert } from 'react-native';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const WINDOW_WIDTH = Dimensions.get('window').width;
const CAPTURE_SIZE = Math.floor(WINDOW_HEIGHT * 0.08);
const THEME_PINK = '#FF69B4';

export default function CameraScreen({ navigation, route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [isPreview, setIsPreview] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef();
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Log route params for debugging
  console.log("[CameraScreen] Route params:", JSON.stringify(route.params, null, 2));

  useEffect(() => {
    if (isProcessing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [isProcessing]);

  const onCameraReady = () => {
    console.log("[CameraScreen] Camera ready");
    setIsCameraReady(true);
  };

  const switchCamera = () => {
    if (isPreview || isProcessing) return;
    setFacing(current => current === 'back' ? 'front' : 'back');
  };

  const toggleFlash = () => {
    if (isPreview || isProcessing) return;
    setFlash(current => {
      switch (current) {
        case 'off':
          return 'on';
        case 'on':
          return 'auto';
        default:
          return 'off';
      }
    });
  };

  const cancelPreview = async () => {
    if (cameraRef.current) {
      setIsPreview(false);
      setCapturedImage(null);
    }
  };

  const savePhoto = async () => {
    if (capturedImage) {
      try {
        await MediaLibrary.saveToLibraryAsync(capturedImage.uri);
        navigation.replace('Post', { imageUri: capturedImage.uri });
      } catch (error) {
        console.log('Error saving photo:', error);
      }
    }
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        console.log("[CameraScreen] Taking picture...");
        setIsProcessing(true);
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
          skipProcessing: true,
        });

        console.log("[CameraScreen] Photo captured:", photo.uri);

        const source = await manipulateAsync(
          photo.uri,
          [{ resize: { width: 1080 } }],
          { compress: 0.7, format: 'jpeg' }
        );
        
        console.log("[CameraScreen] Photo processed:", source.uri);
        
        const returnTo = route.params?.returnTo;
        const isStory = route.params?.isStory;
        
        console.log("[CameraScreen] Navigation target:", returnTo || (isStory ? 'Story' : 'Default'));
        
        if (returnTo === 'NewThread') {
          navigation.replace('NewThread', { capturedImage: source.uri });
        } else if (returnTo === 'Story' || isStory) {
          console.log("[CameraScreen] Navigating to StoryEditor with media:", { uri: source.uri, type: 'image' });
          navigation.replace('StoryEditor', { media: { uri: source.uri, type: 'image' } });
        } else {
          navigation.goBack();
        }
      } catch (error) {
        console.error('[CameraScreen] Error capturing photo:', error);
        Alert.alert('Error', 'Failed to capture photo. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (!permission || !mediaPermission) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[
            'rgba(255, 105, 180, 0.3)',
            'rgba(255, 105, 180, 0.1)',
            'rgba(255, 105, 180, 0.3)'
          ]}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.text}>Requesting permissions...</Text>
      </View>
    );
  }

  if (!permission.granted || !mediaPermission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[
            'rgba(255, 105, 180, 0.3)',
            'rgba(255, 105, 180, 0.1)',
            'rgba(255, 105, 180, 0.3)'
          ]}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={async () => {
            await requestPermission();
            await requestMediaPermission();
          }}
        >
          <Text style={styles.permissionButtonText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        flashMode={flash}
        onCameraReady={onCameraReady}
        onMountError={(error) => {
          console.log("Camera mount error:", error);
        }}
      >
        <View style={StyleSheet.absoluteFillObject}>
          {isPreview && capturedImage ? (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: capturedImage.uri }}
                style={styles.previewImage}
              />
              <BlurView intensity={80} tint="dark" style={styles.previewActions}>
                <LinearGradient
                  colors={['transparent', 'rgba(255, 105, 180, 0.2)']}
                  style={StyleSheet.absoluteFillObject}
                />
                <TouchableOpacity
                  onPress={cancelPreview}
                  style={styles.previewButton}
                >
                  <CloseIcon size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={savePhoto}
                  style={[styles.previewButton, styles.saveButton]}
                >
                  <CheckIcon size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </BlurView>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <CloseIcon size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.bottomActions}>
                <BlurView intensity={80} tint="dark" style={styles.controlsContainer}>
                  <LinearGradient
                    colors={['transparent', 'rgba(255, 105, 180, 0.2)']}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <TouchableOpacity
                    disabled={!isCameraReady || isProcessing}
                    onPress={toggleFlash}
                    style={styles.controlButton}
                  >
                    <FlashIcon
                      size={24}
                      color={flash === 'off' ? 'rgba(255,255,255,0.5)' : '#FFFFFF'}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={!isCameraReady || isProcessing}
                    onPress={handleCapture}
                    style={styles.captureButton}
                  >
                    {isProcessing ? (
                      <Animated.View style={[styles.captureInner, {
                        opacity: pulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1]
                        })
                      }]}>
                        <LinearGradient
                          colors={['rgba(255, 105, 180, 0.8)', THEME_PINK]}
                          style={StyleSheet.absoluteFillObject}
                        />
                      </Animated.View>
                    ) : (
                      <View style={styles.captureInner}>
                        <LinearGradient
                          colors={['rgba(255, 105, 180, 0.8)', THEME_PINK]}
                          style={StyleSheet.absoluteFillObject}
                        />
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={!isCameraReady || isProcessing}
                    onPress={switchCamera}
                    style={styles.controlButton}
                  >
                    <FlipCameraIcon size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </BlurView>
              </View>
            </>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    textShadowColor: 'rgba(255, 105, 180, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  permissionButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: THEME_PINK,
    borderRadius: 8,
    shadowColor: THEME_PINK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(255, 105, 180, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'column',
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
  },
  previewActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  previewButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 105, 180, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.2)',
  },
  saveButton: {
    backgroundColor: THEME_PINK,
    borderWidth: 0,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 105, 180, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.2)',
    zIndex: 2,
  },
  bottomActions: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 100,
    borderRadius: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.2)',
    overflow: 'hidden',
  },
  controlButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 105, 180, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.2)',
  },
  captureButton: {
    width: CAPTURE_SIZE,
    height: CAPTURE_SIZE,
    borderRadius: CAPTURE_SIZE / 2,
    borderWidth: 4,
    borderColor: 'rgba(255, 105, 180, 0.5)',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: CAPTURE_SIZE - 20,
    height: CAPTURE_SIZE - 20,
    borderRadius: (CAPTURE_SIZE - 20) / 2,
    backgroundColor: THEME_PINK,
    overflow: 'hidden',
  },
});
