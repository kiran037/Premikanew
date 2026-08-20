/**
 * Premika Liquid Glass Surface Component
 * Cross-platform material component supporting iOS hardware blur & Android optimized translucent fallback
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Platform, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/useTheme';
import { GLASS_TOKENS, IS_NATIVE_BLUR_SUPPORTED } from '@/theme/glass';

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: keyof typeof GLASS_TOKENS.blurIntensity | number;
  variant?: 'surface' | 'card' | 'floating' | 'navigation';
  borderRadius?: number;
  showBorder?: boolean;
  accessible?: boolean;
  accessibilityRole?: string;
  testID?: string;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  style,
  intensity = 'regular',
  variant = 'surface',
  borderRadius,
  showBorder = true,
  accessible = true,
  accessibilityRole,
  testID,
}) => {
  const { isDark, colors, radius, shadows } = useTheme();

  const resolvedRadius = borderRadius !== undefined ? borderRadius : radius.lg;

  const numIntensity = typeof intensity === 'number'
    ? intensity
    : GLASS_TOKENS.blurIntensity[intensity] || 40;

  const glassTokens = isDark ? GLASS_TOKENS.dark : GLASS_TOKENS.light;

  const getVariantBg = () => {
    switch (variant) {
      case 'card':
        return glassTokens.cardBg;
      case 'floating':
        return glassTokens.floatingBg;
      case 'navigation':
        return glassTokens.navigationBg;
      default:
        return glassTokens.surfaceBg;
    }
  };

  const borderStyle: ViewStyle = showBorder ? {
    borderWidth: 1,
    borderColor: isDark ? glassTokens.borderSubtle : glassTokens.borderHighlight,
  } : {};

  if (IS_NATIVE_BLUR_SUPPORTED) {
    return (
      <View
        style={[
          styles.container,
          { borderRadius: resolvedRadius },
          resolvedRadius > 0 ? shadows.glass : null,
          borderStyle,
          style,
        ]}
        accessible={accessible}
        accessibilityRole={accessibilityRole as any}
        testID={testID}
      >
        <BlurView
          intensity={numIntensity}
          tint={isDark ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFill, { borderRadius: resolvedRadius }]}
        />
        <View style={[styles.contentOverlay, { backgroundColor: getVariantBg(), borderRadius: resolvedRadius }]}>
          {children}
        </View>
      </View>
    );
  }

  // Android Optimized Translucent Fallback Surface
  return (
    <View
      style={[
        styles.container,
        {
          borderRadius: resolvedRadius,
          backgroundColor: isDark ? GLASS_TOKENS.androidFallback.darkBg : GLASS_TOKENS.androidFallback.lightBg,
          borderColor: colors.border,
          borderWidth: showBorder ? 1 : 0,
        },
        resolvedRadius > 0 ? shadows.subtle : null,
        style,
      ]}
      accessible={accessible}
      accessibilityRole={accessibilityRole as any}
      testID={testID}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  contentOverlay: {
    width: '100%',
  },
});
