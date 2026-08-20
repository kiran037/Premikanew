/**
 * Premika 2.0 Floating Action Bar Container Primitive
 * Bottom-anchored Liquid Glass action surface for commerce CTAs (Add to Cart, Buy Now, Checkout).
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { GlassSurface } from '@/components/glass/GlassSurface';

export interface FloatingActionContainerProps {
  children: React.ReactNode;
  variant?: 'docked' | 'floating';
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  paddingHorizontal?: number;
  testID?: string;
}

export const FloatingActionContainer: React.FC<FloatingActionContainerProps> = ({
  children,
  variant = 'docked',
  style,
  contentStyle,
  paddingHorizontal,
  testID,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius, shadows } = useTheme();

  const isDocked = variant === 'docked';
  const containerHeight = isDocked
    ? spacing.bottomBarHeight + insets.bottom
    : spacing.bottomBarHeight;
  const resolvedPadding = paddingHorizontal !== undefined ? paddingHorizontal : spacing.page;

  if (isDocked) {
    return (
      <View
        style={[
          styles.dockedContainer,
          {
            height: containerHeight,
            paddingBottom: insets.bottom,
            backgroundColor: colors.surfaceTranslucent,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.borderSubtle,
          },
          style,
        ]}
        testID={testID}
      >
        <View style={[styles.content, { paddingHorizontal: resolvedPadding }, contentStyle]}>
          {children}
        </View>
      </View>
    );
  }

  // Floating Island Variant
  return (
    <GlassSurface
      variant="floating"
      borderRadius={radius.floating}
      showBorder={true}
      style={[
        styles.floatingContainer,
        {
          bottom: insets.bottom + 12,
          left: spacing.page,
          right: spacing.page,
          height: containerHeight,
          borderRadius: radius.floating,
          ...shadows.floating,
        },
        style,
      ]}
      testID={testID}
    >
      <View style={[styles.content, { paddingHorizontal: resolvedPadding }, contentStyle]}>
        {children}
      </View>
    </GlassSurface>
  );
};

const styles = StyleSheet.create({
  dockedContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    justifyContent: 'center',
    zIndex: 10,
  },
  floatingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
