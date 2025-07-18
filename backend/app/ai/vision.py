# app/ai/vision.py
import cv2
import numpy as np
from typing import Dict, List, Optional
import torch
import torchvision.transforms as transforms
from PIL import Image
import logging
from pathlib import Path
from sklearn.cluster import KMeans

# Try to import transformers (Hugging Face)
try:
    from transformers import pipeline
    HF_AVAILABLE = True
except ImportError:
    HF_AVAILABLE = False
    logging.warning("Transformers not available. Install with: pip install transformers")

logger = logging.getLogger(__name__)

class ClothingVisionAnalyzer:
    """Advanced computer vision system for clothing recognition and analysis"""
    
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.clothing_categories = [
            'shirt', 'pants', 'dress', 'jacket', 'shoes', 
            'skirt', 'sweater', 'shorts', 'hoodie', 'blazer',
            'jeans', 'blouse', 'tank_top', 'cardigan', 'coat',
            'boots', 'sneakers', 'sandals', 't-shirt'
        ]
        
        self.formality_levels = {
            'casual': 1, 'smart_casual': 2, 'business': 3, 
            'formal': 4, 'black_tie': 5
        }
        
        self.setup_models()
        self.category_mapping = self._create_category_mapping()
    
    def setup_models(self):
        """Initialize computer vision models"""
        try:
            # Basic PyTorch transforms
            self.transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                                   std=[0.229, 0.224, 0.225])
            ])
            
            # Initialize Hugging Face models if available
            self.hf_models = {}
            if HF_AVAILABLE:
                self._load_huggingface_models()
            
            logger.info("Computer vision models loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load models: {e}")
            self.hf_models = {}
    
    def _load_huggingface_models(self):
        """Load Hugging Face fashion classification models"""
        model_configs = [
            {
                'name': 'primary',
                'model_id': 'microsoft/resnet-50',
                'priority': 1
            },
            {
                'name': 'fashion_specific',
                'model_id': 'google/vit-base-patch16-224',
                'priority': 2
            }
        ]
        
        for config in model_configs:
            try:
                model = pipeline(
                    "image-classification",
                    model=config['model_id'],
                    use_fast=True,
                    device=-1 
                )
                self.hf_models[config['name']] = {
                    'model': model,
                    'priority': config['priority']
                }
                logger.info(f"Loaded {config['name']} model successfully")
                
            except Exception as e:
                logger.warning(f"Failed to load {config['name']} model: {e}")
    
    def _create_category_mapping(self):
        """Map various model outputs to StyleSync categories"""
        return {
            # Shirt variations
            'shirt': 'shirt',
            'top': 'shirt',
            'blouse': 'shirt',
            't-shirt': 'shirt',
            'polo': 'shirt',
            'button-up': 'shirt',
            
            # Pants variations
            'pants': 'pants',
            'trousers': 'pants',
            'slacks': 'pants',
            'chinos': 'pants',
            
            # Jeans variations
            'jeans': 'jeans',
            'denim': 'jeans',
            'jean': 'jeans',
            
            # Dress variations
            'dress': 'dress',
            'gown': 'dress',
            'sundress': 'dress',
            
            # Outerwear variations
            'jacket': 'jacket',
            'coat': 'jacket',
            'blazer': 'jacket',
            'cardigan': 'cardigan',
            'sweater': 'sweater',
            'hoodie': 'hoodie',
            
            # Footwear variations
            'shoes': 'shoes',
            'sneakers': 'shoes',
            'boots': 'shoes',
            'sandals': 'shoes',
            'heels': 'shoes',
            'flats': 'shoes',
            
            # Other items
            'shorts': 'shorts',
            'skirt': 'skirt',
            'tank_top': 'tank_top'
        }
    
    def analyze_clothing_image(self, image_path: str) -> Dict:
        """
        Analyze clothing image and extract comprehensive metadata
        
        Args:
            image_path: Path to clothing image
            
        Returns:
            Dict containing analysis results
        """
        try:
            # Load and preprocess image
            image = Image.open(image_path).convert('RGB')
            image_np = np.array(image)
            
            # Multi-method classification
            classification_result = self._classify_clothing_comprehensive(image)
            
            # Extract additional features
            colors = self._extract_dominant_colors(image_np)
            formality = self._assess_formality_level(image_np, classification_result['category'])
            season = self._determine_season_suitability(classification_result['category'], colors)
            style_attrs = self._extract_style_attributes(image_np, classification_result['category'])
            
            return {
                'category': classification_result['category'],
                'subcategory': self._get_subcategory(classification_result['category']),
                'dominant_colors': colors,
                'formality_level': formality,
                'season_suitability': season,
                'style_attributes': style_attrs,
                'confidence_score': classification_result['confidence'],
                'classification_method': classification_result['method'],
                'raw_predictions': classification_result.get('raw_predictions', [])
            }
            
        except Exception as e:
            logger.error(f"Image analysis failed: {e}")
            return self._get_default_analysis()
    
    def _classify_clothing_comprehensive(self, image: Image) -> Dict:
        """Comprehensive classification using multiple methods"""
        results = []
        
        # Method 1: Hugging Face models
        if self.hf_models:
            hf_result = self._classify_with_huggingface(image)
            if hf_result:
                results.append(hf_result)
        
        # Method 2: Enhanced heuristic classification
        heuristic_result = self._classify_clothing_heuristic(image)
        results.append(heuristic_result)
        
        # Combine results using ensemble method
        if len(results) > 1:
            return self._ensemble_classification(results)
        else:
            return results[0] if results else self._get_default_classification()
    
    def _classify_with_huggingface(self, image: Image) -> Optional[Dict]:
        """Classify using Hugging Face models"""
        try:
            best_result = None
            best_confidence = 0
            
            for model_name, model_info in self.hf_models.items():
                try:
                    # Get predictions
                    predictions = model_info['model'](image)
                    
                    # Process top prediction
                    top_pred = predictions[0]
                    raw_label = top_pred['label'].lower()
                    confidence = top_pred['score']
                    
                    # Map to StyleSync category
                    category = self._map_prediction_to_category(raw_label)
                    
                    if confidence > best_confidence and category != 'unknown':
                        best_result = {
                            'category': category,
                            'confidence': confidence,
                            'method': f'huggingface_{model_name}',
                            'raw_prediction': raw_label,
                            'model_used': model_name
                        }
                        best_confidence = confidence
                
                except Exception as e:
                    logger.warning(f"Model {model_name} failed: {e}")
                    continue
            
            return best_result
            
        except Exception as e:
            logger.error(f"Hugging Face classification failed: {e}")
            return None
    
    def _map_prediction_to_category(self, raw_prediction: str) -> str:
        """Map raw model prediction to StyleSync category"""
        # Clean the prediction
        cleaned = raw_prediction.lower().strip()
        
        # Direct mapping first
        if cleaned in self.category_mapping:
            return self.category_mapping[cleaned]
        
        # Fuzzy matching for complex labels
        for pattern, category in self.category_mapping.items():
            if pattern in cleaned or cleaned in pattern:
                return category
        
        # Special handling for common patterns
        if 'jean' in cleaned or 'denim' in cleaned:
            return 'jeans'
        elif 'pant' in cleaned or 'trouser' in cleaned:
            return 'pants'
        elif 'shirt' in cleaned or 'top' in cleaned:
            return 'shirt'
        elif 'dress' in cleaned:
            return 'dress'
        elif 'shoe' in cleaned or 'boot' in cleaned or 'sneaker' in cleaned:
            return 'shoes'
        elif 'jacket' in cleaned or 'coat' in cleaned:
            return 'jacket'
        
        return 'unknown'
    
    def _classify_clothing_heuristic(self, image: Image) -> Dict:
        """Enhanced heuristic classification"""
        try:
            # Convert PIL image to numpy array for analysis
            image_np = np.array(image)
            height, width = image_np.shape[:2]
            
            # Calculate aspect ratio
            aspect_ratio = height / width
            
            # Extract dominant colors
            colors = self._extract_dominant_colors(image_np, k=5)
            
            # Enhanced classification logic
            category = self._determine_category_from_features(
                aspect_ratio, colors, image_np
            )
            
            # Calculate confidence based on feature strength
            confidence = self._calculate_heuristic_confidence(
                aspect_ratio, colors, category
            )
            
            return {
                'category': category,
                'confidence': confidence,
                'method': 'heuristic_enhanced',
                'features_used': {
                    'aspect_ratio': aspect_ratio,
                    'dominant_colors': colors[:3],
                    'image_size': (height, width)
                }
            }
            
        except Exception as e:
            logger.error(f"Heuristic classification failed: {e}")
            return self._get_default_classification()
    
    def _determine_category_from_features(self, aspect_ratio: float, colors: List[str], image_np: np.ndarray) -> str:
        """Determine clothing category from visual features"""
        
        # Color-based indicators
        blue_indicators = ['blue', 'navy', 'indigo', 'steel_blue']
        dark_indicators = ['black', 'navy', 'brown', 'gray', 'dark_blue']
        bright_indicators = ['red', 'pink', 'yellow', 'orange', 'bright_blue']
        
        # Check for blue colors (strong jeans indicator)
        has_blue = any(color in blue_indicators for color in colors)
        has_dark = any(color in dark_indicators for color in colors)
        has_bright = any(color in bright_indicators for color in colors)
        
        # Aspect ratio analysis
        is_very_tall = aspect_ratio > 1.5  # Very tall items
        is_tall = aspect_ratio > 1.2       # Moderately tall
        is_wide = aspect_ratio < 0.8       # Wide items
        is_square = 0.8 <= aspect_ratio <= 1.2  # Square-ish items
        
        # Advanced color analysis
        blue_dominance = sum(1 for color in colors if color in blue_indicators)
        total_colors = len(colors)
        blue_ratio = blue_dominance / total_colors if total_colors > 0 else 0
        
        # Classification logic with improved jeans detection
        if has_blue and is_tall and blue_ratio > 0.3:
            return 'jeans'
        elif has_blue and is_very_tall and blue_ratio > 0.2:
            return 'jeans'
        elif (has_dark or has_blue) and is_tall and not has_bright:
            return 'pants'
        elif is_wide and not is_tall:
            return 'shoes'
        elif is_very_tall and (has_bright or 'white' in colors):
            return 'dress'
        elif is_square and has_bright:
            return 'shirt'
        elif is_tall and has_dark:
            return 'pants'
        else:
            return 'shirt'  # Default fallback
    
    def _calculate_heuristic_confidence(self, aspect_ratio: float, colors: List[str], category: str) -> float:
        """Calculate confidence score for heuristic classification"""
        base_confidence = 0.6
        
        # Boost confidence for strong indicators
        blue_indicators = ['blue', 'navy', 'indigo']
        has_blue = any(color in blue_indicators for color in colors)
        
        if category == 'jeans' and has_blue and aspect_ratio > 1.2:
            base_confidence += 0.2
        elif category == 'pants' and aspect_ratio > 1.3:
            base_confidence += 0.15
        elif category == 'shoes' and aspect_ratio < 0.8:
            base_confidence += 0.15
        elif category == 'dress' and aspect_ratio > 1.5:
            base_confidence += 0.1
        
        return min(base_confidence, 0.85)  # Cap at 0.85 for heuristic methods
    
    def _ensemble_classification(self, results: List[Dict]) -> Dict:
        """Combine multiple classification results"""
        if not results:
            return self._get_default_classification()
        
        # Weight results by confidence and method priority
        weights = {
            'huggingface_primary': 0.4,
            'huggingface_fashion_specific': 0.4,
            'heuristic_enhanced': 0.2
        }
        
        # Find highest confidence result with method weighting
        best_result = None
        best_score = 0
        
        for result in results:
            method = result.get('method', 'unknown')
            confidence = result.get('confidence', 0)
            weight = weights.get(method, 0.1)
            
            weighted_score = confidence * weight
            
            if weighted_score > best_score:
                best_score = weighted_score
                best_result = result
        
        # Adjust confidence based on consensus
        if len(results) > 1:
            categories = [r.get('category') for r in results]
            consensus = len(set(categories)) == 1  # All agree
            
            if consensus:
                best_result['confidence'] = min(best_result['confidence'] + 0.1, 0.95)
            else:
                best_result['confidence'] = max(best_result['confidence'] - 0.1, 0.3)
        
        best_result['ensemble_results'] = results
        return best_result
    
    def _extract_dominant_colors(self, image_np: np.ndarray, k: int = 5) -> List[str]:
        """Extract dominant colors from clothing image"""
        # Reshape image for color analysis
        pixels = image_np.reshape(-1, 3)
        
        # Use k-means to find dominant colors
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        kmeans.fit(pixels)
        
        # Convert RGB to color names
        colors = []
        for color in kmeans.cluster_centers_:
            color_name = self._rgb_to_color_name(color)
            colors.append(color_name)
        
        return colors[:3]  # Return top 3 colors
    
    def _rgb_to_color_name(self, rgb: np.ndarray) -> str:
        """Convert RGB values to color name with enhanced blue detection"""
        r, g, b = rgb.astype(int)
        
        # Enhanced color mapping for better clothing detection
        color_ranges = [
            # Blues (important for jeans detection)
            ((20, 50, 80, 130, 150, 200), 'navy'),        # Dark blue
            ((50, 100, 100, 150, 180, 220), 'blue'),      # Medium blue
            ((30, 80, 60, 120, 140, 200), 'steel_blue'),  # Steel blue
            ((70, 120, 90, 140, 160, 210), 'light_blue'), # Light blue
            
            # Other colors
            ((0, 50, 0, 50, 0, 50), 'black'),
            ((200, 255, 200, 255, 200, 255), 'white'),
            ((100, 180, 100, 180, 100, 180), 'gray'),
            ((150, 255, 0, 100, 0, 100), 'red'),
            ((0, 100, 150, 255, 0, 100), 'green'),
            ((150, 255, 150, 255, 0, 150), 'yellow'),
            ((200, 255, 100, 180, 0, 100), 'orange'),
            ((100, 180, 0, 100, 100, 200), 'purple'),
            ((100, 200, 50, 150, 20, 80), 'brown'),
            ((200, 255, 150, 220, 150, 220), 'pink')
        ]
        
        # Special handling for denim/jeans colors
        if 40 <= b <= 120 and b > r and b > g and r < 80 and g < 80:
            return 'navy'  # Classic jeans color
        
        # Check color ranges
        for (r_min, r_max, g_min, g_max, b_min, b_max), color_name in color_ranges:
            if r_min <= r <= r_max and g_min <= g <= g_max and b_min <= b <= b_max:
                return color_name
        
        # Fallback to closest basic color
        basic_colors = {
            (0, 0, 0): 'black',
            (255, 255, 255): 'white',
            (128, 128, 128): 'gray',
            (255, 0, 0): 'red',
            (0, 255, 0): 'green',
            (0, 0, 255): 'blue',
            (255, 255, 0): 'yellow',
            (255, 165, 0): 'orange',
            (128, 0, 128): 'purple',
            (165, 42, 42): 'brown',
            (255, 192, 203): 'pink'
        }
        
        min_distance = float('inf')
        closest_color = 'gray'
        
        for color_rgb, color_name in basic_colors.items():
            distance = np.sqrt(sum((a - b) ** 2 for a, b in zip((r, g, b), color_rgb)))
            if distance < min_distance:
                min_distance = distance
                closest_color = color_name
        
        return closest_color
    
    def _get_subcategory(self, category: str) -> str:
        """Get subcategory based on main category"""
        subcategory_mapping = {
            'shirt': 'casual_shirt',
            'pants': 'casual_pants',
            'jeans': 'denim_pants',
            'dress': 'casual_dress',
            'jacket': 'casual_jacket',
            'shoes': 'casual_shoes',
            'sweater': 'knit_sweater',
            'hoodie': 'casual_hoodie',
            'shorts': 'casual_shorts',
            'skirt': 'casual_skirt'
        }
        return subcategory_mapping.get(category, 'general')
    
    def _assess_formality_level(self, image_np: np.ndarray, category: str) -> int:
        """Assess formality level of clothing item"""
        formality_mapping = {
            'suit': 4, 'blazer': 3, 'dress_shirt': 3, 'tie': 4,
            'jeans': 1,           # Jeans are typically casual
            'pants': 2,           # Regular pants are smart casual
            'shorts': 1, 'hoodie': 1, 'sneakers': 1,
            'dress': 3, 'blouse': 2, 'cardigan': 2,
            'shoes': 2,           # Default shoe formality
            'shirt': 2,           # Casual shirts
            'jacket': 3           # Jackets tend to be more formal
        }
        return formality_mapping.get(category, 2)
    
    def _determine_season_suitability(self, category: str, colors: List[str]) -> List[str]:
        """Determine which seasons the item is suitable for"""
        season_mapping = {
            'shorts': ['spring', 'summer'],
            'tank_top': ['spring', 'summer'],
            'coat': ['fall', 'winter'],
            'sweater': ['fall', 'winter'],
            'jacket': ['fall', 'winter', 'spring'],
            'jeans': ['fall', 'winter', 'spring'],  # Jeans are good for cooler weather
            'pants': ['spring', 'summer', 'fall', 'winter'],  # Pants work year-round
            'dress': ['spring', 'summer', 'fall'],
            'shirt': ['spring', 'summer', 'fall', 'winter']
        }
        return season_mapping.get(category, ['spring', 'summer', 'fall', 'winter'])
    
    def _extract_style_attributes(self, image_np: np.ndarray, category: str) -> List[str]:
        """Extract style attributes from clothing image"""
        style_mapping = {
            'jeans': ['casual', 'durable', 'versatile', 'everyday'],
            'pants': ['comfortable', 'versatile', 'practical'],
            'shirt': ['casual', 'comfortable', 'versatile'],
            'dress': ['feminine', 'elegant', 'stylish'],
            'jacket': ['protective', 'stylish', 'layering'],
            'shoes': ['practical', 'comfortable'],
            'sweater': ['cozy', 'warm', 'comfortable'],
            'hoodie': ['casual', 'comfortable', 'sporty']
        }
        
        return style_mapping.get(category, ['casual', 'comfortable', 'versatile'])
    
    def _get_default_classification(self) -> Dict:
        """Return default classification when all methods fail"""
        return {
            'category': 'unknown',
            'confidence': 0.0,
            'method': 'fallback'
        }
    
    def _get_default_analysis(self) -> Dict:
        """Return default analysis when image processing fails"""
        return {
            'category': 'unknown',
            'subcategory': 'general',
            'dominant_colors': ['gray'],
            'formality_level': 2,
            'season_suitability': ['spring', 'summer', 'fall', 'winter'],
            'style_attributes': ['casual'],
            'confidence_score': 0.0,
            'classification_method': 'error_fallback'
        }
    
    # Additional utility methods
    def get_supported_categories(self) -> List[str]:
        """Return list of supported clothing categories"""
        return self.clothing_categories.copy()
    
    def get_model_info(self) -> Dict:
        """Return information about loaded models"""
        return {
            'device': str(self.device),
            'huggingface_available': HF_AVAILABLE,
            'loaded_models': list(self.hf_models.keys()),
            'supported_categories': len(self.clothing_categories)
        }
