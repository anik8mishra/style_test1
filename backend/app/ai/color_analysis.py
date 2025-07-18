# app/ai/color_analysis.py
import numpy as np
from typing import List, Dict, Tuple
import colorsys
import logging

logger = logging.getLogger(__name__)

class ColorAnalyzer:
    """Advanced color analysis and matching system for fashion"""
    
    def __init__(self):
        self.color_wheel = {
            'red': (0, 100, 100),
            'orange': (30, 100, 100),
            'yellow': (60, 100, 100),
            'green': (120, 100, 100),
            'blue': (240, 100, 100),
            'purple': (270, 100, 100),
            'pink': (330, 100, 100),
            'brown': (30, 100, 30),
            'black': (0, 0, 0),
            'white': (0, 0, 100),
            'gray': (0, 0, 50),
            'navy': (240, 100, 25),
            'beige': (30, 30, 80)
        }
        
        self.seasonal_palettes = {
            'spring': ['coral', 'yellow', 'green', 'pink', 'light_blue'],
            'summer': ['blue', 'purple', 'gray', 'white', 'soft_pink'],
            'autumn': ['orange', 'brown', 'gold', 'deep_red', 'olive'],
            'winter': ['black', 'white', 'red', 'navy', 'silver']
        }
        
        self.color_harmony_rules = {
            'complementary': self._complementary_colors,
            'analogous': self._analogous_colors,
            'triadic': self._triadic_colors,
            'monochromatic': self._monochromatic_colors
        }
    
    def analyze_color_palette(self, clothing_items: List[Dict]) -> Dict:
        """
        Analyze color palette of clothing items
        
        Args:
            clothing_items: List of clothing items with color information
            
        Returns:
            Color analysis results
        """
        try:
            # Extract colors from items
            colors = []
            for item in clothing_items:
                item_colors = item.get('metadata', {}).get('dominant_colors', [])
                colors.extend(item_colors)
            
            if not colors:
                return self._get_default_analysis()
            
            # Analyze color harmony
            harmony_score = self._calculate_color_harmony(colors)
            
            # Determine color scheme
            color_scheme = self._identify_color_scheme(colors)
            
            # Calculate color temperature
            temperature = self._calculate_color_temperature(colors)
            
            # Assess seasonal appropriateness
            seasonal_match = self._assess_seasonal_appropriateness(colors)
            
            return {
                'dominant_colors': list(set(colors)),
                'color_harmony_score': harmony_score,
                'color_scheme': color_scheme,
                'temperature': temperature,
                'seasonal_match': seasonal_match,
                'recommendations': self._generate_color_recommendations(colors)
            }
            
        except Exception as e:
            logger.error(f"Color analysis failed: {e}")
            return self._get_default_analysis()
    
    def find_matching_colors(self, base_color: str, harmony_type: str = 'complementary') -> List[str]:
        """
        Find colors that match with a base color
        
        Args:
            base_color: Base color to find matches for
            harmony_type: Type of color harmony (complementary, analogous, etc.)
            
        Returns:
            List of matching colors
        """
        if base_color not in self.color_wheel:
            return []
        
        if harmony_type in self.color_harmony_rules:
            return self.color_harmony_rules[harmony_type](base_color)
        
        return []
    
    def _complementary_colors(self, base_color: str) -> List[str]:
        """Find complementary colors"""
        base_hue = self.color_wheel[base_color][0]
        complement_hue = (base_hue + 180) % 360
        
        # Find closest color names
        matching_colors = []
        for color_name, (hue, sat, val) in self.color_wheel.items():
            if abs(hue - complement_hue) < 30:
                matching_colors.append(color_name)
        
        return matching_colors
    
    def _analogous_colors(self, base_color: str) -> List[str]:
        """Find analogous colors"""
        base_hue = self.color_wheel[base_color][0]
        
        matching_colors = []
        for color_name, (hue, sat, val) in self.color_wheel.items():
            if abs(hue - base_hue) < 60 and color_name != base_color:
                matching_colors.append(color_name)
        
        return matching_colors
    
    def _triadic_colors(self, base_color: str) -> List[str]:
        """Find triadic colors"""
        base_hue = self.color_wheel[base_color][0]
        triadic_hues = [(base_hue + 120) % 360, (base_hue + 240) % 360]
        
        matching_colors = []
        for color_name, (hue, sat, val) in self.color_wheel.items():
            if any(abs(hue - t_hue) < 30 for t_hue in triadic_hues):
                matching_colors.append(color_name)
        
        return matching_colors
    
    def _monochromatic_colors(self, base_color: str) -> List[str]:
        """Find monochromatic colors"""
        base_hue = self.color_wheel[base_color][0]
        
        matching_colors = []
        for color_name, (hue, sat, val) in self.color_wheel.items():
            if abs(hue - base_hue) < 15:
                matching_colors.append(color_name)
        
        return matching_colors
    
    def _calculate_color_harmony(self, colors: List[str]) -> float:
        """Calculate color harmony score"""
        if len(colors) < 2:
            return 1.0
        
        harmony_score = 0.0
        comparisons = 0
        
        for i in range(len(colors)):
            for j in range(i + 1, len(colors)):
                if colors[i] in self.color_wheel and colors[j] in self.color_wheel:
                    score = self._calculate_color_pair_harmony(colors[i], colors[j])
                    harmony_score += score
                    comparisons += 1
        
        return harmony_score / comparisons if comparisons > 0 else 0.0
    
    def _calculate_color_pair_harmony(self, color1: str, color2: str) -> float:
        """Calculate harmony between two colors"""
        hue1 = self.color_wheel[color1][0]
        hue2 = self.color_wheel[color2][0]
        
        hue_diff = abs(hue1 - hue2)
        if hue_diff > 180:
            hue_diff = 360 - hue_diff
        
        # Complementary colors (180°) and analogous colors (30°) score higher
        if abs(hue_diff - 180) < 30:
            return 0.9  # Complementary
        elif hue_diff < 30:
            return 0.8  # Analogous
        elif abs(hue_diff - 120) < 30:
            return 0.7  # Triadic
        else:
            return 0.5  # Neutral
    
    def _identify_color_scheme(self, colors: List[str]) -> str:
        """Identify the color scheme of the outfit"""
        if len(colors) < 2:
            return 'monochromatic'
        
        # Check for specific schemes
        unique_colors = list(set(colors))
        
        if len(unique_colors) == 1:
            return 'monochromatic'
        elif len(unique_colors) == 2:
            return 'complementary'
        elif len(unique_colors) == 3:
            return 'triadic'
        else:
            return 'complex'
    
    def _calculate_color_temperature(self, colors: List[str]) -> str:
        """Calculate overall color temperature"""
        warm_colors = ['red', 'orange', 'yellow', 'pink', 'brown']
        cool_colors = ['blue', 'green', 'purple', 'gray']
        
        warm_count = sum(1 for color in colors if color in warm_colors)
        cool_count = sum(1 for color in colors if color in cool_colors)
        
        if warm_count > cool_count:
            return 'warm'
        elif cool_count > warm_count:
            return 'cool'
        else:
            return 'neutral'
    
    def _assess_seasonal_appropriateness(self, colors: List[str]) -> Dict:
        """Assess which seasons the color palette suits"""
        seasonal_scores = {}
        
        for season, palette in self.seasonal_palettes.items():
            score = 0
            for color in colors:
                if color in palette:
                    score += 1
            seasonal_scores[season] = score / len(colors) if colors else 0
        
        best_season = max(seasonal_scores, key=seasonal_scores.get)
        return {
            'best_season': best_season,
            'season_scores': seasonal_scores
        }
    
    def _generate_color_recommendations(self, colors: List[str]) -> List[str]:
        """Generate color recommendations for the outfit"""
        recommendations = []
        
        for color in colors:
            if color in self.color_wheel:
                # Find complementary colors
                complements = self.find_matching_colors(color, 'complementary')
                recommendations.extend(complements)
        
        return list(set(recommendations))
    
    def _get_default_analysis(self) -> Dict:
        """Return default color analysis"""
        return {
            'dominant_colors': ['gray'],
            'color_harmony_score': 0.5,
            'color_scheme': 'neutral',
            'temperature': 'neutral',
            'seasonal_match': {'best_season': 'all', 'season_scores': {}},
            'recommendations': []
        }
