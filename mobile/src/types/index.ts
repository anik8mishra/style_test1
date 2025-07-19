export interface ClothingItem {
  item_id: string;
  category: string;
  subcategory?: string;
  color: string;
  brand?: string;
  image_url: string;
  metadata?: {
    ai_analysis?: any;
    color_analysis?: any;
    formality_level?: number;
  };
  created_at: string;
}

export interface User {
  user_id: string;
  email: string;
  full_name: string;
  style_preferences?: {
    preferred_colors?: string[];
    style_type?: string;
    formality_preference?: number;
  };
  color_preferences?: any;
  body_measurements?: any;
}

export interface Outfit {
  outfit_id: string;
  items: ClothingItem[];
  mood: string;
  occasion: string;
  confidence_score: number;
  style_description: string;
  color_harmony: boolean;
  weather_appropriate: boolean;
  created_at: string;
}

export interface OutfitRecommendation extends Outfit {
  recommendation_method?: string;
  final_score?: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  item_id: string;
  user_id: string;
  ai_analysis: any;
  color_analysis: any;
  image_path: string;
}

export type RootStackParamList = {
  Home: undefined;
  Wardrobe: undefined;
  AddClothing: undefined;
  Recommendations: undefined;
  Profile: undefined;
  ItemDetail: { item: ClothingItem };
  OutfitDetail: { outfit: Outfit };
};