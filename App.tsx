/**
 * Aniteve TV App - React Native tvOS
 * Interface pour TV adaptée au streaming d'anime
 *
 * @format
 */

import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Dimensions,
} from 'react-native';
import AnimeItem from './srcs/models/anime_item';
import { animeCategories, featuredAnime } from './srcs/data/mockData';
import TopBar from './srcs/ui/components/top_bar';
import BannerResume from './srcs/ui/components/banner_resume';
import Home from './srcs/ui/home/home';

const { width, height } = Dimensions.get('window');

// Composant principal
function App(): React.JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Home />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Conteneur principal
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },

  // Header


  // Contenu principal
  content: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 120, // Augmenté significativement pour plus d'espace en bas
  },

  // Section anime en vedette
  featuredBackground: {
    height: height * 0.6,
    justifyContent: 'flex-end',
  },
  featuredBackgroundImage: {
    opacity: 0.7,
  },
  featuredOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 48,
  },
  featuredContent: {
    maxWidth: width * 0.5,
  },
  featuredTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  featuredCategory: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 8,
  },
  featuredInfo: {
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  playButton: {
    backgroundColor: '#e50914',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Sections d'anime
  section: {
    marginVertical: 32, // Augmenté pour plus d'espace entre les sections
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    paddingHorizontal: 48,
  },
  horizontalList: {
    paddingHorizontal: 48,
    gap: 20, // Augmenté pour éviter le chevauchement lors du focus
    paddingVertical: 16, // Espace vertical pour l'agrandissement
  },

  // Cartes d'anime
  animeCard: {
    width: 240,
    height: 320,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    margin: 8, // Marge pour éviter le crop lors de l'agrandissement
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  animeCardFocused: {
    transform: [{ scale: 1.08 }], // Légèrement réduit pour éviter le crop
    elevation: 8,
    shadowOpacity: 0.6,
    borderWidth: 3,
    borderColor: '#e50914',
    shadowColor: '#e50914',
    shadowRadius: 8,
  },
  animeCardImage: {
    width: '100%',
    height: '75%',
    resizeMode: 'cover',
  },
  animeCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
  },
  animeCardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  animeCardCategory: {
    color: '#ccc',
    fontSize: 12,
  },
});

export default App;
