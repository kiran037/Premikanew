/**
 * Premika Semantic Material Surface Component
 * Hardware blur material wrapper for iOS and high-performance translucent fallback on Android.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/useTheme';
import { MATERIALS, MaterialVariant, IS_NATIVE_BLUR_SUPPORTED } from '@/theme/materials';

export interface MaterialSurfaceProps {
  children?: React.ReactNode;
  material?: MaterialVariant;
  intensity?: number;
  variant?: 'surface' | 'card' | 'floating' | 'navigation' | 'sheet';
  showBorder?: boolean;
  style?: StyleProp<ViewStyle>;
  accessible?: boolean;
  accessibilityRole?: string;
  testID?: string;
}

export const MaterialSurface: React.FC<MaterialSurfaceProps> = ({
  children,
  material = 'regular',
  intensity,
  variant = 'surface',
  showBorder = true,
  style,
  accessible = true,
  accessibilityRole,
  testID,
}) => {
  const { isDark, colors, radius, shadows, glass } = useTheme();

  const numIntensity = intensity !== undefined ? intensity : (MATERIALS[material] || MATERIALS.regular);
  const glassTokens = isDark ? glass.dark : glass.light;

  const getVariantBg = () => {
    switch (variant) {
      case 'card':
        return glassTokens.cardBg;
      case 'floating':
        return glassTokens.floatingBg;
      case 'navigation':
        return glassTokens.navigationBg;
      case 'sheet':
        return glassTokens.cardBg;
      default:
        return glassTokens.surfaceBg;
    }
  };

  const borderStyle: ViewStyle = showBorder ? {
    borderWidth: 1,
    borderColor: isDark ? glassTokens.borderSubtle : glassTokens.borderHighlight,
  } : {};

  if (IS_NATIVE_BLUR_SUPPORTED && numIntensity > 0) {
    return (
      <View
        style={[
          styles.container,
          { borderRadius: radius.lg },
          shadows.glass,
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
          style={[StyleSheet.absoluteFill, { borderRadius: radius.lg }]}
        />
        <View style={[styles.contentOverlay, { backgroundColor: getVariantBg(), borderRadius: radius.lg }]}>
          {children}
        </View>
      </View>
    );
  }

  // Android / Low-power Translucent Fallback
  return (
    <View
      style={[
        styles.container,
        {
          borderRadius: radius.lg,
          backgroundColor: isDark ? glass.androidFallback.darkBg : glass.androidFallback.lightBg,
          borderColor: colors.border,
          borderWidth: showBorder ? 1 : 0,
        },
        shadows.subtle,
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
