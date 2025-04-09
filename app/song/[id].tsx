import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import SongDetailScreen from '../song-detail';

export default function SongDetail() {
  const { id } = useLocalSearchParams();
  return <SongDetailScreen songId={id as string} />;
} 