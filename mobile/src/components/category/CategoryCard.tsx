/**
 * Premika 2.0 Editorial Category Visual Card Component
 * Minimalist fashion category card with tactile spring touch, soft continuous corners, and readable label.
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Category } from '@/api/types';
import { useTheme } from '@/hooks/useTheme';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { SPRING, PRESS_SCALE } from '@/theme/motion';
import { haptic } from '@/utils/haptics';

export interface CategoryCardProps {
  category: Category;
  style?: StyleProp<ViewStyle>;
  variant?: 'horizontal' | 'grid';
  width?: number | string;
  height?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CategoryCard: React.FC<CategoryCardProps> = memo(({
  category,
  style,
  variant = 'horizontal',
  width,
  height,
}) => {
  const router = useRouter();
  const { typography, radius, spacing, colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isGrid = variant === 'grid';
  const cardWidth = width !== undefined ? width : isGrid ? '100%' : 124;
  const cardHeight = height !== undefined ? height : isGrid ? 160 : 136;

  const handlePress = () => {
    haptic.selection();
    router.push(`/category/${category.slug}` as any);
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => (scale.value = withSpring(PRESS_SCALE.card, SPRING.snappy))}
      onPressOut={() => (scale.value = withSpring(1, SPRING.standard))}
      style={[
        styles.card,
        {
          width: cardWidth as any,
          height: cardHeight,
          borderRadius: radius.card,
          backgroundColor: colors.surfaceElevated,
        },
        animatedStyle,
        style,
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Category ${category.name}`}
    >
      <OptimizedImage
        source={category.image}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* Subtle Bottom Scrim for Title Legibility */}
      <View style={styles.scrimOverlay} />

      {/* Category Name Label */}
      <View style={[styles.titleContainer, { padding: spacing.sm }]}>
        <Text style={[typography.labelLarge, styles.categoryTitle]} numberOfLines={1}>
          {category.name}
        </Text>
      </View>
    </AnimatedPressable>
  );
});

CategoryCard.displayName = 'CategoryCard';

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  scrimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 14, 14, 0.38)',
  },
  titleContainer: {
    width: '100%',
    backgroundColor: 'rgba(18, 12, 12, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
