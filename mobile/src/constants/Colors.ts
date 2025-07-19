export const Colors = {
  primary: '#6366F1',      // Indigo
  primaryDark: '#4F46E5',  // Darker Indigo
  secondary: '#EC4899',    // Pink
  accent: '#F59E0B',       // Amber
  
  background: '#F8FAFC',   // Very light gray
  surface: '#FFFFFF',      // White
  surfaceAlt: '#F1F5F9',   // Light gray
  
  text: '#1E293B',         // Dark gray
  textSecondary: '#64748B', // Medium gray
  textMuted: '#94A3B8',    // Light gray
  
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Red
  info: '#3B82F6',         // Blue
  
  border: '#E2E8F0',       // Very light gray
  shadow: '#00000020',     // Black with opacity
  
  // Fashion-specific colors
  fashionPink: '#EC4899',
  fashionPurple: '#8B5CF6',
  fashionBlue: '#3B82F6',
  fashionGreen: '#10B981',
  fashionOrange: '#F97316',
};

export const GradientColors = {
  primary: [Colors.primary, Colors.primaryDark],
  fashion: [Colors.fashionPink, Colors.fashionPurple],
  sunset: [Colors.fashionOrange, Colors.secondary],
  ocean: [Colors.fashionBlue, Colors.primary],
};