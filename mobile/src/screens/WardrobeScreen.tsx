import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../constants/Colors';
import { GlobalStyles } from '../constants/Styles';
import { ApiService } from '../services/api';
import { ClothingItem } from '../types';
import ClothingCard from '../components/ClothingCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function WardrobeScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const USER_ID = 'mobile-user-123'; // For demo purposes

  const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'shirt', label: 'Shirts' },
    { key: 'pants', label: 'Pants' },
    { key: 'jeans', label: 'Jeans' },
    { key: 'dress', label: 'Dresses' },
    { key: 'shoes', label: 'Shoes' },
    { key: 'jacket', label: 'Outerwear' },
  ];

  useEffect(() => {
    loadWardrobe();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, searchQuery, selectedFilter]);

  const loadWardrobe = async () => {
    try {
      setLoading(true);
      
      // Create test user if needed
      await ApiService.createTestUser();
      
      const data = await ApiService.getUserClothing(USER_ID);
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to load wardrobe:', error);
      Alert.alert('Error', 'Failed to load your wardrobe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWardrobe();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = items;

    // Apply category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.category?.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.category?.toLowerCase().includes(query) ||
        item.color?.toLowerCase().includes(query) ||
        item.brand?.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  };

  const handleItemPress = (item: ClothingItem) => {
    navigation.navigate('ItemDetail', { item });
  };

  const handleAddPress = () => {
    navigation.navigate('AddClothing');
  };

  const renderItem = ({ item }: { item: ClothingItem }) => (
    <ClothingCard
      item={item}
      onPress={handleItemPress}
      showDetails={true}
    />
  );

  const renderFilterButton = ({ item }: { item: typeof filterOptions[0] }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === item.key && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(item.key)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === item.key && styles.filterButtonTextActive,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={GlobalStyles.centerContainer}>
        <LoadingSpinner message="Loading your wardrobe..." />
      </View>
    );
  }

  return (
    <View style={GlobalStyles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your wardrobe..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textMuted}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={filterOptions}
          renderItem={renderFilterButton}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Items Count */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredItems.length} of {items.length} items
        </Text>
        {selectedFilter !== 'all' && (
          <TouchableOpacity
            onPress={() => setSelectedFilter('all')}
            style={styles.clearFiltersButton}
          >
            <Text style={styles.clearFiltersText}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.item_id}
          numColumns={2}
          contentContainerStyle={styles.itemsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="shirt-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>
            {items.length === 0 ? 'No items yet' : 'No items found'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {items.length === 0
              ? 'Start building your digital wardrobe by adding your first clothing item.'
              : 'Try adjusting your search or filters to find what you\'re looking for.'}
          </Text>
          {items.length === 0 && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPress}
            >
              <Text style={styles.addButtonText}>Add Your First Item</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Floating Add Button */}
      {items.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddPress}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filtersList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statsText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  clearFiltersButton: {
    padding: 4,
  },
  clearFiltersText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  itemsList: {
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    ...GlobalStyles.subtitle,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...GlobalStyles.body,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    color: Colors.textSecondary,
  },
  addButton: {
    ...GlobalStyles.button,
    paddingHorizontal: 32,
  },
  addButtonText: {
    ...GlobalStyles.buttonText,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...GlobalStyles.shadow,
    elevation: 8,
  },
});