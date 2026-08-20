/**
 * Premika 2.0 Editorial Fashion Product Card Component
 * Image-first luxury catalog card with tactile spring compression, glass wishlist action, and V2 typography.
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { Product } from '@/api/types';
import { useTheme } from '@/hooks/useTheme';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { formatPrice, calculateDiscountPercentage, truncateText } from '@/utils/formatters';
import { useWishlistStore } from '@/store/wishlist-store';
import { SPRING, PRESS_SCALE } from '@/theme/motion';
import { haptic } from '@/utils/haptics';

export interface ProductCardProps {
  product: Product;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  aspectRatio?: number;
  width?: number | string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ProductCard: React.FC<ProductCardProps> = memo(({
  product,
  style,
  onPress,
  aspectRatio = 0.78,
  width = '100%',
}) => {
  const router = useRouter();
  const { colors, typography, radius, spacing } = useTheme();

  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const scale = useSharedValue(1);

  const discountPercent = calculateDiscountPercentage(product.price, product.originalPrice);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleCardPress = () => {
    haptic.light();
    if (onPress) {
      onPress();
    } else {
      router.push(`/product/${product.slug || product.id}` as any);
    }
  };

  const handleWishlistToggle = (e: any) => {
    e.stopPropagation();
    haptic.selection();
    toggleWishlist(product);
  };

  const primaryImage = product.images && product.images.length > 0 ? product.images[0] : '';
  const isOutOfStock = !product.inStock;

  return (
    <AnimatedPressable
      onPress={handleCardPress}
      onPressIn={() => (scale.value = withSpring(PRESS_SCALE.card, SPRING.snappy))}
      onPressOut={() => (scale.value = withSpring(1, SPRING.standard))}
      style={[styles.card, { width: width as any }, animatedStyle, style]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatPrice(product.price)}${isOutOfStock ? ', out of stock' : ''}`}
    >
      {/* Product Image Area */}
      <View
        style={[
          styles.imageWrapper,
          {
            borderRadius: radius.productImage,
            backgroundColor: colors.surfaceElevated,
            aspectRatio,
          },
        ]}
      >
        <OptimizedImage
          source={primaryImage}
          aspectRatio={aspectRatio}
          resizeMode="cover"
          style={{
            borderRadius: radius.productImage,
            opacity: isOutOfStock ? 0.6 : 1,
          }}
        />

        {/* Discount Badge Overlay (Only when in-stock) */}
        {!isOutOfStock && discountPercent > 0 && (
          <View
            style={[
              styles.discountBadge,
              {
                backgroundColor: colors.brandPrimary,
                borderRadius: radius.badge,
              },
            ]}
          >
            <Text style={[typography.discountBadge, styles.discountText]}>
              {discountPercent}% OFF
            </Text>
          </View>
        )}

        {/* Out of Stock Pill Badge Overlay */}
        {isOutOfStock && (
          <View
            style={[
              styles.outOfStockPill,
              {
                backgroundColor: 'rgba(28, 25, 23, 0.85)',
                borderRadius: radius.sm,
              },
            ]}
          >
            <Text style={[typography.stockBadge, styles.outOfStockText]}>
              OUT OF STOCK
            </Text>
          </View>
        )}

        {/* Floating Heart Action Button */}
        <Pressable
          onPress={handleWishlistToggle}
          style={[
            styles.heartBtn,
            {
              backgroundColor: colors.glassBg,
              borderColor: colors.glassBorder,
            },
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={16}
            color={isWishlisted ? '#E02424' : colors.textPrimary}
            fill={isWishlisted ? '#E02424' : 'transparent'}
          />
        </Pressable>
      </View>

      {/* Editorial Content Details */}
      <View style={[styles.details, { marginTop: spacing.xs }]}>
        <Text
          style={[
            typography.productName,
            {
              color: isOutOfStock ? colors.textMuted : colors.textPrimary,
            },
          ]}
          numberOfLines={1}
        >
          {truncateText(product.name, 32)}
        </Text>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text
            style={[
              typography.priceMedium,
              {
                color: isOutOfStock ? colors.textMuted : colors.primary,
              },
            ]}
          >
            {formatPrice(product.price)}
          </Text>

          {product.originalPrice && product.originalPrice > product.price ? (
            <Text
              style={[
                typography.originalPrice,
                styles.originalPriceText,
                { color: colors.textMuted },
              ]}
            >
              {formatPrice(product.originalPrice)}
            </Text>
          ) : null}
        </View>
      </View>
    </AnimatedPressable>
  );
});

ProductCard.displayName = 'ProductCard';

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    zIndex: 2,
  },
  discountText: {
    color: '#FFFFFF',
  },
  outOfStockPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  outOfStockText: {
    color: '#FFFFFF',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  details: {
    paddingHorizontal: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  originalPriceText: {
    textDecorationLine: 'line-through',
  },
});
