import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../constants/Colors';
import { GlobalStyles } from '../constants/Styles';
import { ClothingItem } from '../types';

interface ItemDetailScreenProps {
  route: {
    params: {
      item: ClothingItem;
    };
  };
  navigation: any;
}

export default function ItemDetailScreen({ route, navigation }: ItemDetailScreenProps) {
  const { item } = route.params;

  const getFormality = () => {
    const formality = item.metadata?.formality_level || 2;
    if (formality >= 4) return { text: 'Formal', icon: 'diamond' };
    if (formality >= 3) return { text: 'Smart Casual', icon: 'business' };
    if (formality >= 2) return { text: 'Casual', icon: 'home' };
    return { text: 'Relaxed', icon: 'leaf' };
  };

  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
  };

  const aiAnalysis = item.metadata?.ai_analysis;
  const colorAnalysis = item.metadata?.color_analysis;
  const formalityInfo = getFormality();

  const handleDeleteItem = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to remove this item from your wardrobe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete functionality
            Alert.alert('Feature Coming Soon', 'Delete functionality will be available in a future update.');
          }
        }
      ]
    );
  };

  const handleEditItem = () => {
    Alert.alert('Feature Coming Soon', 'Edit functionality will be available in a future update.');
  };

  const handleFindSimilar = () => {
    Alert.alert('Feature Coming Soon', 'Similar item search will be available in a future update.');
  };

  return (
    <ScrollView style={GlobalStyles.container}>
      {/* Image Section */}
      <View style={styles.imageSection}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.itemImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="shirt-outline" size={80} color={Colors.textMuted} />
          </View>
        )}
      </View>

      {/* Basic Info */}
      <View style={styles.basicInfoSection}>
        <View style={styles.headerRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{formatCategory(item.category)}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEditItem}>
              <Ionicons name="pencil-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleDeleteItem}>
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.colorTitle}>Color: {item.color}</Text>
        {item.brand && (
          <Text style={styles.brand}>Brand: {item.brand}</Text>
        )}
        
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name={formalityInfo.icon as any} size={20} color={Colors.primary} />
            <Text style={styles.metaText}>{formalityInfo.text}</Text>
          </View>
          
          {aiAnalysis?.confidence_score && (
            <View style={styles.metaItem}>
              <Ionicons name="sparkles" size={20} color={Colors.accent} />
              <Text style={styles.metaText}>
                {Math.round(aiAnalysis.confidence_score * 100)}% AI Match
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* AI Analysis Section */}
      {aiAnalysis && (
        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>AI Analysis</Text>
          
          <View style={styles.analysisCard}>
            <View style={styles.analysisRow}>
              <Text style={styles.analysisLabel}>Category:</Text>
              <Text style={styles.analysisValue}>{formatCategory(aiAnalysis.category || item.category)}</Text>
            </View>
            
            {aiAnalysis.subcategory && (
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Subcategory:</Text>
                <Text style={styles.analysisValue}>{formatCategory(aiAnalysis.subcategory)}</Text>
              </View>
            )}
            
            <View style={styles.analysisRow}>
              <Text style={styles.analysisLabel}>Classification Method:</Text>
              <Text style={styles.analysisValue}>{aiAnalysis.classification_method || 'AI Vision'}</Text>
            </View>
            
            {aiAnalysis.dominant_colors && (
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Colors Detected:</Text>
                <View style={styles.colorsList}>
                  {aiAnalysis.dominant_colors.map((color: string, index: number) => (
                    <View key={index} style={styles.colorChip}>
                      <Text style={styles.colorChipText}>{color}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {aiAnalysis.season_suitability && (
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Season Suitable:</Text>
                <Text style={styles.analysisValue}>
                  {Array.isArray(aiAnalysis.season_suitability) 
                    ? aiAnalysis.season_suitability.join(', ')
                    : 'All seasons'
                  }
                </Text>
              </View>
            )}
            
            {aiAnalysis.style_attributes && (
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Style Attributes:</Text>
                <View style={styles.attributesList}>
                  {aiAnalysis.style_attributes.map((attr: string, index: number) => (
                    <View key={index} style={styles.attributeChip}>
                      <Text style={styles.attributeText}>{attr}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Color Analysis Section */}
      {colorAnalysis && (
        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>Color Analysis</Text>
          
          <View style={styles.analysisCard}>
            {colorAnalysis.color_harmony_score && (
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Color Harmony Score:</Text>
                <Text style={styles.analysisValue}>
                  {Math.round(colorAnalysis.color_harmony_score * 100)}%
                </Text>
              </View>
            )}
            
            {colorAnalysis.color_scheme && (
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Color Scheme:</Text>
                <Text style={styles.analysisValue}>{formatCategory(colorAnalysis.color_scheme)}</Text>
              </View>
            )}
            
            {colorAnalysis.temperature && (
              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Color Temperature:</Text>
                <Text style={styles.analysisValue}>{formatCategory(colorAnalysis.temperature)}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleFindSimilar}>
          <Ionicons name="search" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Find Similar Items</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Recommendations')}
        >
          <Ionicons name="sparkles" size={20} color={Colors.primary} />
          <Text style={styles.secondaryButtonText}>Create Outfits with This</Text>
        </TouchableOpacity>
      </View>

      {/* Item Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Item Information</Text>
        <Text style={styles.infoText}>
          Added on: {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <Text style={styles.infoText}>
          Item ID: {item.item_id.slice(0, 8)}...
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  imageSection: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    paddingVertical: 24,
  },
  itemImage: {
    width: 250,
    height: 320,
    borderRadius: 16,
  },
  placeholderImage: {
    width: 250,
    height: 320,
    borderRadius: 16,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  basicInfoSection: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorTitle: {
    ...GlobalStyles.title,
    marginBottom: 8,
  },
  brand: {
    ...GlobalStyles.body,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  analysisSection: {
    padding: 16,
  },
  sectionTitle: {
    ...GlobalStyles.subtitle,
    marginBottom: 12,
  },
  analysisCard: {
    ...GlobalStyles.card,
    margin: 0,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  analysisLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    flex: 1,
  },
  analysisValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
  },
  colorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    flex: 1,
    justifyContent: 'flex-end',
  },
  colorChip: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  colorChipText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  attributesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    flex: 1,
    justifyContent: 'flex-end',
  },
  attributeChip: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  attributeText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '500',
  },
  actionsSection: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    ...GlobalStyles.button,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    ...GlobalStyles.buttonText,
  },
  secondaryButton: {
    ...GlobalStyles.buttonSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    ...GlobalStyles.buttonSecondaryText,
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