/**
 * Premika 2.0 Tag & Filter Chip Component
 * Supports neutral, selected, outline, and disabled states with tactile spring response.
 */

import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { haptic } from '@/utils/haptics';
import { SPRING, PRESS_SCALE } from '@/theme/motion';

export interface ChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  variant?: 'filled' | 'outline';
  style?: ViewStyle;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  disabled = false,
  onPress,
  icon,
  variant = 'filled',
  style,
  testID,
}) => {
  const { colors, typography, radius, spacing } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(PRESS_SCALE.chip, SPRING.snappy);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, SPRING.snappy);
    }
  };

  const handlePress = () => {
    if (disabled) return;
    haptic.selection();
    if (onPress) onPress();
  };

  const isOutline = variant === 'outline';

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.chip,
        {
          borderRadius: radius.chip,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          backgroundColor: selected
            ? colors.primary
            : isOutline
            ? 'transparent'
            : colors.surfaceElevated,
          borderWidth: 1,
          borderColor: selected ? colors.primary : colors.border,
          opacity: disabled ? 0.4 : 1,
        },
        animatedStyle,
        style,
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      testID={testID}
    >
      {icon && <Pressable style={styles.icon}>{icon}</Pressable>}
      <Text
        style={[
          selected ? typography.chipSelected : typography.chip,
          {
            color: selected ? colors.primaryForeground : colors.textPrimary,
            textDecorationLine: disabled ? 'line-through' : 'none',
          },
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
  },
  icon: {
    marginRight: 6,
  },
});
