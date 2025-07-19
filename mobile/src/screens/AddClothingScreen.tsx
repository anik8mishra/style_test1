import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, GradientColors } from '../constants/Colors';
import { GlobalStyles } from '../constants/Styles';
import { ApiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AddClothingScreen({ navigation }: any) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [brand, setBrand] = useState('');
  const [notes, setNotes] = useState('');

  const USER_ID = 'mobile-user-123'; // For demo purposes

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions required',
        'We need camera and photo library permissions to add clothing items.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleImagePicker = async (useCamera: boolean) => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4], // Good aspect ratio for clothing
        quality: 0.8, // Balance between quality and file size
      };

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert('No image selected', 'Please select an image first.');
      return;
    }

    try {
      setUploading(true);
      setAnalyzing(true);
      
      // Create test user if needed
      await ApiService.createTestUser();

      // Upload the image with AI analysis
      const result = await ApiService.uploadClothingItem(selectedImage, USER_ID);

      if (result.success) {
        Alert.alert(
          'Success!',
          `${result.message}\n\nAI detected: ${result.ai_analysis?.category || 'Unknown'} (${Math.round((result.ai_analysis?.confidence_score || 0) * 100)}% confidence)`,
          [
            {
              text: 'Add Another',
              onPress: () => {
                setSelectedImage(null);
                setBrand('');
                setNotes('');
              }
            },
            {
              text: 'View Wardrobe',
              onPress: () => navigation.navigate('Wardrobe')
            }
          ]
        );
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        'Failed to upload and analyze the image. Please check your connection and try again.'
      );
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const renderImageSelection = () => (
    <View style={styles.imageSelectionContainer}>
      <Text style={styles.sectionTitle}>Choose Image Source</Text>
      
      <View style={styles.imageSourceButtons}>
        <TouchableOpacity
          style={styles.sourceButton}
          onPress={() => handleImagePicker(true)}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.sourceButtonGradient}
          >
            <Ionicons name="camera" size={32} color="white" />
            <Text style={styles.sourceButtonText}>Take Photo</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sourceButton}
          onPress={() => handleImagePicker(false)}
        >
          <LinearGradient
            colors={[Colors.secondary, Colors.fashionPurple]}
            style={styles.sourceButtonGradient}
          >
            <Ionicons name="images" size={32} color="white" />
            <Text style={styles.sourceButtonText}>From Gallery</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.tipContainer}>
        <Ionicons name="bulb-outline" size={20} color={Colors.accent} />
        <Text style={styles.tipText}>
          For best results, take photos with good lighting and the item laid flat or hanging.
        </Text>
      </View>
    </View>
  );

  const renderImagePreview = () => (
    <View style={styles.imagePreviewContainer}>
      <Text style={styles.sectionTitle}>Selected Image</Text>
      
      <View style={styles.imagePreview}>
        <Image source={{ uri: selectedImage! }} style={styles.previewImage} />
        
        <TouchableOpacity
          style={styles.changeImageButton}
          onPress={() => setSelectedImage(null)}
        >
          <Ionicons name="refresh" size={20} color={Colors.primary} />
          <Text style={styles.changeImageText}>Change Image</Text>
        </TouchableOpacity>
      </View>

      {/* Optional metadata */}
      <View style={styles.metadataContainer}>
        <Text style={styles.sectionSubtitle}>Additional Information (Optional)</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Brand (e.g., Nike, Zara, H&M)"
          value={brand}
          onChangeText={setBrand}
          placeholderTextColor={Colors.textMuted}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Notes (e.g., formal, casual, favorite item)"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      <TouchableOpacity
        style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
        onPress={handleUpload}
        disabled={uploading}
      >
        {uploading ? (
          <View style={styles.uploadingContainer}>
            <LoadingSpinner size="small" color="white" />
            <Text style={styles.uploadButtonText}>
              {analyzing ? 'AI Analyzing...' : 'Uploading...'}
            </Text>
          </View>
        ) : (
          <>
            <Ionicons name="cloud-upload" size={20} color="white" />
            <Text style={styles.uploadButtonText}>Analyze & Add to Wardrobe</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={GlobalStyles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Clothing Item</Text>
        <Text style={styles.headerSubtitle}>
          Let our AI analyze your clothing and organize your digital wardrobe
        </Text>
      </View>

      {!selectedImage ? renderImageSelection() : renderImagePreview()}

      {/* AI Features Info */}
      <View style={styles.aiInfoContainer}>
        <Text style={styles.sectionTitle}>AI Analysis Features</Text>
        
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="eye" size={20} color={Colors.primary} />
            <Text style={styles.featureText}>Automatic clothing recognition</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="color-palette" size={20} color={Colors.secondary} />
            <Text style={styles.featureText}>Color analysis and harmony</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="business" size={20} color={Colors.accent} />
            <Text style={styles.featureText}>Formality level assessment</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="leaf" size={20} color={Colors.success} />
            <Text style={styles.featureText}>Season suitability detection</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
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
  sectionTitle: {
    ...GlobalStyles.subtitle,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  imageSelectionContainer: {
    padding: 16,
  },
  imageSourceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sourceButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  sourceButtonGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceAlt,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  tipText: {
    ...GlobalStyles.caption,
    flex: 1,
    lineHeight: 20,
  },
  imagePreviewContainer: {
    padding: 16,
  },
  imagePreview: {
    alignItems: 'center',
    marginBottom: 24,
  },
  previewImage: {
    width: 200,
    height: 260,
    borderRadius: 16,
    marginBottom: 16,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  changeImageText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  metadataContainer: {
    marginBottom: 24,
  },
  input: {
    ...GlobalStyles.input,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  uploadButton: {
    ...GlobalStyles.button,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  uploadButtonText: {
    ...GlobalStyles.buttonText,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiInfoContainer: {
    padding: 16,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    ...GlobalStyles.body,
    flex: 1,
  },
});