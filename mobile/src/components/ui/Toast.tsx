/**
 * Premika Snackbar / Toast Notification Component
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  visible?: boolean;
  style?: ViewStyle;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible = true,
  style,
}) => {
  const { colors, typography, radius, spacing, shadows } = useTheme();

  if (!visible) return null;

  const getTypeStyle = () => {
    switch (type) {
      case 'success':
        return { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' };
      case 'error':
        return { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' };
      case 'warning':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      default:
        return { bg: colors.surfaceElevated, text: colors.textPrimary, border: colors.border };
    }
  };

  const currentType = getTypeStyle();

  return (
    <View
      style={[
        styles.toast,
        {
          backgroundColor: currentType.bg,
          borderColor: currentType.border,
          borderRadius: radius.md,
          padding: spacing.md,
        },
        shadows.medium,
        style,
      ]}
    >
      <Text style={[typography.bodyMedium, { color: currentType.text }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    width: '90%',
    alignSelf: 'center',
    borderWidth: 1,
    position: 'absolute',
    bottom: 40,
    zIndex: 9999,
  },
});
