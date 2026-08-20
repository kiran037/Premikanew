/**
 * Premika 2.0 Badge / Indicator Component
 * Supports primary, secondary, error, success, sale, and discount badges.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface BadgeProps {
  content?: string | number;
  variant?: 'primary' | 'secondary' | 'error' | 'success' | 'sale' | 'discount' | 'newArrival';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  content,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  const { colors, typography, radius, spacing } = useTheme();

  const getBgColor = () => {
    switch (variant) {
      case 'secondary':
        return colors.secondary;
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      case 'sale':
      case 'discount':
        return colors.sale;
      case 'newArrival':
        return colors.newArrival;
      default:
        return colors.primary;
    }
  };

  const isSmall = size === 'sm';
  const minDimension = isSmall ? 16 : 22;

  return (
    <View
      style={[
        styles.badge,
        {
          minWidth: minDimension,
          height: minDimension,
          borderRadius: radius.badge,
          backgroundColor: getBgColor(),
          paddingHorizontal: content ? spacing.xs : 0,
        },
        style,
      ]}
    >
      {content !== undefined && (
        <Text style={[isSmall ? typography.labelSmall : typography.badge, { color: '#FFFFFF', textAlign: 'center' }]}>
          {content}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
