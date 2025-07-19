import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../constants/Colors';
import { GlobalStyles } from '../constants/Styles';
import { Outfit } from '../types';
import ClothingCard from '../components/ClothingCard';

interface OutfitDetailScreenProps {
  route: {
    params: {
      outfit: Outfit;
    };
  };
  navigation: any;
}

export default function OutfitDetailScreen({ route, navigation }: OutfitDetailScreenProps) {
  const { outfit } = route.params;

  const handleSaveOutfit = () => {
    Alert.alert('Feature Coming Soon', 'Save outfit functionality will be available in a future update.');
  };

  const handleShareOutfit = () => {
    Alert.alert('Feature Coming Soon', 'Share outfit functionality will be available in a future update.');
  };

  const handleWearToday = () => {
    Alert.alert(
      'Mark as Worn',
      'Would you like to mark this outfit as worn today?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, I\'m wearing this!',
          onPress: () => {
            Alert.alert('Great Choice!', 'Outfit marked as worn. Have a stylish day!');
          }
        }
      ]
    );
  };

  const handleViewItem = (item: any) => {
    navigation.navigate('ItemDetail', { item });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return Colors.success;
    if (score >= 0.6) return Colors.accent;
    return Colors.textSecondary;
  };

  const getConfidenceText = (score: number) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    return 'Decent Match';
  };

  return (
    <ScrollView style={GlobalStyles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.outfitMeta}>
          <View style={styles.metaBadge}>
            <Ionicons name="heart" size={16} color="white" />
            <Text style={styles.metaBadgeText}>{outfit.mood}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Ionicons name="calendar" size={16} color="white" />
            <Text style={styles.metaBadgeText}>{outfit.occasion}</Text>
          </View>
        </View>

        <Text style={styles.outfitTitle}>{outfit.style_description}</Text>
        
        <View style={styles.confidenceContainer}>
          <View style={styles.confidenceScore}>
            <Text 
              style={[
                styles.confidenceNumber,
                { color: getConfidenceColor(outfit.confidence_score) }
              ]}
            >
              {Math.round(outfit.confidence_score * 100)}%
            </Text>
            <Text style={styles.confidenceLabel}>
              {getConfidenceText(outfit.confidence_score)}
            </Text>
          </View>
          
          <View style={styles.outfitFeatures}>
            {outfit.color_harmony && (
              <View style={styles.featureItem}>
                <Ionicons name="color-palette" size={16} color={Colors.success} />
                <Text style={styles.featureText}>Color Harmony</Text>
              </View>
            )}
            {outfit.weather_appropriate && (
              <View style={styles.featureItem}>
                <Ionicons name="partly-sunny" size={16} color={Colors.info} />
                <Text style={styles.featureText}>Weather Appropriate</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Outfit Items */}
      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>
          Outfit Items ({outfit.items.length})
        </Text>
        
        <View style={styles.itemsGrid}>
          {outfit.items.map((item, index) => (
            <View key={item.item_id} style={styles.itemContainer}>
              <ClothingCard
                item={item}
                onPress={() => handleViewItem(item)}
                showDetails={true}
              />
              <View style={styles.itemIndex}>
                <Text style={styles.itemIndexText}>{index + 1}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Outfit Analysis */}
      <View style={styles.analysisSection}>
        <Text style={styles.sectionTitle}>Style Analysis</Text>
        
        <View style={styles.analysisCard}>
          <View style={styles.analysisRow}>
            <Ionicons name="sparkles" size={20} color={Colors.accent} />
            <View style={styles.analysisContent}>
              <Text style={styles.analysisTitle}>AI Recommendation</Text>
              <Text style={styles.analysisText}>
                This outfit was created using advanced AI analysis considering your style preferences, 
                color harmony, and the selected mood and occasion.
              </Text>
            </View>
          </View>
          
          <View style={styles.analysisRow}>
            <Ionicons name="color-palette" size={20} color={Colors.primary} />
            <View style={styles.analysisContent}>
              <Text style={styles.analysisTitle}>Color Coordination</Text>
              <Text style={styles.analysisText}>
                {outfit.color_harmony
                  ? 'The colors in this outfit work harmoniously together, creating a balanced and pleasing appearance.'
                  : 'The color combination adds visual interest with complementary contrasts.'
                }
              </Text>
            </View>
          </View>
          
          <View style={styles.analysisRow}>
            <Ionicons name="stats-chart" size={20} color={Colors.secondary} />
            <View style={styles.analysisContent}>
              <Text style={styles.analysisTitle}>Style Confidence</Text>
              <Text style={styles.analysisText}>
                Based on formality levels, color matching, and seasonal appropriateness, 
                this outfit has a {Math.round(outfit.confidence_score * 100)}% style confidence score.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.primaryAction} onPress={handleWearToday}>
          <Ionicons name="checkmark-circle" size={24} color="white" />
          <Text style={styles.primaryActionText}>I'm Wearing This Today!</Text>
        </TouchableOpacity>
        
        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.secondaryAction} onPress={handleSaveOutfit}>
            <Ionicons name="bookmark-outline" size={20} color={Colors.primary} />
            <Text style={styles.secondaryActionText}>Save Outfit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryAction} onPress={handleShareOutfit}>
            <Ionicons name="share-outline" size={20} color={Colors.primary} />
            <Text style={styles.secondaryActionText}>Share</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.tertiaryAction}
          onPress={() => navigation.navigate('Recommendations')}
        >
          <Text style={styles.tertiaryActionText}>Get More Recommendations</Text>
        </TouchableOpacity>
      </View>

      {/* Outfit Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Outfit Information</Text>
        <Text style={styles.infoText}>
          Created: {new Date(outfit.created_at).toLocaleDateString()}
        </Text>
        <Text style={styles.infoText}>
          Outfit ID: {outfit.outfit_id.slice(0, 12)}...
        </Text>
        {outfit.recommendation_method && (
          <Text style={styles.infoText}>
            Generated using: {outfit.recommendation_method.replace('_', ' ')}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  outfitMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  metaBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  outfitTitle: {
    ...GlobalStyles.title,
    marginBottom: 16,
    textAlign: 'center',
  },
  confidenceContainer: {
    alignItems: 'center',
    gap: 16,
  },
  confidenceScore: {
    alignItems: 'center',
  },
  confidenceNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  confidenceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  outfitFeatures: {
    flexDirection: 'row',
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  itemsSection: {
    padding: 16,
  },
  sectionTitle: {
    ...GlobalStyles.subtitle,
    marginBottom: 16,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  itemIndex: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  itemIndexText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  analysisSection: {
    padding: 16,
    backgroundColor: Colors.surfaceAlt,
  },
  analysisCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  analysisRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  analysisContent: {
    flex: 1,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  analysisText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actionsSection: {
    padding: 16,
    gap: 16,
  },
  primaryAction: {
    ...GlobalStyles.button,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  primaryActionText: {
    ...GlobalStyles.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    ...GlobalStyles.buttonSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: {
    ...GlobalStyles.buttonSecondaryText,
  },
  tertiaryAction: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  tertiaryActionText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  infoSection: {
    padding: 16,
    backgroundColor: Colors.surfaceAlt,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
});