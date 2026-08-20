/**
 * Premika 2.0 Editorial Product Detail Screen
 * Edge-to-edge hero gallery, size/height chips, floating purchase bar, and related product discovery rails.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Truck, RefreshCw, ShieldCheck, Minus, Plus } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { Toast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { FloatingActionContainer } from '@/components/layout/FloatingActionContainer';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { ProductRail } from '@/components/product/ProductRail';
import { Product } from '@/api/types';
import { productsApi } from '@/api/products';
import { formatPrice, calculateDiscountPercentage } from '@/utils/formatters';
import { useCartStore } from '@/store/cart-store';
import { useRecentStore } from '@/store/recent-store';
import { useAuthStore } from '@/store/auth-store';
import { haptic } from '@/utils/haptics';

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { colors, typography, spacing, radius, media } = useTheme();

  const session = useAuthStore((state) => state.session);
  const token = session?.access_token;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedHeight, setSelectedHeight] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const addToCart = useCartStore((state) => state.addItem);
  const addRecentlyViewed = useRecentStore((state) => state.addRecentlyViewed);
  const recentlyViewed = useRecentStore((state) => state.recentlyViewed);

  const fetchDetail = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await productsApi.getProductBySlug(slug);
      if (!data) {
        setError('Product not found.');
        setIsLoading(false);
        return;
      }

      setProduct(data);
      addRecentlyViewed(data);

      // Pre-select default in-stock size & height
      if (data.sizes && data.sizes.length > 0) {
        const defaultSize = data.sizes.find((s) => s.inStock) || data.sizes[0];
        setSelectedSize(defaultSize.label);
      }

      if (data.heights && data.heights.length > 0) {
        const defaultH = data.heights.find((h) => h.default) || data.heights[0];
        setSelectedHeight(defaultH.label);
      }

      // Fetch related category items
      if (data.category) {
        const related = await productsApi.getProducts({ category: data.category, limit: 6 });
        setRelatedProducts(related.items.filter((p) => p.id !== data.id));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  }, [slug, addRecentlyViewed]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleImageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / windowWidth);
    if (slide !== activeImageIndex && slide >= 0 && slide < (product?.images?.length || 1)) {
      setActiveImageIndex(slide);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    haptic.medium();
    addToCart(product, selectedSize, selectedHeight, quantity, token);
    setToastMessage(`Added ${quantity} item(s) to Cart`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    haptic.medium();
    addToCart(product, selectedSize, selectedHeight, quantity, token);
    router.push('/(tabs)/cart');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={{ padding: spacing.page }}>
          <Skeleton
            height={windowWidth * 1.1}
            borderRadius={radius.card}
            style={{ marginBottom: spacing.md }}
          />
          <Skeleton
            height={28}
            width="75%"
            borderRadius={radius.xs}
            style={{ marginBottom: spacing.xs }}
          />
          <Skeleton
            height={32}
            width="40%"
            borderRadius={radius.xs}
            style={{ marginBottom: spacing.md }}
          />
          <Skeleton height={88} borderRadius={radius.card} />
        </ScrollView>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ErrorState message={error || 'Product not found'} onRetry={() => router.back()} />
        </View>
      </View>
    );
  }

  const discountPercent = calculateDiscountPercentage(product.price, product.originalPrice);
  const images = product.images && product.images.length > 0 ? product.images : [''];
  const otherRecentlyViewed = recentlyViewed.filter((p) => p.id !== product.id);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: spacing.bottomBarHeight + insets.bottom + 36,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Edge-to-Edge Hero Image Gallery Slider */}
        <View style={styles.galleryWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
          >
            {images.map((img, idx) => (
              <View
                key={idx}
                style={{
                  width: windowWidth,
                  height: windowWidth * (media.heroPortrait || 1.1),
                }}
              >
                <OptimizedImage
                  source={img}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>

          {/* Discount Tag Overlay */}
          {discountPercent > 0 && (
            <View
              style={[
                styles.galleryDiscountTag,
                {
                  backgroundColor: colors.brandPrimary,
                  borderRadius: radius.badge,
                },
              ]}
            >
              <Text style={[typography.discountBadge, { color: '#FFFFFF' }]}>
                {discountPercent}% OFF
              </Text>
            </View>
          )}

          {/* Gallery Pagination Dots */}
          {images.length > 1 && (
            <View style={styles.galleryDotsPill}>
              {images.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: idx === activeImageIndex ? colors.primary : '#FFFFFF',
                      width: idx === activeImageIndex ? 16 : 6,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* 2. Product Meta Section */}
        <View style={[styles.infoSection, { padding: spacing.page }]}>
          <Text style={[typography.productNameDetail, { color: colors.textPrimary }]}>
            {product.name}
          </Text>

          {/* Price & Stock Status Row */}
          <View style={[styles.priceBlock, { marginTop: spacing.sm, marginBottom: spacing.md }]}>
            <Text style={[typography.priceLarge, { color: colors.primary }]}>
              {formatPrice(product.price)}
            </Text>

            {product.originalPrice && product.originalPrice > product.price ? (
              <Text style={[typography.originalPrice, styles.originalPriceText, { color: colors.textMuted }]}>
                {formatPrice(product.originalPrice)}
              </Text>
            ) : null}

            <Badge
              content={product.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
              variant={product.inStock ? 'success' : 'error'}
              size="sm"
            />
          </View>

          {/* Short Narrative Description */}
          {product.shortDescription ? (
            <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
              {product.shortDescription}
            </Text>
          ) : null}

          {/* 3. Size Variant Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <View style={styles.selectorSection}>
              <Text style={[typography.labelLarge, { color: colors.textPrimary, marginBottom: spacing.xs }]}>
                Select Size: <Text style={{ color: colors.primary, fontWeight: '700' }}>{selectedSize}</Text>
              </Text>

              <View style={styles.chipRow}>
                {product.sizes.map((s) => (
                  <Chip
                    key={s.label}
                    label={s.label}
                    selected={selectedSize === s.label}
                    disabled={!s.inStock}
                    onPress={() => setSelectedSize(s.label)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* 4. Height Option Selector (If Available) */}
          {product.heights && product.heights.length > 0 && (
            <View style={[styles.selectorSection, { marginTop: spacing.md }]}>
              <Text style={[typography.labelLarge, { color: colors.textPrimary, marginBottom: spacing.xs }]}>
                Select Height: <Text style={{ color: colors.primary, fontWeight: '700' }}>{selectedHeight}</Text>
              </Text>

              <View style={styles.chipRow}>
                {product.heights.map((h) => (
                  <Chip
                    key={h.label}
                    label={h.label}
                    selected={selectedHeight === h.label}
                    onPress={() => setSelectedHeight(h.label)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* 5. Quantity Stepper */}
          <View style={[styles.quantitySection, { marginTop: spacing.lg }]}>
            <Text style={[typography.labelLarge, { color: colors.textPrimary }]}>Quantity</Text>

            <View
              style={[
                styles.counterBox,
                {
                  borderColor: colors.borderSubtle,
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: radius.button,
                },
              ]}
            >
              <Pressable
                onPress={() => {
                  haptic.light();
                  setQuantity((q) => Math.max(1, q - 1));
                }}
                style={styles.counterBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Decrease quantity"
              >
                <Minus size={16} color={colors.textPrimary} />
              </Pressable>

              <Text style={[typography.titleMedium, { color: colors.textPrimary, paddingHorizontal: spacing.md }]}>
                {quantity}
              </Text>

              <Pressable
                onPress={() => {
                  haptic.light();
                  setQuantity((q) => q + 1);
                }}
                style={styles.counterBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Increase quantity"
              >
                <Plus size={16} color={colors.textPrimary} />
              </Pressable>
            </View>
          </View>

          {/* 6. Trust & Confidence Assurances */}
          <View
            style={[
              styles.trustBadges,
              {
                borderTopColor: colors.borderSubtle,
                borderBottomColor: colors.borderSubtle,
                marginTop: spacing.xl,
                paddingVertical: spacing.md,
              },
            ]}
          >
            <View style={styles.trustItem}>
              <Truck size={20} color={colors.primary} />
              <Text style={[typography.labelSmall, { color: colors.textSecondary, marginTop: 4 }]}>
                Free Delivery
              </Text>
            </View>
            <View style={styles.trustItem}>
              <RefreshCw size={20} color={colors.primary} />
              <Text style={[typography.labelSmall, { color: colors.textSecondary, marginTop: 4 }]}>
                7-Day Easy Return
              </Text>
            </View>
            <View style={styles.trustItem}>
              <ShieldCheck size={20} color={colors.primary} />
              <Text style={[typography.labelSmall, { color: colors.textSecondary, marginTop: 4 }]}>
                100% Authentic
              </Text>
            </View>
          </View>

          {/* 7. Editorial Long Description */}
          {product.longDescription ? (
            <View style={[styles.descBox, { marginTop: spacing.lg }]}>
              <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.xs }]}>
                Product Details & Fabric
              </Text>
              <Text style={[typography.productDescription, { color: colors.textSecondary }]}>
                {product.longDescription}
              </Text>
            </View>
          ) : null}
        </View>

        {/* 8. Related Products Rail */}
        {relatedProducts.length > 0 && (
          <Section marginTop={spacing.lg}>
            <SectionHeader
              title="You May Also Like"
              subtitle="Coordinated artisan styles"
              actionTitle="View Category"
              onAction={() => router.push(`/category/${product.category}` as any)}
            />
            <ProductRail products={relatedProducts} cardWidth={160} />
          </Section>
        )}

        {/* 9. Recently Viewed Rail */}
        {otherRecentlyViewed.length > 0 && (
          <Section marginTop={spacing.lg}>
            <SectionHeader
              title="Recently Viewed"
              subtitle="Explore your browsing history"
            />
            <ProductRail products={otherRecentlyViewed} cardWidth={140} />
          </Section>
        )}
      </ScrollView>

      {/* Floating Liquid Glass Bottom Purchase Bar */}
      <FloatingActionContainer>
        <View style={styles.bottomBarContent}>
          <View style={styles.totalPriceBlock}>
            <Text style={[typography.caption1, { color: colors.textSecondary }]}>Total Price</Text>
            <Text style={[typography.priceMedium, { color: colors.primary }]}>
              {formatPrice(product.price * quantity)}
            </Text>
          </View>

          <View style={styles.ctaGroup}>
            <Button
              title={product.inStock ? "Add to Cart" : "Out of Stock"}
              onPress={handleAddToCart}
              variant="outline"
              size="md"
              disabled={!product.inStock}
              style={{ flex: 1 }}
            />
            <Button
              title={product.inStock ? "Buy Now" : "Out of Stock"}
              onPress={handleBuyNow}
              variant="primary"
              size="md"
              disabled={!product.inStock}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </FloatingActionContainer>

      {/* Notification Toast */}
      <Toast message={toastMessage || ''} visible={!!toastMessage} type="success" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryWrapper: {
    position: 'relative',
    width: '100%',
  },
  galleryDiscountTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
  },
  galleryDotsPill: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  infoSection: {
    width: '100%',
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  originalPriceText: {
    textDecorationLine: 'line-through',
  },
  selectorSection: {},
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  counterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  trustItem: {
    alignItems: 'center',
    flex: 1,
  },
  descBox: {
    width: '100%',
  },
  bottomBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalPriceBlock: {
    marginRight: 14,
  },
  ctaGroup: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
});
