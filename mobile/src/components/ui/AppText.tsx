/**
 * Premika Semantic AppText Component
 * Enforces Apple iOS typography hierarchy with built-in Dynamic Type accessibility support.
 */

import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { TypographyVariant, getScaledFontSize } from '@/theme/typography';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'error' | 'success' | 'inverse' | string;
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy';
  scaleFontSize?: boolean;
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color = 'primary',
  align = 'left',
  weight,
  scaleFontSize = false,
  style,
  children,
  allowFontScaling = true,
  ...restProps
}) => {
  const { colors, typography } = useTheme();

  const getTextColor = (): string => {
    switch (color) {
      case 'primary':
        return colors.textPrimary;
      case 'secondary':
        return colors.textSecondary;
      case 'muted':
        return colors.textMuted;
      case 'accent':
        return colors.primary;
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      case 'inverse':
        return colors.textInverse;
      default:
        return color;
    }
  };

  const baseStyle: TextStyle = typography[variant] || typography.body;
  const resolvedFontSize = scaleFontSize && baseStyle.fontSize ? getScaledFontSize(baseStyle.fontSize) : baseStyle.fontSize;

  const resolvedWeight: TextStyle['fontWeight'] = weight ? (
    weight === 'regular' ? '400' :
    weight === 'medium' ? '500' :
    weight === 'semibold' ? '600' :
    weight === 'bold' ? '700' : '800'
  ) : baseStyle.fontWeight;

  return (
    <Text
      allowFontScaling={allowFontScaling}
      style={[
        baseStyle,
        {
          color: getTextColor(),
          textAlign: align,
          fontSize: resolvedFontSize,
          fontWeight: resolvedWeight,
        },
        style,
      ]}
      {...restProps}
    >
      {children}
    </Text>
  );
};
