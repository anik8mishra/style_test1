import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ClothingItem } from '../types';
import { Colors } from '../constants/Colors';
import { GlobalStyles } from '../constants/Styles';

interface ClothingCardProps {
  item: ClothingItem;
  onPress?: (item: ClothingItem) => void;
  showDetails?: boolean;
}

export default function ClothingCard({ item, onPress, showDetails = true }: ClothingCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress(item);
    }
  };

  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
  };

  const getFormality = () => {
    const formality = item.metadata?.formality_level || 2;
    if (formality >= 4) return 'Formal';
    if (formality >= 3) return 'Smart';
    if (formality >= 2) return 'Casual';
    return 'Relaxed';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="shirt-outline" size={40} color={Colors.textMuted} />
          </View>
        )}
        
        {/* Category badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {formatCategory(item.category)}
          </Text>
        </View>
      </View>

      {showDetails && (
        <View style={styles.details}>
          <Text style={styles.color} numberOfLines={1}>
            {item.color || 'Unknown Color'}
          </Text>
          
          <View style={styles.metaRow}>
            <Text style={styles.formality}>
              {getFormality()}
            </Text>
            {item.brand && (
              <Text style={styles.brand} numberOfLines={1}>
                {item.brand}
              </Text>
            )}
          </View>

          {/* AI Confidence indicator */}
          {item.metadata?.ai_analysis?.confidence_score && (
            <View style={styles.confidenceContainer}>
              <Ionicons name="sparkles" size={12} color={Colors.accent} />
              <Text style={styles.confidence}>
                {Math.round(item.metadata.ai_analysis.confidence_score * 100)}% match
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
    ...GlobalStyles.shadow,
  },
  imageContainer: {
    position: 'relative',
    width: 140,
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  details: {
    padding: 12,
  },
  color: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  formality: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  brand: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'right',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confidence: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: '600',
  },
});