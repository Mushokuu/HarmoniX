import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  songId: string;
};

type LyricLine = {
  id: number;
  lyrics: string;
  chords: string[];
  timestamp: number;
};

const SAMPLE_SONG = {
  title: 'The House Of The Rising Sun',
  artist: 'The Animals',
  tempo: 120,
  sections: [
    {
      name: 'INTRO 1',
      lines: [
        { id: 1, lyrics: '', chords: ['Am', 'C', 'D', 'F'], timestamp: 0 },
        { id: 2, lyrics: '', chords: ['Am', 'E', 'Am', 'E'], timestamp: 4 },
      ],
    },
    {
      name: 'CHORUS 1',
      lines: [
        { id: 3, lyrics: 'There is a house in New Orleans', chords: ['Am', 'C', 'D', 'F'], timestamp: 8 },
        { id: 4, lyrics: 'They call the Rising Sun', chords: ['Am', 'C', 'E'], timestamp: 12 },
        { id: 5, lyrics: "And it's been the ruin of many a poor boy", chords: ['Am', 'C', 'D', 'F'], timestamp: 16 },
        { id: 6, lyrics: "And God I know I'm one", chords: ['Am', 'E', 'Am', 'C', 'D', 'F'], timestamp: 20 },
      ],
    },
  ],
};

const SongDetailScreen: React.FC<Props> = ({ songId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && autoScroll) {
      // Start auto-scrolling animation
      Animated.timing(scrollY, {
        toValue: 1000, // Adjust based on content height
        duration: 60000, // Adjust based on song duration
        useNativeDriver: true,
      }).start();
    }
  };

  const renderChords = (chords: string[]) => (
    <View style={styles.chordsContainer}>
      {chords.map((chord, index) => (
        <Text key={index} style={styles.chordText}>
          {chord}
        </Text>
      ))}
    </View>
  );

  const renderLyrics = (lyrics: string) => (
    <Text style={styles.lyricsText}>{lyrics || ' '}</Text>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.songTitle}>{SAMPLE_SONG.title}</Text>
          <Text style={styles.artistName}>{SAMPLE_SONG.artist}</Text>
        </View>
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setAutoScroll(!autoScroll)}
        >
          <Text style={[styles.controlText, !autoScroll && styles.controlActive]}>
            SMART SCROLL
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color="#fff"
          />
          <Text style={styles.playButtonText}>
            {isPlaying ? 'Pause' : 'Play with Audio'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lyrics and Chords */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {SAMPLE_SONG.sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.name}</Text>
            {section.lines.map((line) => (
              <View key={line.id} style={styles.line}>
                {renderChords(line.chords)}
                {renderLyrics(line.lyrics)}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.bottomButton}>
          <Ionicons name="musical-notes" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton}>
          <Ionicons name="bulb" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomButton, styles.activeTab]}>
          <Ionicons name="mic" size={24} color="#00c853" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton}>
          <Ionicons name="settings" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton}>
          <Ionicons name="person" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  songTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  artistName: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  favoriteButton: {
    padding: 5,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  controlButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  controlText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  controlActive: {
    color: '#00c853',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a4a4a',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 10,
  },
  playButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  line: {
    marginBottom: 20,
  },
  chordsContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  chordText: {
    color: '#00c853',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 20,
  },
  lyricsText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  bottomButton: {
    padding: 10,
  },
  activeTab: {
    backgroundColor: '#333',
    borderRadius: 20,
  },
});

export default SongDetailScreen; 