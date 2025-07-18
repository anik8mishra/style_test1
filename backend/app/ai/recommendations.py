# Enhanced app/ai/recommendations.py with extensive debugging
from typing import List, Dict, Optional
import numpy as np
from datetime import datetime
import logging
from sqlalchemy.orm import Session
from app.models.clothing import ClothingItem
from app.models.user import User
from app.models.outfit import Outfit
import random

# Try to import ML models
try:
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

logger = logging.getLogger(__name__)

class OutfitRecommendationEngine:
    """AI-enhanced outfit recommendation system with extensive debugging"""
    
    def __init__(self):
        logger.info("🔧 Initializing OutfitRecommendationEngine...")
        
        self.mood_style_mapping = {
            'confident': {'colors': ['red', 'black', 'navy'], 'formality': 3},
            'relaxed': {'colors': ['blue', 'green', 'gray'], 'formality': 1},
            'creative': {'colors': ['purple', 'orange', 'yellow'], 'formality': 2},
            'professional': {'colors': ['black', 'navy', 'gray'], 'formality': 4},
            'romantic': {'colors': ['pink', 'red', 'white'], 'formality': 2},
            'adventurous': {'colors': ['green', 'brown', 'orange'], 'formality': 1}
        }
        
        self.occasion_requirements = {
            'work': {'formality_min': 3, 'colors': ['navy', 'black', 'gray', 'white']},
            'casual': {'formality_min': 1, 'colors': ['blue', 'green', 'red', 'yellow']},
            'date': {'formality_min': 2, 'colors': ['black', 'red', 'navy', 'white']},
            'party': {'formality_min': 3, 'colors': ['black', 'red', 'gold', 'silver']},
            'workout': {'formality_min': 1, 'colors': ['black', 'gray', 'blue', 'green']},
            'formal': {'formality_min': 4, 'colors': ['black', 'navy', 'gray', 'white']}
        }
        
        self.weather_adjustments = {
            'hot': {'avoid_categories': ['coat', 'sweater'], 'prefer': ['shorts', 'tank_top']},
            'cold': {'prefer_categories': ['coat', 'sweater'], 'avoid': ['shorts', 'tank_top']},
            'rainy': {'prefer_categories': ['jacket', 'boots'], 'avoid': ['white', 'suede']},
            'mild': {'neutral': True}
        }
        
        self.essential_categories = {
            'tops': ['shirt', 'blouse', 't-shirt', 'tank_top', 'sweater', 'hoodie', 'top'],
            'bottoms': ['pants', 'jeans', 'shorts', 'skirt', 'dress', 'trousers'],
            'outerwear': ['jacket', 'coat', 'blazer', 'cardigan'],
            'footwear': ['shoes', 'sneakers', 'boots', 'sandals', 'heels']
        }
        
        # Initialize AI models if available
        self.ai_models = {}
        if ML_AVAILABLE:
            self._load_ai_models()
        
        logger.info("✅ OutfitRecommendationEngine initialized successfully")
    
    def generate_outfit_recommendations(
        self, 
        user_id: str, 
        mood: str, 
        occasion: str, 
        weather: Dict,
        db: Session,
        num_recommendations: int = 3
    ) -> List[Dict]:
        """Generate AI-enhanced outfit recommendations with extensive debugging"""
        
        logger.info(f"🎯 Starting recommendations for user {user_id}")
        logger.info(f"   Mood: {mood}, Occasion: {occasion}, Weather: {weather}")
        
        try:
            # Step 1: Get user's clothing items
            user_clothes = self._get_user_clothing(user_id, db)
            logger.info(f"📦 Found {len(user_clothes)} clothing items for user {user_id}")
            
            if not user_clothes:
                logger.warning("❌ No clothing items found - returning empty recommendations")
                return []
            
            # Debug: Log some sample items
            for i, item in enumerate(user_clothes[:3]):  # Log first 3 items
                logger.info(f"   Item {i+1}: {item.category} - {item.color} (ID: {item.item_id})")
            
            # Step 2: Get user preferences
            user_preferences = self._get_user_preferences(user_id, db)
            logger.info(f"👤 User preferences: {user_preferences}")
            
            # Step 3: Generate recommendations
            recommendations = []
            
            # Always try rule-based first (more reliable)
            logger.info("🔧 Generating rule-based recommendations...")
            rule_based_recs = self._generate_rule_based_recommendations(
                user_clothes, mood, occasion, weather, user_preferences, num_recommendations
            )
            logger.info(f"✅ Generated {len(rule_based_recs)} rule-based recommendations")
            recommendations.extend(rule_based_recs)
            
            # Add AI-enhanced if available
            if ML_AVAILABLE and self.ai_models:
                logger.info("🤖 Generating AI-enhanced recommendations...")
                ai_enhanced_recs = self._generate_ai_enhanced_recommendations(
                    user_clothes, mood, occasion, weather, user_preferences, num_recommendations
                )
                logger.info(f"✅ Generated {len(ai_enhanced_recs)} AI-enhanced recommendations")
                recommendations.extend(ai_enhanced_recs)
            else:
                logger.info("⚠️ AI models not available, using rule-based only")
            
            # Step 4: Process and rank recommendations
            if not recommendations:
                logger.warning("❌ No recommendations generated - creating emergency fallback")
                emergency_rec = self._create_emergency_recommendation(user_clothes, mood, occasion)
                if emergency_rec:
                    recommendations = [emergency_rec]
            
            # Remove duplicates and rank
            unique_recommendations = self._deduplicate_recommendations(recommendations)
            logger.info(f"🔄 After deduplication: {len(unique_recommendations)} unique recommendations")
            
            scored_recommendations = self._score_recommendations(
                unique_recommendations, user_preferences, mood, occasion
            )
            
            final_recommendations = scored_recommendations[:num_recommendations]
            logger.info(f"🎯 Returning {len(final_recommendations)} final recommendations")
            
            # Debug: Log final recommendations
            for i, rec in enumerate(final_recommendations):
                logger.info(f"   Rec {i+1}: {len(rec['items'])} items, confidence: {rec.get('confidence_score', 0):.2f}")
            
            return final_recommendations
            
        except Exception as e:
            logger.error(f"💥 Recommendation generation failed completely: {e}")
            logger.error(f"   User ID: {user_id}, Mood: {mood}, Occasion: {occasion}")
            
            # Emergency fallback - try to create at least one recommendation
            try:
                user_clothes = self._get_user_clothing(user_id, db)
                if user_clothes:
                    emergency_rec = self._create_emergency_recommendation(user_clothes, mood, occasion)
                    return [emergency_rec] if emergency_rec else []
            except:
                pass
            
            return []

    def _get_user_clothing(self, user_id: str, db: Session) -> List[ClothingItem]:
        """Retrieve user's clothing items from database with debugging"""
        try:
            logger.info(f"🔍 Querying clothing items for user {user_id}")
            items = db.query(ClothingItem).filter(ClothingItem.user_id == user_id).all()
            
            if not items:
                logger.warning(f"❌ No clothing items found in database for user {user_id}")
                # Check if user exists
                user_exists = db.query(User).filter(User.user_id == user_id).first()
                if not user_exists:
                    logger.error(f"❌ User {user_id} doesn't exist in database")
                else:
                    logger.info(f"✅ User {user_id} exists but has no clothing items")
            
            return items
            
        except Exception as e:
            logger.error(f"💥 Database error getting user clothing: {e}")
            return []

    def _get_user_preferences(self, user_id: str, db: Session) -> Dict:
        """Get user style preferences with debugging"""
        try:
            user = db.query(User).filter(User.user_id == user_id).first()
            if user and hasattr(user, 'style_preferences') and user.style_preferences:
                return user.style_preferences
            logger.info(f"👤 No style preferences found for user {user_id}")
            return {}
        except Exception as e:
            logger.error(f"💥 Error getting user preferences: {e}")
            return {}

    def _generate_rule_based_recommendations(
        self, 
        user_clothes: List[ClothingItem], 
        mood: str, 
        occasion: str, 
        weather: Dict,
        user_preferences: Dict,
        num_recommendations: int
    ) -> List[Dict]:
        """Generate recommendations using rule-based system with debugging"""
        
        logger.info(f"🔧 Creating {num_recommendations} rule-based recommendations")
        recommendations = []
        
        # Create multiple variations to avoid duplicates
        for attempt in range(num_recommendations * 2):  # Try more attempts
            logger.info(f"   Attempt {attempt + 1}")
            
            # Shuffle items for variety
            shuffled_clothes = user_clothes.copy()
            random.shuffle(shuffled_clothes)
            
            outfit = self._create_outfit_recommendation(
                shuffled_clothes, mood, occasion, weather, user_preferences
            )
            
            if outfit:
                outfit['recommendation_method'] = 'rule_based'
                outfit['attempt_number'] = attempt + 1
                recommendations.append(outfit)
                logger.info(f"   ✅ Created recommendation with {len(outfit['items'])} items")
                
                if len(recommendations) >= num_recommendations:
                    break
            else:
                logger.warning(f"   ❌ Attempt {attempt + 1} failed to create outfit")
        
        logger.info(f"🔧 Rule-based generation complete: {len(recommendations)} recommendations")
        return recommendations

    def _create_outfit_recommendation(self, clothing_items, mood, occasion, weather, user_preferences):
        """MAIN IMPLEMENTATION - Create rule-based outfit recommendation with extensive debugging"""
        
        if not clothing_items:
            logger.warning("❌ _create_outfit_recommendation: No clothing items provided")
            return None

        try:
            logger.info(f"🏗️ Building outfit from {len(clothing_items)} items")
            logger.info(f"   Mood: {mood}, Occasion: {occasion}")
            
            # Step 1: Apply filters with fallbacks
            logger.info("🔍 Applying filters...")
            
            # Start with all items
            current_items = clothing_items.copy()
            logger.info(f"   Starting with {len(current_items)} items")
            
            # Filter by occasion (with fallback)
            occasion_filtered = self._filter_by_occasion(current_items, occasion)
            if occasion_filtered:
                current_items = occasion_filtered
                logger.info(f"   After occasion filter: {len(current_items)} items")
            else:
                logger.warning("   ⚠️ Occasion filter too restrictive, keeping all items")
            
            # Filter by mood (with fallback)
            mood_filtered = self._filter_by_mood(current_items, mood)
            if mood_filtered:
                current_items = mood_filtered
                logger.info(f"   After mood filter: {len(current_items)} items")
            else:
                logger.warning("   ⚠️ Mood filter too restrictive, keeping current items")
            
            # Filter by weather (with fallback)
            weather_filtered = self._filter_by_weather(current_items, weather)
            if weather_filtered:
                current_items = weather_filtered
                logger.info(f"   After weather filter: {len(current_items)} items")
            else:
                logger.warning("   ⚠️ Weather filter too restrictive, keeping current items")
            
            if not current_items:
                logger.warning("❌ All filters removed all items, using original list")
                current_items = clothing_items
            
            # Step 2: Categorize items
            logger.info("📂 Categorizing items...")
            categorized_items = self._categorize_items(current_items)
            
            for category, items in categorized_items.items():
                if items:
                    logger.info(f"   {category}: {len(items)} items")
            
            # Step 3: Build outfit
            logger.info("👗 Building complete outfit...")
            outfit_items = self._build_complete_outfit(categorized_items, mood, occasion)
            
            if not outfit_items:
                logger.warning("❌ Failed to build complete outfit, using fallback selection")
                # Fallback: just pick first few items
                outfit_items = current_items[:min(3, len(current_items))]
            
            logger.info(f"✅ Selected {len(outfit_items)} items for outfit")
            
            # Step 4: Format output
            selected_items = []
            for item in outfit_items:
                try:
                    item_dict = {
                        "item_id": str(item.item_id),
                        "category": str(item.category),
                        "color": str(item.color),
                        "image_url": getattr(item, 'image_path', '') or '',
                        "metadata": {}
                    }
                    
                    # Safely handle metadata
                    if hasattr(item, 'metadata') and item.metadata:
                        if isinstance(item.metadata, dict):
                            item_dict["metadata"] = {
                                "ai_analysis": item.metadata.get("ai_analysis", {}),
                                "formality_level": item.metadata.get("formality_level", 2)
                            }
                        else:
                            item_dict["metadata"] = {"formality_level": 2}
                    else:
                        item_dict["metadata"] = {"formality_level": 2}
                    
                    selected_items.append(item_dict)
                    logger.info(f"   ✅ Added {item.category} - {item.color}")
                    
                except Exception as e:
                    logger.error(f"   ❌ Error processing item {getattr(item, 'item_id', 'unknown')}: {e}")
                    continue
            
            if not selected_items:
                logger.error("❌ No items could be processed for outfit")
                return None
            
            # Step 5: Calculate confidence and create final outfit
            confidence = self._calculate_confidence_score(selected_items, mood, occasion)
            
            outfit = {
                "outfit_id": f"rec_{int(datetime.now().timestamp())}_{random.randint(1000, 9999)}",
                "items": selected_items,
                "mood": mood,
                "occasion": occasion,
                "confidence_score": confidence,
                "style_description": self._generate_style_description(selected_items, mood),
                "color_harmony": self._assess_color_harmony(selected_items),
                "weather_appropriate": True,
                "created_at": datetime.now().isoformat()
            }
            
            logger.info(f"✅ Created outfit {outfit['outfit_id']} with confidence {confidence:.2f}")
            return outfit

        except Exception as e:
            logger.error(f"💥 _create_outfit_recommendation failed: {e}")
            logger.error(f"   Error type: {type(e).__name__}")
            import traceback
            logger.error(f"   Traceback: {traceback.format_exc()}")
            return None

    def _create_emergency_recommendation(self, clothing_items: List[ClothingItem], mood: str, occasion: str) -> Optional[Dict]:
        """Create a simple emergency recommendation when all else fails"""
        logger.info("🚨 Creating emergency fallback recommendation")
        
        if not clothing_items:
            return None
        
        try:
            # Just take the first 1-3 items
            selected_items = []
            for item in clothing_items[:3]:
                selected_items.append({
                    "item_id": str(item.item_id),
                    "category": str(item.category),
                    "color": str(item.color),
                    "image_url": getattr(item, 'image_path', '') or '',
                    "metadata": {"formality_level": 2}
                })
            
            return {
                "outfit_id": f"emergency_{int(datetime.now().timestamp())}",
                "items": selected_items,
                "mood": mood,
                "occasion": occasion,
                "confidence_score": 0.5,
                "style_description": f"A simple {occasion} outfit",
                "color_harmony": True,
                "weather_appropriate": True,
                "recommendation_method": "emergency_fallback"
            }
            
        except Exception as e:
            logger.error(f"💥 Even emergency recommendation failed: {e}")
            return None

    # Keep all your existing filter methods but add debugging
    def _filter_by_occasion(self, items: List[ClothingItem], occasion: str) -> List[ClothingItem]:
        """Filter items suitable for the occasion"""
        logger.info(f"🔍 Filtering by occasion: {occasion}")
        
        if occasion not in self.occasion_requirements:
            logger.info(f"   Unknown occasion '{occasion}', keeping all items")
            return items
        
        requirements = self.occasion_requirements[occasion]
        filtered = []
        
        for item in items:
            try:
                # Check formality level
                formality = 2  # default
                if hasattr(item, 'metadata') and item.metadata and isinstance(item.metadata, dict):
                    formality = item.metadata.get('formality_level', 2)
                
                if formality >= requirements['formality_min']:
                    filtered.append(item)
                elif item.color and item.color.lower() in requirements['colors']:
                    filtered.append(item)
                    
            except Exception as e:
                logger.warning(f"   Error processing item {getattr(item, 'item_id', 'unknown')}: {e}")
                # Include item anyway to avoid empty results
                filtered.append(item)
        
        logger.info(f"   Occasion filter result: {len(filtered)}/{len(items)} items")
        return filtered if filtered else items

    def _filter_by_mood(self, items: List[ClothingItem], mood: str) -> List[ClothingItem]:
        """Filter items that match the mood"""
        logger.info(f"🔍 Filtering by mood: {mood}")
        
        if mood not in self.mood_style_mapping:
            logger.info(f"   Unknown mood '{mood}', keeping all items")
            return items
        
        mood_style = self.mood_style_mapping[mood]
        filtered = []
        
        for item in items:
            try:
                # Check color match
                if item.color and item.color.lower() in mood_style['colors']:
                    filtered.append(item)
                else:
                    # Check formality match
                    formality = 2
                    if hasattr(item, 'metadata') and item.metadata and isinstance(item.metadata, dict):
                        formality = item.metadata.get('formality_level', 2)
                    
                    if abs(formality - mood_style['formality']) <= 1:
                        filtered.append(item)
                        
            except Exception as e:
                logger.warning(f"   Error processing item {getattr(item, 'item_id', 'unknown')}: {e}")
                filtered.append(item)  # Include anyway
        
        logger.info(f"   Mood filter result: {len(filtered)}/{len(items)} items")
        return filtered if filtered else items

    def _filter_by_weather(self, items: List[ClothingItem], weather: Dict) -> List[ClothingItem]:
        """Filter items suitable for weather conditions"""
        weather_condition = weather.get('condition', 'mild').lower() if weather else 'mild'
        logger.info(f"🔍 Filtering by weather: {weather_condition}")
        
        if weather_condition not in self.weather_adjustments:
            logger.info(f"   Unknown weather '{weather_condition}', keeping all items")
            return items
        
        adjustments = self.weather_adjustments[weather_condition]
        if adjustments.get('neutral'):
            logger.info("   Neutral weather, keeping all items")
            return items
        
        filtered = []
        for item in items:
            try:
                # Avoid unsuitable categories
                if 'avoid_categories' in adjustments and item.category and item.category.lower() in adjustments['avoid_categories']:
                    continue
                # Avoid unsuitable colors  
                if 'avoid' in adjustments and item.color and item.color.lower() in adjustments['avoid']:
                    continue
                
                # Prefer certain categories (add to front)
                if 'prefer_categories' in adjustments and item.category and item.category.lower() in adjustments['prefer_categories']:
                    filtered.insert(0, item)
                else:
                    filtered.append(item)
                    
            except Exception as e:
                logger.warning(f"   Error processing item {getattr(item, 'item_id', 'unknown')}: {e}")
                filtered.append(item)  # Include anyway
        
        logger.info(f"   Weather filter result: {len(filtered)}/{len(items)} items")
        return filtered if filtered else items

    # Keep all your other existing methods with minimal changes...
    def _categorize_items(self, items: List[ClothingItem]) -> Dict[str, List[ClothingItem]]:
        """Categorize clothing items by type"""
        categories = {'tops': [], 'bottoms': [], 'outerwear': [], 'footwear': [], 'accessories': []}
        
        for item in items:
            try:
                category = item.category.lower() if item.category else 'accessories'
                
                if category in self.essential_categories['tops']:
                    categories['tops'].append(item)
                elif category in self.essential_categories['bottoms']:
                    categories['bottoms'].append(item)
                elif category in self.essential_categories['outerwear']:
                    categories['outerwear'].append(item)
                elif category in self.essential_categories['footwear']:
                    categories['footwear'].append(item)
                else:
                    categories['accessories'].append(item)
                    
            except Exception as e:
                logger.warning(f"Error categorizing item: {e}")
                categories['accessories'].append(item)
        
        return categories

    def _build_complete_outfit(self, categorized_items: Dict, mood: str, occasion: str) -> List[ClothingItem]:
        """Build a complete outfit from categorized items"""
        outfit = []
        
        # Essential: Add a top
        if categorized_items['tops']:
            outfit.append(categorized_items['tops'][0])
        
        # Essential: Add bottoms (unless we have a dress)
        if categorized_items['bottoms']:
            has_dress = any(getattr(item, 'category', '').lower() == 'dress' for item in outfit)
            if not has_dress:
                outfit.append(categorized_items['bottoms'][0])
        
        # Add outerwear for formal occasions
        if occasion in ['work', 'formal', 'date'] and categorized_items['outerwear']:
            outfit.append(categorized_items['outerwear'][0])
        
        # Add footwear
        if categorized_items['footwear']:
            outfit.append(categorized_items['footwear'][0])
        
        # Add accessories if space
        if categorized_items['accessories'] and len(outfit) < 4:
            outfit.append(categorized_items['accessories'][0])
        
        return outfit

    def _calculate_confidence_score(self, outfit_items: List[Dict], mood: str, occasion: str) -> float:
        """Calculate confidence score for outfit recommendation"""
        if not outfit_items:
            return 0.0
        
        base_score = 0.6
        
        # Bonus for having multiple categories
        categories = set(item['category'] for item in outfit_items)
        if len(categories) >= 2:
            base_score += 0.1
        if len(categories) >= 3:
            base_score += 0.1
        
        # Bonus for color coordination
        colors = [item['color'] for item in outfit_items]
        if self._colors_coordinate(colors):
            base_score += 0.1
        
        return min(base_score, 1.0)

    def _colors_coordinate(self, colors: List[str]) -> bool:
        """Check if colors coordinate well together"""
        if not colors:
            return True
            
        neutral_colors = ['black', 'white', 'gray', 'grey', 'navy', 'beige', 'brown']
        
        # If all colors are neutral, they coordinate
        neutral_count = sum(1 for color in colors if color.lower() in neutral_colors)
        if neutral_count == len(colors):
            return True
        
        # If there's at most one non-neutral color, they coordinate
        return (len(colors) - neutral_count) <= 1

    def _generate_style_description(self, outfit_items: List[Dict], mood: str) -> str:
        """Generate a description of the outfit style"""
        if not outfit_items:
            return "A simple outfit"
        
        colors = [item['color'] for item in outfit_items if item.get('color')]
        dominant_color = max(set(colors), key=colors.count) if colors else "neutral"
        
        return f"A stylish {dominant_color} ensemble perfect for a {mood} mood"

    def _assess_color_harmony(self, outfit_items: List[Dict]) -> bool:
        """Assess if the outfit has good color harmony"""
        if not outfit_items:
            return True
        
        colors = [item['color'].lower() for item in outfit_items if item.get('color')]
        return self._colors_coordinate(colors)

    def _score_recommendations(self, recommendations: List[Dict], user_preferences: Dict, mood: str, occasion: str) -> List[Dict]:
        """Score and rank recommendations"""
        for rec in recommendations:
            base_score = rec.get('confidence_score', 0.5)
            
            # Add preference bonuses
            if user_preferences and 'preferred_colors' in user_preferences:
                preferred_colors = user_preferences['preferred_colors']
                outfit_colors = [item['color'].lower() for item in rec['items']]
                
                if any(color in preferred_colors for color in outfit_colors):
                    base_score += 0.1
            
            # AI enhancement bonus
            if rec.get('recommendation_method') == 'ai_enhanced':
                base_score += 0.05
            
            rec['final_score'] = min(base_score, 1.0)
        
        return sorted(recommendations, key=lambda x: x['final_score'], reverse=True)

    def _deduplicate_recommendations(self, recommendations: List[Dict]) -> List[Dict]:
        """Remove duplicate outfit recommendations"""
        seen_combinations = set()
        unique_recs = []
        
        for rec in recommendations:
            try:
                item_ids = sorted([str(item['item_id']) for item in rec['items']])
                combo_signature = tuple(item_ids)
                
                if combo_signature not in seen_combinations:
                    seen_combinations.add(combo_signature)
                    unique_recs.append(rec)
            except Exception as e:
                logger.warning(f"Error deduplicating recommendation: {e}")
                unique_recs.append(rec)  # Include anyway
        
        return unique_recs

    # Placeholder for AI methods (implement later)
    def _generate_ai_enhanced_recommendations(self, *args, **kwargs):
        """Placeholder for AI-enhanced recommendations"""
        logger.info("🤖 AI recommendations not implemented yet")
        return []
    
    def _load_ai_models(self):
        """Placeholder for AI model loading"""
        logger.info("🤖 AI model loading not implemented yet")
        pass
