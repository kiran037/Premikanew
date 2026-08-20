/**
 * Premika Material & iOS Card Component
 * Supports standard surface cards, elevated cards, grouped table items & outline variants.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface CardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: 'none' | 'subtle' | 'card' | 'medium' | 'floating';
  variant?: 'elevated' | 'plain' | 'grouped' | 'outline';
  showBorder?: boolean;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 'subtle',
  variant = 'elevated',
  showBorder,
  padding,
}) => {
  const { colors, radius, spacing, shadows } = useTheme();

  const cardPadding = padding !== undefined ? padding : spacing.card;
  const shouldShowBorder = showBorder !== undefined ? showBorder : (variant === 'outline' || variant === 'elevated');

  const getElevationStyle = () => {
    if (variant === 'plain' || variant === 'grouped') return shadows.none;
    return shadows[elevation] || shadows.subtle;
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.card,
          borderColor: colors.border,
          borderWidth: shouldShowBorder ? 1 : 0,
          padding: cardPadding,
        },
        getElevationStyle(),
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
});
