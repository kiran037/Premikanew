/**
 * Premika Liquid Glass Card Component
 * Interactive glass card primitive with press animation & shadow depth
 */

import React from 'react';
import { Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { GlassSurface } from './GlassSurface';
import { useTheme } from '@/hooks/useTheme';

export interface GlassCardProps {
  children?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  interactive?: boolean;
  accessible?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  onPress,
  style,
  padding,
  interactive = true,
  accessible = true,
  accessibilityLabel,
  testID,
}) => {
  const { spacing } = useTheme();
  const scale = useSharedValue(1);

  const cardPadding = padding !== undefined ? padding : spacing.lg;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress && interactive) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (onPress && interactive) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  if (!onPress) {
    return (
      <GlassSurface
        variant="card"
        style={[{ padding: cardPadding }, style]}
        accessible={accessible}
        testID={testID}
      >
        {children}
      </GlassSurface>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle]}
      accessible={accessible}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <GlassSurface variant="card" style={[{ padding: cardPadding }, style]}>
        {children}
      </GlassSurface>
    </AnimatedPressable>
  );
};
