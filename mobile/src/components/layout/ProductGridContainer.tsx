/**
 * Premika 2.0 2-Column Product Grid Container Primitive
 * Standardizes 2-column fashion storefront grids with balanced gutters and touch targets.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface ProductGridContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  paddingHorizontal?: number;
  gutter?: number;
  testID?: string;
}

export const ProductGridContainer: React.FC<ProductGridContainerProps> = ({
  children,
  style,
  paddingHorizontal,
  gutter,
  testID,
}) => {
  const { spacing } = useTheme();

  const resolvedPadding = paddingHorizontal !== undefined ? paddingHorizontal : spacing.page;

  return (
    <View
      style={[
        styles.grid,
        {
          paddingHorizontal: resolvedPadding,
        },
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
