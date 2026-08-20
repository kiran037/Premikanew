/**
 * Premika 2.0 Material & Glass Button Primitive Component
 * Supports primary, secondary, outline, ghost, glass, and destructive variants
 * with calibrated spring feedback and accessible touch targets.
 */

import React from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { haptic } from '@/utils/haptics';
import { SPRING, PRESS_SCALE } from '@/theme/motion';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'destructive';
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

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
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
  const { colors, typography, radius, spacing } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(PRESS_SCALE.primaryButton, SPRING.snappy);
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, SPRING.snappy);
    }
  };

  const getContainerStyle = (): ViewStyle => {
    const isSmall = size === 'sm';
    const isLarge = size === 'lg';

    let height: number = 48; // Default medium touch target > 44pt
    let paddingHorizontal: number = spacing.lg;
    let buttonRadius: number = radius.button;

    if (isSmall) {
      height = 36;
      paddingHorizontal = spacing.md;
      buttonRadius = radius.buttonSmall;
    } else if (isLarge) {
      height = 56;
      paddingHorizontal = spacing.xl;
      buttonRadius = radius.button;
    }

    let bgStyle: ViewStyle = {
      backgroundColor: colors.primary,
    };

    if (variant === 'secondary') {
      bgStyle = { backgroundColor: colors.secondary };
    } else if (variant === 'outline') {
      bgStyle = {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary,
      };
    } else if (variant === 'ghost') {
      bgStyle = { backgroundColor: 'transparent' };
    } else if (variant === 'glass') {
      bgStyle = {
        backgroundColor: colors.glassBg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
      };
    } else if (variant === 'destructive') {
      bgStyle = { backgroundColor: colors.error };
    }

    if (disabled) {
      bgStyle.opacity = 0.5;
    }

    return {
      height,
      paddingHorizontal,
      borderRadius: buttonRadius,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      ...bgStyle,
    };
  };

  const getTextStyle = (): TextStyle => {
    let color: string = colors.primaryForeground;

    if (variant === 'outline' || variant === 'ghost') {
      color = colors.primary;
    } else if (variant === 'glass') {
      color = colors.textPrimary;
    } else if (variant === 'destructive') {
      color = '#FFFFFF';
    }

    let fontVariant = typography.buttonMedium;
    if (size === 'sm') fontVariant = typography.buttonSmall;
    if (size === 'lg') fontVariant = typography.buttonLarge;

    return {
      ...fontVariant,
      color,
      textAlign: 'center',
    };
  };

  const handlePress = () => {
    if (disabled || loading) return;
    if (variant === 'primary' || size === 'lg') {
      haptic.medium();
    } else {
      haptic.light();
    }
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[animatedStyle, getContainerStyle(), style]}
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      accessibilityLabel={accessibilityLabel || title}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.primaryForeground}
          size="small"
        />
      ) : (
        <>
          {leftIcon && <Animated.View style={styles.iconLeft}>{leftIcon}</Animated.View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {rightIcon && <Animated.View style={styles.iconRight}>{rightIcon}</Animated.View>}
        </>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
