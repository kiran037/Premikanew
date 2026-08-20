/**
 * Premika 2.0 Shopping Cart Screen
 * Editorial item cards, coupon code validation, quantity stepper, clear price breakdown & sticky checkout CTA.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Trash2, ShoppingBag, Tag, ArrowRight, Check, Minus, Plus } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { HeaderBar } from '@/components/common/HeaderBar';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Toast } from '@/components/ui/Toast';
import { formatPrice } from '@/utils/formatters';
import { useCartStore } from '@/store/cart-store';
import { couponsApi } from '@/api/coupons';
import { useAuthStore } from '@/store/auth-store';
import { haptic } from '@/utils/haptics';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing, radius } = useTheme();

  const session = useAuthStore((state) => state.session);
  const token = session?.access_token;

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const clearCart = useCartStore((state) => state.clearCart);

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const shippingFee = subtotal >= 500 || subtotal === 0 ? 0 : 70;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    haptic.light();
    try {
      const result = await couponsApi.validateCoupon(couponCode.trim(), subtotal);
      if (result.valid && result.discountAmount) {
        haptic.success();
        setDiscountAmount(result.discountAmount);
        setCouponApplied(true);
        setToastMessage(`Coupon "${couponCode.toUpperCase()}" applied! Saved ${formatPrice(result.discountAmount)}`);
      } else {
        haptic.error();
        setToastMessage(result.message || 'Invalid coupon code');
      }
    } catch {
      haptic.error();
      setToastMessage('Failed to validate coupon code');
    } finally {
      setCouponLoading(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleClearCart = () => {
    haptic.light();
    Alert.alert('Clear Shopping Cart', 'Are you sure you want to remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: () => {
          haptic.medium();
          clearCart(token);
        },
      },
    ]);
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <HeaderBar title="Shopping Cart" showBack={false} showMenu={true} showSearch={true} showWishlist={false} showCart={false} />
        <View style={styles.center}>
          <EmptyState
            title="Your Cart is Empty"
            description="Explore our atelier collections and add your favorite handcrafted styles to your shopping bag."
            icon={<ShoppingBag size={48} color={colors.primary} />}
            actionTitle="Discover New Arrivals"
            onAction={() => router.push('/(tabs)')}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar
        title="Shopping Cart"
        showBack={false}
        showMenu={true}
        showSearch={false}
        showWishlist={true}
        showCart={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              padding: spacing.page,
              paddingBottom: spacing.bottomBarHeight + insets.bottom + 36,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Cart Header Row */}
          <View style={styles.topRow}>
            <Text style={[typography.sectionHeader, { color: colors.textPrimary }]}>
              Items in Bag ({items.length})
            </Text>
            <Pressable
              onPress={handleClearCart}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear all items in cart"
            >
              <Text style={[typography.caption1, { color: colors.primary, fontWeight: '600' }]}>
                Clear All
              </Text>
            </Pressable>
          </View>

          {/* Cart Item Rows */}
          <View style={[styles.itemsList, { gap: spacing.md }]}>
            {items.map((item) => (
              <Card
                key={item.id}
                style={[
                  styles.cartCard,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.borderSubtle,
                    borderRadius: radius.card,
                  },
                ]}
              >
                <View style={styles.cartRow}>
                  <OptimizedImage
                    source={item.product.images?.[0]}
                    style={{
                      width: 80,
                      height: 102,
                      borderRadius: radius.productImage - 4,
                    }}
                  />

                  <View style={[styles.cartDetails, { marginLeft: spacing.md }]}>
                    <View style={styles.cartHeaderRow}>
                      <Text
                        style={[typography.productName, { color: colors.textPrimary, flex: 1 }]}
                        numberOfLines={1}
                      >
                        {item.product.name}
                      </Text>
                      <Pressable
                        onPress={() => {
                          haptic.light();
                          removeItem(item.id, token);
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={{ padding: 4 }}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${item.product.name} from cart`}
                      >
                        <Trash2 size={16} color="#DC2626" />
                      </Pressable>
                    </View>

                    {/* Variant & Size details */}
                    <Text style={[typography.caption1, { color: colors.textSecondary, marginTop: 2 }]}>
                      Size: {item.selectedSize || 'Standard'}
                      {item.selectedHeight ? ` | Height: ${item.selectedHeight}` : ''}
                    </Text>

                    <Text style={[typography.priceSmall, { color: colors.primary, marginTop: 4 }]}>
                      {formatPrice(item.product.price)}
                    </Text>

                    {/* Quantity Stepper & Line Total */}
                    <View style={styles.qtyRow}>
                      <View
                        style={[
                          styles.qtyBox,
                          {
                            borderColor: colors.borderSubtle,
                            backgroundColor: colors.surface,
                            borderRadius: radius.buttonSmall,
                          },
                        ]}
                      >
                        <Pressable
                          onPress={() => {
                            haptic.light();
                            updateQuantity(item.id, item.quantity - 1, token);
                          }}
                          style={styles.qtyBtn}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel="Decrease quantity"
                        >
                          <Minus size={14} color={colors.textPrimary} />
                        </Pressable>

                        <Text style={[typography.labelMedium, { color: colors.textPrimary, paddingHorizontal: 10 }]}>
                          {item.quantity}
                        </Text>

                        <Pressable
                          onPress={() => {
                            haptic.light();
                            updateQuantity(item.id, item.quantity + 1, token);
                          }}
                          style={styles.qtyBtn}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel="Increase quantity"
                        >
                          <Plus size={14} color={colors.textPrimary} />
                        </Pressable>
                      </View>

                      <Text style={[typography.labelLarge, { color: colors.textPrimary }]}>
                        {formatPrice(item.product.price * item.quantity)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>

          {/* Coupon Code Section */}
          <Card
            style={[
              styles.cardBox,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderSubtle,
                borderRadius: radius.card,
                marginTop: spacing.lg,
              },
            ]}
          >
            <View style={styles.couponHeader}>
              <Tag size={16} color={colors.primary} />
              <Text style={[typography.titleSmall, { color: colors.textPrimary, marginLeft: spacing.xs }]}>
                Apply Promo Coupon
              </Text>
            </View>

            <View style={[styles.couponInputRow, { marginTop: spacing.sm }]}>
              <View style={{ flex: 1 }}>
                <TextInput
                  value={couponCode}
                  onChangeText={setCouponCode}
                  placeholder="Enter promo coupon code"
                  autoCapitalize="characters"
                />
              </View>

              <Button
                title={couponApplied ? 'Applied' : 'Apply'}
                onPress={handleApplyCoupon}
                variant={couponApplied ? 'secondary' : 'primary'}
                size="md"
                loading={couponLoading}
                leftIcon={couponApplied ? <Check size={16} color="#FFFFFF" /> : undefined}
                style={{ marginLeft: spacing.sm }}
              />
            </View>

            {couponApplied && (
              <View style={[styles.couponSuccessBadge, { borderRadius: radius.xs }]}>
                <Check size={14} color="#15803D" />
                <Text style={styles.couponSuccessText}>
                  Coupon applied! Saved {formatPrice(discountAmount)}
                </Text>
              </View>
            )}
          </Card>

          {/* Order Summary Financial Breakdown */}
          <Card
            style={[
              styles.cardBox,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderSubtle,
                borderRadius: radius.card,
                marginTop: spacing.md,
              },
            ]}
          >
            <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.md }]}>
              Price Breakdown
            </Text>

            <View style={styles.summaryRow}>
              <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[typography.titleSmall, { color: colors.textPrimary }]}>{formatPrice(subtotal)}</Text>
            </View>

            {couponApplied && (
              <View style={[styles.summaryRow, { marginTop: 6 }]}>
                <Text style={[typography.bodyMedium, { color: '#16A34A' }]}>Coupon Discount</Text>
                <Text style={[typography.titleSmall, { color: '#16A34A' }]}>-{formatPrice(discountAmount)}</Text>
              </View>
            )}

            <View style={[styles.summaryRow, { marginTop: 6 }]}>
              <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>Estimated Shipping</Text>
              <Text style={[typography.titleSmall, { color: shippingFee === 0 ? '#16A34A' : colors.textPrimary }]}>
                {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
              </Text>
            </View>

            {subtotal < 500 && subtotal > 0 && (
              <Text style={[typography.caption2, { color: colors.textTertiary, marginTop: 4 }]}>
                Add {formatPrice(500 - subtotal)} more to qualify for FREE shipping
              </Text>
            )}

            <View style={[styles.summaryDivider, { backgroundColor: colors.borderSubtle }]} />

            <View style={styles.summaryRow}>
              <Text style={[typography.titleMedium, { color: colors.textPrimary }]}>Total Amount</Text>
              <Text style={[typography.priceLarge, { color: colors.primary }]}>{formatPrice(finalTotal)}</Text>
            </View>

            <Button
              title="Proceed to Checkout"
              onPress={() => {
                haptic.light();
                router.push('/checkout');
              }}
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
              style={{ marginTop: spacing.lg }}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast Notification Banner */}
      <Toast message={toastMessage || ''} visible={!!toastMessage} type="info" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemsList: {},
  cartCard: {
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cartRow: {
    flexDirection: 'row',
  },
  cartDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBox: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponSuccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    padding: 8,
    backgroundColor: '#DCFCE7',
  },
  couponSuccessText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
});
