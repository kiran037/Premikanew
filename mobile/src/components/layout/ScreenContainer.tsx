/**
 * Premika 2.0 Screen Container Primitive
 * Provides standard background hierarchy, safe-area insets, and scroll or static containers.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';

export interface ScreenContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  applyBottomTabBarInset?: boolean;
  backgroundColor?: string;
  testID?: string;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  edges = [],
  applyBottomTabBarInset = false,
  backgroundColor,
  testID,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();

  const containerPadding: ViewStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom')
      ? insets.bottom + (applyBottomTabBarInset ? spacing.tabBarHeight : 0)
      : applyBottomTabBarInset
      ? spacing.tabBarHeight + insets.bottom
      : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: backgroundColor || colors.background },
        containerPadding,
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
