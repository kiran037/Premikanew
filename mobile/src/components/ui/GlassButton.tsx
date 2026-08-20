/**
 * Premika Apple Liquid Glass Button Component
 * Interactive glass button control with hardware BlurView, border reflection, and spring touch feedback
 */

import React from 'react';
import { Text, StyleSheet, Pressable, ViewStyle, TextStyle, StyleProp, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/useTheme';
import { haptic } from '@/utils/haptics';

export interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'glass' | 'prominentGlass' | 'lightGlass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'glass',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  accessibilityLabel,
  testID,
}) => {
  const { isDark, colors, typography, radius, spacing } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  const handlePress = () => {
    if (disabled || loading) return;
    haptic.medium();
    onPress();
  };

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const height = isSmall ? 38 : isLarge ? 54 : 46;
  const paddingHorizontal = isSmall ? spacing.md : isLarge ? spacing.xl : spacing.lg;

  const getOverlayBg = () => {
    if (variant === 'prominentGlass') {
      return isDark ? 'rgba(224, 107, 104, 0.30)' : 'rgba(120, 32, 30, 0.20)';
    }
    return isDark ? 'rgba(50, 37, 37, 0.55)' : 'rgba(255, 255, 255, 0.65)';
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.container,
        {
          height,
          paddingHorizontal,
          borderRadius: radius.md,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.85)',
          borderWidth: 1,
          opacity: disabled ? 0.5 : 1,
        },
        animatedStyle,
        style,
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      accessibilityLabel={accessibilityLabel || title}
      testID={testID}
    >
      <BlurView
        intensity={60}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.contentRow, { backgroundColor: getOverlayBg() }]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <Text
          style={[
            typography.labelLarge,
            { color: variant === 'prominentGlass' ? colors.primary : colors.textPrimary },
            textStyle,
          ]}
        >
          {title}
        </Text>
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
