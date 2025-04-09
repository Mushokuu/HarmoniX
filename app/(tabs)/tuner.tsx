import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Import the image at the top level
const guitarNeckImage = require('../../assets/guitar neck image 2.png');

const TunerScreen = () => {
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [selectedString, setSelectedString] = useState<string | null>(null);
  
  const strings = [
    { note: 'E', position: 'left', row: 2 },
    { note: 'A', position: 'left', row: 1 },
    { note: 'D', position: 'left', row: 0 },
    { note: 'G', position: 'right', row: 0 },
    { note: 'B', position: 'right', row: 1 },
    { note: 'E', position: 'right', row: 2 },
  ];

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
        <View style={styles.tuningCircle} />
        <Text style={styles.tuningText}>
          Start tuning by playing any string
        </Text>
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
                { top: string.row * 80 }
              ]}
              onPress={() => setSelectedString(string.note)}
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
  tuningCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 20,
  },
  tuningText: {
    color: '#666',
    fontSize: 16,
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