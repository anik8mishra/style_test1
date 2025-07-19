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
import { ClothingItem, OutfitRecommendation } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomeScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    recentItems: 0,
    todayOutfits: 0,
  });
  const [quickRecommendation, setQuickRecommendation] = useState<OutfitRecommendation | null>(null);

  const USER_ID = 'mobile-user-123'; // For demo purposes

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Create test user if needed
      await ApiService.createTestUser();
      
      // Get user's clothing stats
      const clothingData = await ApiService.getUserClothing(USER_ID);
      setStats({
        totalItems: clothingData.total || 0,
        recentItems: clothingData.items?.filter(item => {
          const createdDate = new Date(item.created_at);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return createdDate > weekAgo;
        }).length || 0,
        todayOutfits: 0, // Would come from outfit history
      });

      // Get a quick recommendation if user has items
      if (clothingData.total > 0) {
        try {
          const recData = await ApiService.getOutfitRecommendations(
            USER_ID,
            'confident',
            'casual',
            { condition: 'mild' }
          );
          if (recData.recommendations && recData.recommendations.length > 0) {
            setQuickRecommendation(recData.recommendations[0]);
          }
        } catch (error) {
          console.log('No recommendations available yet');
        }
      }

    } catch (error) {
      console.error('Failed to load home data:', error);
      Alert.alert('Error', 'Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add':
        navigation.navigate('AddClothing');
        break;
      case 'wardrobe':
        navigation.navigate('Wardrobe');
        break;
      case 'recommendations':
        navigation.navigate('Recommendations');
        break;
    }
  };

  if (loading) {
    return (
      <View style={GlobalStyles.centerContainer}>
        <LoadingSpinner message="Loading your style data..." />
      </View>
    );
  }

  return (
    <ScrollView 
      style={GlobalStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Hero Section */}
      <LinearGradient
        colors={GradientColors.fashion}
        style={styles.heroSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.heroTitle}>Welcome to StyleSync</Text>
        <Text style={styles.heroSubtitle}>
          AI-powered fashion at your fingertips
        </Text>
        <View style={styles.heroStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.recentItems}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>AI</Text>
            <Text style={styles.statLabel}>Powered</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleQuickAction('add')}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.actionGradient}
            >
              <Ionicons name="camera" size={32} color="white" />
              <Text style={styles.actionText}>Add Item</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleQuickAction('wardrobe')}
          >
            <LinearGradient
              colors={[Colors.secondary, Colors.fashionPurple]}
              style={styles.actionGradient}
            >
              <Ionicons name="shirt" size={32} color="white" />
              <Text style={styles.actionText}>My Closet</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleQuickAction('recommendations')}
          >
            <LinearGradient
              colors={[Colors.accent, Colors.fashionOrange]}
              style={styles.actionGradient}
            >
              <Ionicons name="sparkles" size={32} color="white" />
              <Text style={styles.actionText}>Outfits</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Recommendation */}
      {quickRecommendation && (
        <View style={styles.recommendationContainer}>
          <Text style={styles.sectionTitle}>Today's Suggestion</Text>
          <TouchableOpacity
            style={styles.recommendationCard}
            onPress={() => navigation.navigate('OutfitDetail', { outfit: quickRecommendation })}
          >
            <View style={styles.recommendationHeader}>
              <Text style={styles.recommendationTitle}>
                {quickRecommendation.style_description}
              </Text>
              <View style={styles.confidenceContainer}>
                <Ionicons name="sparkles" size={16} color={Colors.accent} />
                <Text style={styles.confidenceText}>
                  {Math.round(quickRecommendation.confidence_score * 100)}%
                </Text>
              </View>
            </View>
            <Text style={styles.recommendationMeta}>
              {quickRecommendation.mood} • {quickRecommendation.occasion}
            </Text>
            <Text style={styles.recommendationItems}>
              {quickRecommendation.items.length} items selected
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Getting Started */}
      {stats.totalItems === 0 && (
        <View style={styles.gettingStartedContainer}>
          <Text style={styles.sectionTitle}>Getting Started</Text>
          <View style={styles.gettingStartedCard}>
            <Ionicons name="bulb-outline" size={48} color={Colors.accent} />
            <Text style={styles.gettingStartedTitle}>
              Start Building Your Digital Wardrobe
            </Text>
            <Text style={styles.gettingStartedText}>
              Take photos of your clothes and let our AI analyze them for you.
              Get personalized outfit recommendations based on mood, weather, and occasion!
            </Text>
            <TouchableOpacity
              style={styles.gettingStartedButton}
              onPress={() => navigation.navigate('AddClothing')}
            >
              <Text style={styles.gettingStartedButtonText}>
                Add Your First Item
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    padding: 24,
    margin: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginBottom: 24,
    textAlign: 'center',
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  quickActionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    ...GlobalStyles.subtitle,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionGradient: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  recommendationContainer: {
    padding: 16,
  },
  recommendationCard: {
    ...GlobalStyles.card,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    ...GlobalStyles.subtitle,
    flex: 1,
    marginBottom: 0,
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
  recommendationMeta: {
    ...GlobalStyles.caption,
    marginBottom: 4,
  },
  recommendationItems: {
    ...GlobalStyles.muted,
  },
  gettingStartedContainer: {
    padding: 16,
  },
  gettingStartedCard: {
    ...GlobalStyles.card,
    alignItems: 'center',
    paddingVertical: 32,
  },
  gettingStartedTitle: {
    ...GlobalStyles.subtitle,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  gettingStartedText: {
    ...GlobalStyles.body,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  gettingStartedButton: {
    ...GlobalStyles.button,
    paddingHorizontal: 32,
  },
  gettingStartedButtonText: {
    ...GlobalStyles.buttonText,
  },
});