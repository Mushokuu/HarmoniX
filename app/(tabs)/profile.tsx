import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { auth, db, storage } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';

interface UserProfile {
  username: string;
  email: string;
  profilePicture?: string;
  hoursPracticed: number;
  favoriteSongs: string[];
  achievements: string[];
  practiceHistory: {
    date: string;
    duration: number;
    songs: string[];
  }[];
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        const user = auth.currentUser;
        if (user) {
          const response = await fetch(result.assets[0].uri);
          const blob = await response.blob();
          
          const storageRef = ref(storage, `profilePictures/${user.uid}`);
          await uploadBytes(storageRef, blob);
          const downloadURL = await getDownloadURL(storageRef);
          
          await updateDoc(doc(db, 'users', user.uid), {
            profilePicture: downloadURL,
          });
          
          setProfile(prev => prev ? { ...prev, profilePicture: downloadURL } : null);
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleImagePick} style={styles.profileImageContainer}>
          {profile?.profilePicture ? (
            <Image source={{ uri: profile.profilePicture }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={40} color="#666" />
            </View>
          )}
          <TouchableOpacity style={styles.editButton} onPress={handleImagePick}>
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
        <Text style={styles.username}>{profile?.username}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Ionicons name="time" size={24} color="#00c853" />
          <Text style={styles.metricValue}>{profile?.hoursPracticed || 0}</Text>
          <Text style={styles.metricLabel}>Hours Practiced</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="heart" size={24} color="#00c853" />
          <Text style={styles.metricValue}>{profile?.favoriteSongs?.length || 0}</Text>
          <Text style={styles.metricLabel}>Favorite Songs</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="trophy" size={24} color="#00c853" />
          <Text style={styles.metricValue}>{profile?.achievements?.length || 0}</Text>
          <Text style={styles.metricLabel}>Achievements</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Practice History</Text>
        {profile?.practiceHistory?.map((session, index) => (
          <View key={index} style={styles.historyItem}>
            <Text style={styles.historyDate}>{new Date(session.date).toLocaleDateString()}</Text>
            <Text style={styles.historyDuration}>{session.duration} minutes</Text>
            <Text style={styles.historySongs}>{session.songs.join(', ')}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00c853',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00c853',
    marginVertical: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  historyItem: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  historyDate: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  historyDuration: {
    fontSize: 14,
    color: '#00c853',
    marginBottom: 5,
  },
  historySongs: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#ff1744',
    margin: 20,
    padding: 15,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
}); 