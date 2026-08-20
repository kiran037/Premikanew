/**
 * Premika Accessible Material & Glass Text Input Component
 */

import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'surface' | 'glass';
  containerStyle?: ViewStyle;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  variant = 'surface',
  containerStyle,
  style,
  onFocus,
  onBlur,
  placeholderTextColor,
  ...restProps
}) => {
  const { colors, typography, radius, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const isGlass = variant === 'glass';

  const getInputBoxStyle = (): ViewStyle => ({
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: isGlass ? colors.glassBg : colors.surface,
    borderWidth: isFocused ? 1.5 : 1,
    borderColor: error
      ? colors.borderFocus === colors.primary ? '#DC2626' : colors.primary
      : isFocused
      ? colors.borderFocus
      : isGlass
      ? colors.glassBorder
      : colors.border,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  });

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text style={[typography.labelMedium, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          {label}
        </Text>
      )}

      <View style={getInputBoxStyle()}>
        {leftIcon && <View style={[styles.icon, { marginRight: spacing.sm }]}>{leftIcon}</View>}

        <RNTextInput
          placeholderTextColor={placeholderTextColor || colors.textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            typography.bodyMedium,
            { flex: 1, color: colors.textPrimary, paddingVertical: spacing.sm },
            style,
          ]}
          {...restProps}
        />

        {rightIcon && <View style={[styles.icon, { marginLeft: spacing.sm }]}>{rightIcon}</View>}
      </View>

      {error ? (
        <Text style={[typography.bodySmall, { color: '#DC2626', marginTop: spacing.xxs }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
