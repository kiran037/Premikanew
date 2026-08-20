/**
 * Premika 2.0 Category Discovery Rail Component
 * Horizontal scrolling category rail with partial next-card hint.
 */

import React, { memo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Category } from '@/api/types';
import { CategoryCard } from './CategoryCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTheme } from '@/hooks/useTheme';

export interface CategoryRailProps {
  categories: Category[];
  isLoading?: boolean;
  cardWidth?: number;
  cardHeight?: number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const CategoryRail: React.FC<CategoryRailProps> = memo(({
  categories,
  isLoading = false,
  cardWidth = 124,
  cardHeight = 136,
  style,
  contentContainerStyle,
}) => {
  const { spacing, radius } = useTheme();

  if (isLoading && categories.length === 0) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingHorizontal: spacing.page,
            gap: spacing.railItemGap,
          },
          contentContainerStyle,
        ]}
        style={style}
      >
        {[1, 2, 3, 4].map((key) => (
          <Skeleton
            key={key}
            width={cardWidth}
            height={cardHeight}
            borderRadius={radius.card}
          />
        ))}
      </ScrollView>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingHorizontal: spacing.page,
          gap: spacing.railItemGap,
        },
        contentContainerStyle,
      ]}
      style={style}
    >
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          variant="horizontal"
          width={cardWidth}
          height={cardHeight}
        />
      ))}
    </ScrollView>
  );
});

CategoryRail.displayName = 'CategoryRail';

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: 'flex-start',
  },
});
