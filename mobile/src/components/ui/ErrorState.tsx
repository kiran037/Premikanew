/**
 * Premika Standardized Error State Component
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  style,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing.xxl }, style]}>
      <Text style={[typography.titleLarge, { color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xs }]}>
        {title}
      </Text>
      <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl }]}>
        {message}
      </Text>
      {onRetry && (
        <Button title="Try Again" onPress={onRetry} variant="outline" size="md" />
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
});
