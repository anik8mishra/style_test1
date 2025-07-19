import { ClothingItem, User, OutfitRecommendation, UploadResponse } from '../types';

// Backend URL - Update this based on your backend deployment
const BASE_URL = 'http://10.0.2.2:8001'; // Android emulator localhost
// const BASE_URL = 'http://localhost:8001'; // iOS simulator
// const BASE_URL = 'https://your-production-url.com'; // Production

export class ApiService {
  private static baseUrl = BASE_URL;

  // Generic request handler
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Upload clothing item with image
  static async uploadClothingItem(
    imageUri: string,
    userId: string
  ): Promise<UploadResponse> {
    const formData = new FormData();
    
    // Create file object for React Native
    const fileExtension = imageUri.split('.').pop() || 'jpg';
    formData.append('file', {
      uri: imageUri,
      type: `image/${fileExtension}`,
      name: `clothing_${Date.now()}.${fileExtension}`,
    } as any);

    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/clothing/upload?user_id=${userId}`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  // Get user's clothing items
  static async getUserClothing(userId: string): Promise<{ success: boolean; items: ClothingItem[]; total: number }> {
    return this.request(`/api/v1/clothing/user/${userId}/items`);
  }

  // Create test user
  static async createTestUser(
    email: string = 'test@stylesync.com',
    name: string = 'Test User'
  ): Promise<{ success: boolean; user_id: string; email: string; name: string }> {
    return this.request('/api/v1/users/create-test-user', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  }

  // Get outfit recommendations
  static async getOutfitRecommendations(
    userId: string,
    mood: string,
    occasion: string,
    weather: any = {}
  ): Promise<{ recommendations: OutfitRecommendation[] }> {
    return this.request('/api/v1/recommendations/generate', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        mood,
        occasion,
        weather,
      }),
    });
  }

  // Health check
  static async healthCheck(): Promise<any> {
    return this.request('/api/v1/health');
  }

  // Get all users (for testing)
  static async getAllUsers(): Promise<{ success: boolean; users: User[]; total: number }> {
    return this.request('/api/v1/users/users');
  }
}