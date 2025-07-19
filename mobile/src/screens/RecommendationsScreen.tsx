import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, GradientColors } from '../constants/Colors';
import { GlobalStyles } from '../constants/Styles';
import { ApiService } from '../services/api';
import { OutfitRecommendation } from '../types';
import ClothingCard from '../components/ClothingCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RecommendationsScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [selectedMood, setSelectedMood] = useState('confident');
  const [selectedOccasion, setSelectedOccasion] = useState('casual');

  const USER_ID = 'mobile-user-123'; // For demo purposes

  const moodOptions = [
    { key: 'confident', label: 'Confident', icon: 'flash', color: Colors.primary },
    { key: 'relaxed', label: 'Relaxed', icon: 'leaf', color: Colors.success },
    { key: 'creative', label: 'Creative', icon: 'color-palette', color: Colors.secondary },
    { key: 'professional', label: 'Professional', icon: 'business', color: Colors.primaryDark },
    { key: 'romantic', label: 'Romantic', icon: 'heart', color: Colors.fashionPink },
    { key: 'adventurous', label: 'Adventurous', icon: 'compass', color: Colors.accent },
  ];

  const occasionOptions = [
    { key: 'casual', label: 'Casual', icon: 'home' },
    { key: 'work', label: 'Work', icon: 'business' },
    { key: 'date', label: 'Date', icon: 'heart' },
    { key: 'party', label: 'Party', icon: 'musical-notes' },
    { key: 'workout', label: 'Workout', icon: 'fitness' },
    { key: 'formal', label: 'Formal', icon: 'diamond' },
  ];

  useEffect(() => {
    // Load recommendations when mood/occasion changes
    if (selectedMood && selectedOccasion) {
      loadRecommendations();
    }
  }, [selectedMood, selectedOccasion]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      
      // Create test user if needed
      await ApiService.createTestUser();

      // Get recommendations
      const data = await ApiService.getOutfitRecommendations(
        USER_ID,
        selectedMood,
        selectedOccasion,
        { condition: 'mild' }
      );

      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      if (error instanceof Error && error.message.includes('No clothing items')) {
        Alert.alert(
          'No Items Found',
          'You need to add clothing items to your wardrobe first to get outfit recommendations.',
          [
            { text: 'OK' },
            { 
              text: 'Add Items', 
              onPress: () => navigation.navigate('AddClothing')
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to load recommendations. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };

  const handleOutfitPress = (outfit: OutfitRecommendation) => {
    navigation.navigate('OutfitDetail', { outfit });
  };

  const renderMoodSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>How are you feeling?</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selectorList}
      >
        {moodOptions.map((mood) => (
          <TouchableOpacity
            key={mood.key}
            style={[
              styles.moodButton,
              selectedMood === mood.key && styles.moodButtonActive,
            ]}
            onPress={() => setSelectedMood(mood.key)}
          >
            <LinearGradient
              colors={selectedMood === mood.key ? [mood.color, mood.color + '80'] : ['transparent', 'transparent']}
              style={styles.moodButtonGradient}
            >
              <Ionicons 
                name={mood.icon as any} 
                size={24} 
                color={selectedMood === mood.key ? 'white' : mood.color} 
              />
              <Text 
                style={[
                  styles.moodButtonText,
                  selectedMood === mood.key && styles.moodButtonTextActive,
                ]}
              >
                {mood.label}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderOccasionSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>What's the occasion?</Text>
      <View style={styles.occasionGrid}>
        {occasionOptions.map((occasion) => (
          <TouchableOpacity
            key={occasion.key}
            style={[
              styles.occasionButton,
              selectedOccasion === occasion.key && styles.occasionButtonActive,
            ]}
            onPress={() => setSelectedOccasion(occasion.key)}
          >
            <Ionicons 
              name={occasion.icon as any} 
              size={20} 
              color={selectedOccasion === occasion.key ? 'white' : Colors.primary} 
            />
            <Text 
              style={[
                styles.occasionButtonText,
                selectedOccasion === occasion.key && styles.occasionButtonTextActive,
              ]}
            >
              {occasion.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderOutfitCard = (outfit: OutfitRecommendation, index: number) => (
    <TouchableOpacity
      key={outfit.outfit_id}
      style={styles.outfitCard}
      onPress={() => handleOutfitPress(outfit)}
    >
      <View style={styles.outfitHeader}>
        <Text style={styles.outfitTitle}>
          {outfit.style_description}
        </Text>
        <View style={styles.confidenceContainer}>
          <Ionicons name="sparkles" size={16} color={Colors.accent} />
          <Text style={styles.confidenceText}>
            {Math.round(outfit.confidence_score * 100)}%
          </Text>
        </View>
      </View>

      <Text style={styles.outfitMeta}>
        {outfit.mood} • {outfit.occasion} • {outfit.items.length} items
      </Text>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.outfitItems}
      >
        {outfit.items.map((item) => (
          <View key={item.item_id} style={styles.miniClothingCard}>
            <ClothingCard item={item} showDetails={false} />
          </View>
        ))}
      </ScrollView>

      <View style={styles.outfitFooter}>
        <Text style={styles.outfitFeatures}>
          {outfit.color_harmony && '🎨 Color Harmony '}
          {outfit.weather_appropriate && '🌤️ Weather Appropriate'}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={GlobalStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Outfit Recommendations</Text>
        <Text style={styles.headerSubtitle}>
          AI-powered outfits tailored to your mood and occasion
        </Text>
      </View>

      {/* Mood Selector */}
      {renderMoodSelector()}

      {/* Occasion Selector */}
      {renderOccasionSelector()}

      {/* Generate Button */}
      <View style={styles.generateContainer}>
        <TouchableOpacity
          style={[styles.generateButton, loading && styles.generateButtonDisabled]}
          onPress={loadRecommendations}
          disabled={loading}
        >
          <LinearGradient
            colors={GradientColors.fashion}
            style={styles.generateButtonGradient}
          >
            {loading ? (
              <LoadingSpinner size="small" color="white" />
            ) : (
              <>
                <Ionicons name="sparkles" size={24} color="white" />
                <Text style={styles.generateButtonText}>Generate Outfits</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>
            Your Personalized Outfits
          </Text>
          {recommendations.map((outfit, index) => renderOutfitCard(outfit, index))}
        </View>
      ) : !loading && (
        <View style={styles.noRecommendationsContainer}>
          <Ionicons name="shirt-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.noRecommendationsTitle}>
            No Recommendations Yet
          </Text>
          <Text style={styles.noRecommendationsSubtitle}>
            Add more clothing items to your wardrobe to get better outfit recommendations.
          </Text>
          <TouchableOpacity
            style={styles.addItemsButton}
            onPress={() => navigation.navigate('AddClothing')}
          >
            <Text style={styles.addItemsButtonText}>Add Clothing Items</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    ...GlobalStyles.title,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    ...GlobalStyles.body,
    textAlign: 'center',
    color: Colors.textSecondary,
  },
  selectorContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
    marginBottom: 8,
  },
  selectorTitle: {
    ...GlobalStyles.subtitle,
    marginBottom: 16,
  },
  selectorList: {
    paddingHorizontal: 8,
  },
  moodButton: {
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  moodButtonActive: {},
  moodButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  moodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 4,
  },
  moodButtonTextActive: {
    color: 'white',
  },
  occasionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  occasionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  occasionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  occasionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  occasionButtonTextActive: {
    color: 'white',
  },
  generateContainer: {
    padding: 16,
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recommendationsContainer: {
    padding: 16,
  },
  recommendationsTitle: {
    ...GlobalStyles.subtitle,
    marginBottom: 16,
  },
  outfitCard: {
    ...GlobalStyles.card,
    marginBottom: 16,
  },
  outfitHeader: {
    ...GlobalStyles.spaceBetween,
    marginBottom: 8,
  },
  outfitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },
  outfitMeta: {
    ...GlobalStyles.caption,
    marginBottom: 12,
  },
  outfitItems: {
    marginBottom: 12,
  },
  miniClothingCard: {
    marginRight: 8,
    transform: [{ scale: 0.7 }],
  },
  outfitFooter: {
    ...GlobalStyles.spaceBetween,
  },
  outfitFeatures: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  noRecommendationsContainer: {
    alignItems: 'center',
    padding: 48,
  },
  noRecommendationsTitle: {
    ...GlobalStyles.subtitle,
    marginTop: 16,
    textAlign: 'center',
  },
  noRecommendationsSubtitle: {
    ...GlobalStyles.body,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    color: Colors.textSecondary,
  },
  addItemsButton: {
    ...GlobalStyles.button,
    paddingHorizontal: 32,
  },
  addItemsButtonText: {
    ...GlobalStyles.buttonText,
  },
});