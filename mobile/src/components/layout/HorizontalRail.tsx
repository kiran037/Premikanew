/**
 * Premika 2.0 Horizontal Rail Component
 * Smooth horizontal discovery carousel for categories, featured products, and lookbook modules.
 */

import React from 'react';
import { ScrollView, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface HorizontalRailProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  gap?: number;
  paddingHorizontal?: number;
  showsHorizontalScrollIndicator?: boolean;
  testID?: string;
}

export const HorizontalRail: React.FC<HorizontalRailProps> = ({
  children,
  style,
  contentContainerStyle,
  gap,
  paddingHorizontal,
  showsHorizontalScrollIndicator = false,
  testID,
}) => {
  const { spacing } = useTheme();

  const resolvedGap = gap !== undefined ? gap : spacing.railItemGap;
  const resolvedPadding = paddingHorizontal !== undefined ? paddingHorizontal : spacing.railPadding;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      contentContainerStyle={[
        {
          paddingHorizontal: resolvedPadding,
          gap: resolvedGap,
        },
        contentContainerStyle,
      ]}
      style={[styles.rail, style]}
      testID={testID}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  rail: {
    width: '100%',
  },
});
