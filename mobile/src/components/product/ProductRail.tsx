/**
 * Premika 2.0 Product Discovery Rail Component
 * Horizontal scrolling lookbook rail with partial next-card affordance and native momentum.
 */

import React, { memo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Product } from '@/api/types';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTheme } from '@/hooks/useTheme';

export interface ProductRailProps {
  products: Product[];
  isLoading?: boolean;
  cardWidth?: number;
  aspectRatio?: number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const ProductRail: React.FC<ProductRailProps> = memo(({
  products,
  isLoading = false,
  cardWidth,
  aspectRatio = 0.78,
  style,
  contentContainerStyle,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const { spacing, radius } = useTheme();

  // 44% of screen width guarantees the next card is partially visible
  const computedCardWidth = cardWidth || Math.min(Math.round(screenWidth * 0.44), 180);
  const cardImageHeight = Math.round(computedCardWidth / aspectRatio);

  if (isLoading && products.length === 0) {
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
          <View key={key} style={{ width: computedCardWidth }}>
            <Skeleton
              width={computedCardWidth}
              height={cardImageHeight}
              borderRadius={radius.productImage}
              style={{ marginBottom: spacing.xs }}
            />
            <Skeleton
              width="85%"
              height={14}
              borderRadius={radius.xs}
              style={{ marginBottom: 4 }}
            />
            <Skeleton width="45%" height={16} borderRadius={radius.xs} />
          </View>
        ))}
      </ScrollView>
    );
  }

  if (products.length === 0) {
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
      {products.map((product) => (
        <View key={product.id} style={{ width: computedCardWidth }}>
          <ProductCard
            product={product}
            aspectRatio={aspectRatio}
            width={computedCardWidth}
          />
        </View>
      ))}
    </ScrollView>
  );
});

ProductRail.displayName = 'ProductRail';

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: 'flex-start',
  },
});
