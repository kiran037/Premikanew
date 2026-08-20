/**
 * Premika 2.0 Checkout & Payment Screen
 * Grouped sections for contact, delivery address, promo coupon, Razorpay payment, and order summary.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Tag,
  ArrowRight,
  Home,
  Briefcase,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';
import { FloatingActionContainer } from '@/components/layout/FloatingActionContainer';
import { formatPrice } from '@/utils/formatters';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { addressesApi } from '@/api/addresses';
import { couponsApi } from '@/api/coupons';
import { ordersApi } from '@/api/orders';
import { CustomerAddress } from '@/api/types';
import { haptic } from '@/utils/haptics';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing, radius } = useTheme();

  const session = useAuthStore((state) => state.session);
  const customer = useAuthStore((state) => state.customer);
  const token = session?.access_token;
  const isAuthenticated = !!token;

  const items = useCartStore((state) => state.items);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const clearCart = useCartStore((state) => state.clearCart);

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Contact Info
  const [fullName, setFullName] = useState(
    customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : ''
  );
  const [phone, setPhone] = useState(customer?.phone || '');
  const [email, setEmail] = useState(customer?.email || '');

  // Guest Address Input
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success' | 'error'>('info');

  const subtotal = getSubtotal();
  const shippingFee = subtotal >= 500 || subtotal === 0 ? 0 : 70;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      addressesApi
        .getAddresses(token)
        .then((data) => {
          setSavedAddresses(data || []);
          const defaultAddr = data.find((a) => a.isDefault) || data[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, token]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    haptic.light();
    try {
      const res = await couponsApi.validateCoupon(couponCode.trim(), subtotal);
      if (res.valid) {
        const discount = res.discountAmount || (res.discountValue ? (subtotal * res.discountValue) / 100 : 0);
        setDiscountAmount(discount);
        setCouponApplied(true);
        haptic.success();
        showToast(`Coupon '${couponCode.trim().toUpperCase()}' applied!`, 'success');
      } else {
        haptic.error();
        showToast(res.message || 'Invalid coupon code', 'error');
      }
    } catch (err: any) {
      haptic.error();
      showToast(err.message || 'Failed to validate coupon', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    let shippingData;
    if (isAuthenticated && selectedAddressId) {
      const selected = savedAddresses.find((a) => a.id === selectedAddressId);
      if (!selected) {
        showToast('Please select a valid delivery address', 'error');
        return;
      }
      shippingData = {
        fullName: selected.name || fullName || 'Customer',
        email: email.trim(),
        phone: selected.phone || phone,
        addressLine1: selected.addressLine1,
        addressLine2: selected.addressLine2,
        city: selected.city,
        state: selected.state,
        postalCode: selected.postalCode,
        country: selected.country || 'India',
      };
    } else {
      if (!fullName.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
        showToast('Please complete all required contact & delivery address fields', 'error');
        return;
      }
      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        showToast('Please enter a valid 10-digit mobile phone number', 'error');
        return;
      }
      if (postalCode.trim().length < 6) {
        showToast('Please enter a valid 6-digit PIN / Postal Code', 'error');
        return;
      }
      shippingData = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: cleanPhone,
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim() || 'India',
      };
    }

    setLoading(true);
    haptic.medium();

    try {
      const orderPayload = {
        customer: shippingData,
        items: items.map((item) => ({
          productId: item.product.id,
          title: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          size: item.selectedSize,
          height: item.selectedHeight,
        })),
        couponCode: couponApplied ? couponCode.trim() : undefined,
        paymentMethod: 'online',
      };

      showToast('Preparing secure payment...', 'info');

      // 1. Create order & Razorpay order via backend
      const paymentOrder = await ordersApi.createPaymentOrder(orderPayload, token);
      if (!paymentOrder || !paymentOrder.id) {
        throw new Error('Failed to initialize Razorpay payment order from server.');
      }

      const razorpayKey = paymentOrder.key || process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_514524854';

      const options = {
        description: 'Premika Kurti & Ethnic Wear Order',
        image: 'https://premika.in/logo.png',
        currency: paymentOrder.currency || 'INR',
        key: razorpayKey,
        amount: paymentOrder.amount,
        name: 'Premika Ethnic Wear',
        order_id: paymentOrder.id,
        prefill: {
          email: shippingData.email || '',
          contact: shippingData.phone || '',
          name: shippingData.fullName || '',
        },
        theme: { color: colors.primary || '#78201E' },
      };

      let paymentResponse: any = null;

      // 2. Launch Razorpay Native Checkout
      try {
        const RazorpayCheckout = require('react-native-razorpay').default;
        paymentResponse = await RazorpayCheckout.open(options);
      } catch (sdkError: any) {
        const isCancelled = sdkError?.code === 0 || sdkError?.description?.toLowerCase().includes('cancel');
        if (isCancelled) {
          haptic.light();
          showToast('Payment cancelled. You can try again.', 'info');
        } else {
          haptic.error();
          showToast(sdkError?.description || sdkError?.message || 'Payment failed. Please try again.', 'error');
        }
        return;
      }

      // 3. Verify Payment Signature with backend
      showToast('Verifying payment with server...', 'info');

      const verification = await ordersApi.verifyPaymentOrder(
        {
          orderId: paymentResponse.razorpay_order_id || paymentOrder.id,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature,
          customer: shippingData,
          items: orderPayload.items,
          couponCode: orderPayload.couponCode,
        },
        token
      );

      if (verification.isOk) {
        haptic.success();
        const generatedOrderNumber = verification.orderId || paymentOrder.orderNumber || `PMK-${Date.now()}`;
        await clearCart(token);
        router.push({
          pathname: '/checkout/confirmation',
          params: {
            orderNumber: generatedOrderNumber,
            total: String(finalTotal),
            name: shippingData.fullName,
            city: shippingData.city,
          },
        } as any);
      } else {
        haptic.error();
        showToast(verification.message || 'Payment signature verification failed.', 'error');
      }
    } catch (err: any) {
      haptic.error();
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Toast message={toastMessage || ''} visible={!!toastMessage} type={toastType} />

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
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* 1. Contact Info Section */}
          <Card
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderSubtle,
                borderRadius: radius.card,
              },
            ]}
          >
            <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.md }]}>
              1. Contact Information
            </Text>

            <TextInput
              label="Full Name *"
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Priyanshu Sharma"
              leftIcon={<User size={18} color={colors.textMuted} />}
            />

            <View style={{ height: spacing.sm }} />

            <TextInput
              label="Mobile Phone *"
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              leftIcon={<Phone size={18} color={colors.textMuted} />}
            />

            <View style={{ height: spacing.sm }} />

            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              keyboardType="email-address"
              leftIcon={<Mail size={18} color={colors.textMuted} />}
            />
          </Card>

          {/* 2. Delivery Address Section */}
          <Card
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderSubtle,
                borderRadius: radius.card,
                marginTop: spacing.md,
              },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <Text style={[typography.titleMedium, { color: colors.textPrimary }]}>
                2. Delivery Address
              </Text>
              {isAuthenticated && (
                <Pressable
                  onPress={() => router.push('/addresses/manage' as any)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[typography.labelMedium, { color: colors.primary }]}>+ Add New</Text>
                </Pressable>
              )}
            </View>

            {isAuthenticated && savedAddresses.length > 0 ? (
              <View style={[styles.savedAddressesList, { gap: spacing.sm }]}>
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <Pressable
                      key={addr.id}
                      onPress={() => {
                        haptic.selection();
                        setSelectedAddressId(addr.id);
                      }}
                      style={[
                        styles.addressCardOption,
                        {
                          borderColor: isSelected ? colors.primary : colors.borderSubtle,
                          backgroundColor: isSelected ? colors.surface : colors.surfaceElevated,
                          borderRadius: radius.card - 2,
                        },
                      ]}
                      accessible={true}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                    >
                      <View style={styles.addressRadioRow}>
                        <View
                          style={[
                            styles.radioCircle,
                            {
                              borderColor: isSelected ? colors.primary : colors.textMuted,
                              backgroundColor: isSelected ? colors.primary : 'transparent',
                            },
                          ]}
                        >
                          {isSelected && <View style={styles.radioDot} />}
                        </View>

                        <View style={{ flex: 1, marginLeft: spacing.sm }}>
                          <View style={styles.addrHeader}>
                            <Text style={[typography.titleSmall, { color: colors.textPrimary }]}>
                              {addr.name || addr.addressType || 'Saved Address'}
                            </Text>
                            {addr.isDefault && <Badge content="DEFAULT" variant="primary" size="sm" />}
                          </View>
                          <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                            {addr.addressLine1}, {addr.city}, {addr.state} — {addr.postalCode}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.guestAddressForm}>
                <TextInput
                  label="Address Line 1 *"
                  value={addressLine1}
                  onChangeText={setAddressLine1}
                  placeholder="House No., Flat, Building Name, Street"
                  leftIcon={<MapPin size={18} color={colors.textMuted} />}
                />

                <View style={{ height: spacing.sm }} />

                <TextInput
                  label="Address Line 2"
                  value={addressLine2}
                  onChangeText={setAddressLine2}
                  placeholder="Area, Landmark, Colony"
                />

                <View style={{ height: spacing.sm }} />

                <View style={[styles.twoColumnRow, { gap: spacing.sm }]}>
                  <View style={{ flex: 1 }}>
                    <TextInput label="City *" value={city} onChangeText={setCity} placeholder="City" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput label="State *" value={state} onChangeText={setState} placeholder="State" />
                  </View>
                </View>

                <View style={{ height: spacing.sm }} />

                <View style={[styles.twoColumnRow, { gap: spacing.sm }]}>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      label="PIN Code *"
                      value={postalCode}
                      onChangeText={setPostalCode}
                      placeholder="6-digit PIN"
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput label="Country" value={country} onChangeText={setCountry} placeholder="India" />
                  </View>
                </View>
              </View>
            )}
          </Card>

          {/* 3. Payment Method Section */}
          <Card
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderSubtle,
                borderRadius: radius.card,
                marginTop: spacing.md,
              },
            ]}
          >
            <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.xs }]}>
              3. Payment Method
            </Text>
            <View style={styles.paymentInfoRow}>
              <ShieldCheck size={20} color={colors.primary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginLeft: spacing.xs, flex: 1 }]}>
                Secure online payment powered by Razorpay (UPI, GPay, Credit/Debit Cards, Net Banking)
              </Text>
            </View>
          </Card>

          {/* 4. Promo Coupon Section */}
          <Card
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderSubtle,
                borderRadius: radius.card,
                marginTop: spacing.md,
              },
            ]}
          >
            <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
              Apply Promo Coupon
            </Text>

            <View style={styles.couponRow}>
              <TextInput
                value={couponCode}
                onChangeText={setCouponCode}
                placeholder="e.g. PREMIKA10"
                autoCapitalize="characters"
                style={{ flex: 1 }}
              />
              <Button
                title="Apply"
                onPress={handleApplyCoupon}
                loading={couponLoading}
                disabled={couponApplied}
                variant="secondary"
                size="md"
                style={{ marginLeft: spacing.sm }}
              />
            </View>

            {couponApplied && (
              <View style={[styles.couponSuccessBadge, { borderRadius: radius.xs }]}>
                <CheckCircle2 size={16} color="#16A34A" />
                <Text style={styles.couponSuccessText}>
                  Coupon applied! Saved {formatPrice(discountAmount)}
                </Text>
              </View>
            )}
          </Card>

          {/* 5. Order Summary Breakdown */}
          <Card
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderSubtle,
                borderRadius: radius.card,
                marginTop: spacing.md,
              },
            ]}
          >
            <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.md }]}>
              Order Summary ({items.length} items)
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
              <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>Shipping Fee</Text>
              <Text style={[typography.titleSmall, { color: shippingFee === 0 ? '#16A34A' : colors.textPrimary }]}>
                {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

            <View style={styles.summaryRow}>
              <Text style={[typography.titleMedium, { color: colors.textPrimary }]}>Total Amount</Text>
              <Text style={[typography.priceLarge, { color: colors.primary }]}>{formatPrice(finalTotal)}</Text>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Action Payment CTA */}
      <FloatingActionContainer>
        <View style={styles.bottomBarContent}>
          <View style={styles.totalPriceBlock}>
            <Text style={[typography.caption1, { color: colors.textSecondary }]}>Amount to Pay</Text>
            <Text style={[typography.priceMedium, { color: colors.primary }]}>
              {formatPrice(finalTotal)}
            </Text>
          </View>

          <Button
            title={`Pay ${formatPrice(finalTotal)}`}
            onPress={handlePlaceOrder}
            loading={loading}
            variant="primary"
            size="md"
            rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
            style={{ flex: 1, marginLeft: spacing.md }}
          />
        </View>
      </FloatingActionContainer>
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
  sectionCard: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  twoColumnRow: {
    flexDirection: 'row',
  },
  savedAddressesList: {},
  addressCardOption: {
    borderWidth: 1.5,
    padding: 12,
  },
  addressRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  addrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guestAddressForm: {
    marginTop: 4,
  },
  couponRow: {
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
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bottomBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalPriceBlock: {},
});
