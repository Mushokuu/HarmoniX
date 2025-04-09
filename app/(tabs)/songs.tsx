import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type Song = {
  id: string;
  title: string;
  artist: string;
  hasTab: boolean;
  hasChords: boolean;
};

const SAMPLE_SONGS: Song[] = [
  {
    id: '1',
    title: 'The House Of The Rising Sun',
    artist: 'The Animals',
    hasTab: true,
    hasChords: true,
  },
  {
    id: '2',
    title: 'Let Her Go',
    artist: 'Passenger',
    hasTab: true,
    hasChords: true,
  },
  {
    id: '3',
    title: 'Let It Be',
    artist: 'The Beatles',
    hasTab: true,
    hasChords: true,
  },
];

const SongScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity 
      style={styles.songItem}
      onPress={() => router.push(`/song/${item.id}`)}
    >
      <View style={styles.songImage} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.artistName}>{item.artist}</Text>
      </View>
      <View style={styles.songBadges}>
        {item.hasTab && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>TAB</Text>
          </View>
        )}
        {item.hasChords && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>CRD</Text>
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.favoriteButton}>
        <Ionicons name="heart-outline" size={24} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Songs</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for artists or songs"
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your songs</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllButton}>See all</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={SAMPLE_SONGS}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <TouchableOpacity style={styles.spotifyButton}>
        <Ionicons name="musical-notes" size={24} color="#fff" />
        <Text style={styles.spotifyButtonText}>Connect to Spotify</Text>
      </TouchableOpacity>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    margin: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    height: 44,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  section: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAllButton: {
    color: '#00c853',
    fontSize: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    backgroundColor: '#333',
  },
  songInfo: {
    flex: 1,
    marginLeft: 15,
  },
  songTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  artistName: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  songBadges: {
    flexDirection: 'row',
    marginRight: 10,
  },
  badge: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 5,
  },
  badgeText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  favoriteButton: {
    padding: 5,
  },
  spotifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1DB954',
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  spotifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default SongScreen; 