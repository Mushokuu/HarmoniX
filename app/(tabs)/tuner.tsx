import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Image, Alert, Linking, Platform, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

// Import the image at the top level
const guitarNeckImage = require('../../assets/guitar neck image 2.png');

// Standard tuning frequencies with tolerance
const STANDARD_TUNING = {
  'E2': { frequency: 82.41, tolerance: 2 },
  'A2': { frequency: 110.00, tolerance: 2 },
  'D3': { frequency: 146.83, tolerance: 2 },
  'G3': { frequency: 196.00, tolerance: 2 },
  'B3': { frequency: 246.94, tolerance: 2 },
  'E4': { frequency: 329.63, tolerance: 2 },
} as const;

type GuitarString = keyof typeof STANDARD_TUNING;

// Server URL - change this to your actual server URL
const SERVER_URL = 'http://localhost:5000';

const TunerScreen = () => {
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [selectedString, setSelectedString] = useState<GuitarString | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [detectedFrequency, setDetectedFrequency] = useState<number | null>(null);
  const [tuningDirection, setTuningDirection] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [cents, setCents] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(true);
  const [lastDetectedTime, setLastDetectedTime] = useState<number>(0);
  const [isServerConnected, setIsServerConnected] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [audioLevelInterval, setAudioLevelInterval] = useState<NodeJS.Timeout | null>(null);
  
  const audioLevelAnimation = useRef(new Animated.Value(0)).current;
  const needleAnimation = useRef(new Animated.Value(0)).current;
  const audioChunks = useRef<Uint8Array[]>([]);
  
  const strings = [
    { note: 'E2' as GuitarString, position: 'left', row: 2 },
    { note: 'A2' as GuitarString, position: 'left', row: 1 },
    { note: 'D3' as GuitarString, position: 'left', row: 0 },
    { note: 'G3' as GuitarString, position: 'right', row: 0 },
    { note: 'B3' as GuitarString, position: 'right', row: 1 },
    { note: 'E4' as GuitarString, position: 'right', row: 2 },
  ];

  useEffect(() => {
    requestPermissions();
    checkServerConnection();
    return () => {
      stopRecording();
    };
  }, []);

  // Check server connection
  const checkServerConnection = async () => {
    try {
      console.log('Checking server connection...');
      const response = await fetch(`${SERVER_URL}/api/health`);
      if (response.ok) {
        setIsServerConnected(true);
        console.log('Server connected successfully');
      } else {
        setIsServerConnected(false);
        console.log('Server connection failed');
      }
    } catch (error) {
      setIsServerConnected(false);
      console.error('Error connecting to server:', error);
    }
  };

  // Add periodic server connection check
  useEffect(() => {
    const interval = setInterval(checkServerConnection, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Add new useEffect to start recording when permissions are granted
  useEffect(() => {
    if (permissionGranted && !isRecording) {
      startRecording();
    }
  }, [permissionGranted]);

  // Animate the audio level indicator
  useEffect(() => {
    Animated.timing(audioLevelAnimation, {
      toValue: audioLevel,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [audioLevel]);

  // Animate the needle position
  useEffect(() => {
    // Limit the cents value to a reasonable range for the needle
    const limitedCents = Math.min(Math.max(cents, -50), 50);
    const normalizedCents = limitedCents / 50; // Normalize to -1 to 1
    
    Animated.timing(needleAnimation, {
      toValue: normalizedCents,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [cents]);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
        await setupAudio();
      } else {
        Alert.alert(
          'Permission Required',
          'Please grant microphone access to use the tuner.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: 1,      // DoNotMix
        interruptionModeAndroid: 1,   // DoNotMix
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const sendAudioToServer = async (audioData: string) => {
    try {
      console.log('Sending audio data to server...');
      const response = await fetch(`${SERVER_URL}/api/detect-pitch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_data: audioData,
          sample_rate: 44100,
          buffer_size: 2048
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to process audio');
      }

      const data = await response.json();
      console.log('Server response:', data);
      return data;
    } catch (error) {
      console.error('Error sending audio to server:', error);
      return null;
    }
  };

  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      setIsRecording(true);
      console.log('Recording started successfully');
      
      // Monitor audio levels and send data every 100ms
      const interval = setInterval(async () => {
        if (recordingRef.current) {
          try {
            const uri = recordingRef.current.getURI();
            if (uri) {
              console.log('Got recording URI:', uri);
              const response = await fetch(uri);
              const blob = await response.blob();
              console.log('Audio blob size:', blob.size);
              
              // Convert blob to base64
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = async () => {
                const base64Audio = reader.result?.toString().split(',')[1];
                if (base64Audio) {
                  console.log('Sending audio chunk to server, base64 length:', base64Audio.length);
                  const result = await sendAudioToServer(base64Audio);
                  
                  if (result) {
                    console.log('Received result from server:', result);
                    setDetectedNote(result.note);
                    setDetectedFrequency(result.detected_freq);
                    setCents(result.cents);
                    setTuningDirection(result.direction);
                    
                    // Update the highlighted string
                    const stringIndex = Object.keys(STANDARD_TUNING).indexOf(result.note);
                    if (stringIndex !== -1) {
                      setSelectedString(result.note as GuitarString);
                    }
                  } else {
                    console.log('No result from server');
                  }
                } else {
                  console.log('Failed to convert blob to base64');
                }
              };
            } else {
              console.log('No URI available for recording');
            }
          } catch (error) {
            console.error('Error monitoring audio:', error);
          }
        }
      }, 100); // Check every 100ms
      
      setAudioLevelInterval(interval);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
      if (audioLevelInterval) {
        clearInterval(audioLevelInterval);
        setAudioLevelInterval(null);
      }
      setIsRecording(false);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const getTuningColor = () => {
    if (!permissionGranted) return '#ff1744'; // Red for no permission
    if (!isRecording) return '#ff1744'; // Red for not recording
    if (!detectedNote) return '#2196f3'; // Blue for listening
    if (tuningDirection === 'In tune ✅') return '#00c853'; // Green for in tune
    if (cents > 0) return '#ffd600'; // Yellow for sharp
    return '#ff9800'; // Orange for flat
  };

  const getTuningText = () => {
    if (!permissionGranted) return 'Microphone permission required';
    if (!isRecording) return 'Starting tuner...';
    if (!isServerConnected) return 'Server not connected';
    if (!detectedNote) return 'Listening... (Play a string)';
    return `${detectedNote} | ${detectedFrequency?.toFixed(1) || 0} Hz | ${tuningDirection}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>guitarTuna</Text>
        <View style={styles.autoContainer}>
          <Text style={styles.autoText}>AUTO</Text>
          <Switch
            value={isAutoMode}
            onValueChange={setIsAutoMode}
            trackColor={{ false: '#3f3f3f', true: '#00c853' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Instrument Selection */}
      <TouchableOpacity style={styles.instrumentSelector}>
        <Text style={styles.instrumentText}>Guitar 6-string</Text>
        <Text style={styles.standardText}>Standard</Text>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      {/* Tuning Indicator */}
      <View style={styles.tuningIndicator}>
        <View style={styles.tuningMeter}>
          <View style={styles.tuningMeterBackground}>
            <View style={styles.tuningMeterCenter} />
            <Animated.View 
              style={[
                styles.tuningMeterNeedle, 
                { 
                  transform: [
                    { translateX: needleAnimation.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: [-100, 0, 100]
                      })
                    }
                  ],
                  backgroundColor: getTuningColor()
                }
              ]} 
            />
          </View>
          <View style={styles.tuningMeterLabels}>
            <Text style={styles.tuningMeterLabel}>-50</Text>
            <Text style={styles.tuningMeterLabel}>0</Text>
            <Text style={styles.tuningMeterLabel}>+50</Text>
          </View>
        </View>
        
        <Text style={[styles.tuningText, { color: getTuningColor() }]}>
          {getTuningText()}
        </Text>
        
        {/* Audio Level Indicator */}
        <Animated.View 
          style={[
            styles.audioLevelIndicator,
            { 
              width: audioLevelAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              }),
              backgroundColor: getTuningColor()
            }
          ]} 
        />
      </View>

      {/* Guitar Head Visualization */}
      <View style={styles.guitarHead}>
        <View style={styles.stringButtons}>
          {strings.map((string, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.stringButton,
                string.position === 'left' ? styles.leftString : styles.rightString,
                { top: string.row * 80 },
                selectedString === string.note && styles.selectedString
              ]}
              onPress={() => {
                setSelectedString(string.note);
                if (!isRecording) startRecording();
              }}
            >
              <Text style={styles.stringText}>{string.note}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.guitarHeadImage}>
          <Image 
            source={guitarNeckImage}
            style={styles.neckImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  autoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoText: {
    color: '#fff',
    marginRight: 10,
  },
  instrumentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  instrumentText: {
    color: '#fff',
    fontSize: 18,
    marginRight: 10,
  },
  standardText: {
    color: '#666',
    fontSize: 16,
    flex: 1,
  },
  tuningIndicator: {
    alignItems: 'center',
    marginBottom: 40,
  },
  tuningMeter: {
    width: '80%',
    height: 120,
    marginBottom: 20,
  },
  tuningMeterBackground: {
    width: '100%',
    height: 80,
    backgroundColor: '#333',
    borderRadius: 40,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tuningMeterCenter: {
    width: 4,
    height: 20,
    backgroundColor: '#fff',
    position: 'absolute',
    top: 30,
  },
  tuningMeterNeedle: {
    width: 4,
    height: 60,
    backgroundColor: '#2196f3',
    position: 'absolute',
    top: 10,
    left: '50%',
    transformOrigin: 'bottom',
  },
  tuningMeterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  tuningMeterLabel: {
    color: '#fff',
    fontSize: 12,
  },
  tuningText: {
    fontSize: 16,
    marginBottom: 10,
  },
  audioLevelIndicator: {
    height: 4,
    backgroundColor: '#2196f3',
    borderRadius: 2,
    marginTop: 10,
  },
  guitarHead: {
    flex: 1,
    position: 'relative',
  },
  stringButtons: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  stringButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedString: {
    backgroundColor: '#00c853',
  },
  leftString: {
    left: 20,
  },
  rightString: {
    right: 20,
  },
  stringText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  guitarHeadImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  neckImage: {
    width: '100%',
    height: '100%',
    transform: [{ rotate: '90deg' }],
  },
});

export default TunerScreen; 