/**
 * Premika Standardized Empty State Component
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionTitle,
  onAction,
  style,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing.xxl }, style]}>
      {icon && <View style={[styles.iconWrapper, { marginBottom: spacing.lg }]}>{icon}</View>}

      <Text style={[typography.titleLarge, { color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xs }]}>
        {title}
      </Text>

      {description && (
        <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl }]}>
          {description}
        </Text>
      )}

      {actionTitle && onAction && (
        <Button title={actionTitle} onPress={onAction} variant="primary" size="md" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
