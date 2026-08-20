/**
 * Premika Accessible Icon Button Component
 */

import React from 'react';
import { Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

export interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'surface' | 'glass' | 'ghost' | 'primary';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'md',
  variant = 'surface',
  disabled = false,
  style,
  accessibilityLabel,
  testID,
}) => {
  const { colors, radius, shadows } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dimension = size === 'sm' ? 44 : size === 'lg' ? 56 : 48;

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'glass':
        return {
          backgroundColor: colors.glassBg,
          borderWidth: 1,
          borderColor: colors.glassBorder,
        };
      case 'primary':
        return {
          backgroundColor: colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withSpring(0.92))}
      onPressOut={() => (scale.value = withSpring(1))}
      disabled={disabled}
      style={[
        styles.base,
        {
          width: dimension,
          height: dimension,
          borderRadius: radius.full,
          opacity: disabled ? 0.4 : 1,
        },
        getVariantStyle(),
        shadows.subtle,
        animatedStyle,
        style,
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {icon}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
