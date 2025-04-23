import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  imageUrl: string;
}

const SAMPLE_SONGS: Song[] = [
  {
    id: '1',
    title: 'Wonderwall',
    artist: 'Oasis',
    difficulty: 'Beginner',
    duration: '4:18',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b273b52a8b5b5c5c5c5c5c5c5c5c',
  },
  {
    id: '2',
    title: 'Sweet Home Alabama',
    artist: 'Lynyrd Skynyrd',
    difficulty: 'Intermediate',
    duration: '4:45',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b273b52a8b5b5c5c5c5c5c5c5c5c',
  },
  {
    id: '3',
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    difficulty: 'Advanced',
    duration: '8:02',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b273b52a8b5b5c5c5c5c5c5c5c5c',
  },
  {
    id: '4',
    title: 'Sweet Child O\' Mine',
    artist: 'Guns N\' Roses',
    difficulty: 'Intermediate',
    duration: '5:56',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b273b52a8b5b5c5c5c5c5c5c5c5c',
  },
  {
    id: '5',
    title: 'Nothing Else Matters',
    artist: 'Metallica',
    difficulty: 'Intermediate',
    duration: '6:28',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b273b52a8b5b5c5c5c5c5c5c5c5c',
  },
];

export default function SongsScreen() {
  const [songs, setSongs] = useState<Song[]>(SAMPLE_SONGS);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>(SAMPLE_SONGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteSongs, setFavoriteSongs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoriteSongs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSongs(songs);
    } else {
      const filtered = songs.filter(song => 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSongs(filtered);
    }
  }, [searchQuery, songs]);

  const loadFavoriteSongs = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setFavoriteSongs(userDoc.data().favoriteSongs || []);
        }
      }
    } catch (error) {
      console.error('Error loading favorite songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (songId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Please log in to favorite songs');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const isFavorite = favoriteSongs.includes(songId);

      if (isFavorite) {
        await updateDoc(userRef, {
          favoriteSongs: arrayRemove(songId)
        });
        setFavoriteSongs(prev => prev.filter(id => id !== songId));
      } else {
        await updateDoc(userRef, {
          favoriteSongs: arrayUnion(songId)
        });
        setFavoriteSongs(prev => [...prev, songId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity style={styles.songItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.songImage} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
        <View style={styles.songDetails}>
          <Text style={styles.songDifficulty}>{item.difficulty}</Text>
          <Text style={styles.songDuration}>{item.duration}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.favoriteButton} 
        onPress={() => toggleFavorite(item.id)}
      >
        <Ionicons 
          name={favoriteSongs.includes(item.id) ? "heart" : "heart-outline"} 
          size={24} 
          color={favoriteSongs.includes(item.id) ? "#00c853" : "#666"} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Songs</Text>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredSongs}
        renderItem={renderSongItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    margin: 20,
    marginTop: 0,
    paddingHorizontal: 15,
    borderRadius: 8,
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
  list: {
    padding: 20,
    paddingTop: 0,
  },
  songItem: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    alignItems: 'center',
  },
  songImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  songInfo: {
    flex: 1,
    marginLeft: 15,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  songDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songDifficulty: {
    fontSize: 12,
    color: '#00c853',
    marginRight: 10,
  },
  songDuration: {
    fontSize: 12,
    color: '#666',
  },
  favoriteButton: {
    padding: 8,
  },
}); 