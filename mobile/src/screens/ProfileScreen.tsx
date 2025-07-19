import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../constants/Colors';
import { GlobalStyles } from '../constants/Styles';
import { ApiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProfileScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoRecommendations: true,
  });

  const USER_ID = 'mobile-user-123'; // For demo purposes

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Create test user and get data
      const user = await ApiService.createTestUser();
      setUserData(user);
      
      // Get user's clothing stats
      const clothing = await ApiService.getUserClothing(USER_ID);
      setUserData(prev => ({ ...prev, itemCount: clothing.total }));
      
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHealthCheck = async () => {
    try {
      const health = await ApiService.healthCheck();
      Alert.alert(
        'System Health',
        `✅ Backend Status: ${health.status}\n🤖 AI Modules: ${health.ai_modules?.join(', ')}\n💾 Database: ${health.database}`
      );
    } catch (error) {
      Alert.alert('Health Check Failed', 'Unable to connect to backend services.');
    }
  };

  const menuItems = [
    {
      id: 'wardrobe',
      title: 'My Wardrobe',
      subtitle: `${userData?.itemCount || 0} items`,
      icon: 'shirt-outline',
      onPress: () => navigation.navigate('Wardrobe'),
    },
    {
      id: 'recommendations',
      title: 'Outfit History',
      subtitle: 'View past recommendations',
      icon: 'time-outline',
      onPress: () => navigation.navigate('Recommendations'),
    },
    {
      id: 'preferences',
      title: 'Style Preferences',
      subtitle: 'Customize your style profile',
      icon: 'settings-outline',
      onPress: () => Alert.alert('Coming Soon', 'Style preferences will be available in a future update.'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'FAQs and contact info',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Help', 'For support, please contact support@stylesync.com'),
    },
    {
      id: 'health',
      title: 'System Health',
      subtitle: 'Check backend connection',
      icon: 'pulse-outline',
      onPress: handleHealthCheck,
    },
  ];

  if (loading) {
    return (
      <View style={GlobalStyles.centerContainer}>
        <LoadingSpinner message="Loading profile..." />
      </View>
    );
  }

  return (
    <ScrollView style={GlobalStyles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.userName}>{userData?.name || 'Fashion Enthusiast'}</Text>
        <Text style={styles.userEmail}>{userData?.email || 'user@stylesync.com'}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userData?.itemCount || 0}</Text>
          <Text style={styles.statLabel}>Clothing Items</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>AI</Text>
          <Text style={styles.statLabel}>Powered</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>∞</Text>
          <Text style={styles.statLabel}>Style Combos</Text>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingSubtitle}>Get outfit recommendations</Text>
            </View>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => setSettings(prev => ({ ...prev, notifications: value }))}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon-outline" size={24} color={Colors.primary} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingSubtitle}>Coming soon</Text>
            </View>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={(value) => setSettings(prev => ({ ...prev, darkMode: value }))}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            disabled
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="sparkles-outline" size={24} color={Colors.primary} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Auto Recommendations</Text>
              <Text style={styles.settingSubtitle}>Daily outfit suggestions</Text>
            </View>
          </View>
          <Switch
            value={settings.autoRecommendations}
            onValueChange={(value) => setSettings(prev => ({ ...prev, autoRecommendations: value }))}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Menu</Text>
        
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* App Info */}
      <View style={styles.appInfoContainer}>
        <Text style={styles.appInfoTitle}>StyleSync AI</Text>
        <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
        <Text style={styles.appInfoDescription}>
          AI-powered fashion recommendations for your personal style
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    ...GlobalStyles.title,
    marginBottom: 4,
  },
  userEmail: {
    ...GlobalStyles.caption,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    ...GlobalStyles.card,
    alignItems: 'center',
    paddingVertical: 20,
    margin: 0,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...GlobalStyles.caption,
    textAlign: 'center',
  },
  settingsContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    ...GlobalStyles.subtitle,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    ...GlobalStyles.muted,
  },
  menuContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    ...GlobalStyles.muted,
  },
  appInfoContainer: {
    alignItems: 'center',
    padding: 32,
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  appInfoVersion: {
    ...GlobalStyles.caption,
    marginBottom: 8,
  },
  appInfoDescription: {
    ...GlobalStyles.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});