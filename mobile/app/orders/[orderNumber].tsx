/**
 * Premika 2.0 Customer Order Detail & Tracking Screen
 * Visual order progress timeline, itemized product list, delivery address, and price breakdown.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { MapPin, Check } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatPrice } from '@/utils/formatters';
import { useAuthStore } from '@/store/auth-store';
import { ordersApi } from '@/api/orders';
import { CustomerOrder } from '@/api/types';

const TIMELINE_STEPS = [
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const { orderNumber } = useLocalSearchParams<{ orderNumber: string }>();
  const { colors, typography, spacing, radius } = useTheme();

  const session = useAuthStore((state) => state.session);
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetail = async () => {
    if (!session?.access_token || !orderNumber) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ordersApi.getOrderByNumber(session.access_token, orderNumber);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderNumber, session?.access_token]);

  const getActiveStepIndex = (statusString: string) => {
    const s = statusString.toLowerCase();
    if (s.includes('delivered') || s.includes('completed')) return 4;
    if (s.includes('shipped') || s.includes('dispatch')) return 3;
    if (s.includes('processing') || s.includes('pack')) return 2;
    if (s.includes('confirmed') || s.includes('accept')) return 1;
    return 0;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.page,
          paddingBottom: insets.bottom + spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ gap: spacing.md }}>
            <Skeleton height={120} width="100%" borderRadius={radius.card} />
            <Skeleton height={100} width="100%" borderRadius={radius.card} />
            <Skeleton height={180} width="100%" borderRadius={radius.card} />
            <Skeleton height={100} width="100%" borderRadius={radius.card} />
          </View>
        ) : error || !order ? (
          <ErrorState message={error || 'Order not found'} onRetry={fetchOrderDetail} />
        ) : (
          <View style={{ gap: spacing.md }}>
            {/* 1. Status & Summary Header Card */}
            <Card
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.borderSubtle,
                  borderRadius: radius.card,
                },
              ]}
            >
              <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                  <Text style={[typography.titleLarge, { color: colors.textPrimary }]}>#{order.orderNumber}</Text>
                  <Text style={[typography.bodyMedium, { color: colors.textMuted, marginTop: 2 }]}>
                    Placed on{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <Badge content={order.status.toUpperCase()} variant="primary" size="md" />
              </View>
            </Card>

            {/* 2. Visual Order Tracking Timeline */}
            <Card
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.borderSubtle,
                  borderRadius: radius.card,
                },
              ]}
            >
              <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                Order Tracking
              </Text>

              <View style={styles.timelineContainer}>
                {TIMELINE_STEPS.map((step, idx) => {
                  const activeIdx = getActiveStepIndex(order.status);
                  const isCompleted = idx <= activeIdx;
                  const isCurrent = idx === activeIdx;

                  return (
                    <View key={step.key} style={styles.timelineStep}>
                      <View style={styles.circleContainer}>
                        <View
                          style={[
                            styles.timelineCircle,
                            {
                              backgroundColor: isCompleted ? colors.primary : colors.surface,
                              borderColor: isCompleted ? colors.primary : colors.borderSubtle,
                            },
                          ]}
                        >
                          {isCompleted ? (
                            <Check size={11} color="#FFFFFF" />
                          ) : (
                            <View style={[styles.timelineDot, { backgroundColor: colors.textMuted }]} />
                          )}
                        </View>
                        {idx < TIMELINE_STEPS.length - 1 && (
                          <View
                            style={[
                              styles.timelineLine,
                              { backgroundColor: idx < activeIdx ? colors.primary : colors.borderSubtle },
                            ]}
                          />
                        )}
                      </View>

                      <Text
                        numberOfLines={1}
                        style={[
                          styles.stepLabel,
                          {
                            color: isCompleted ? colors.textPrimary : colors.textMuted,
                            fontWeight: isCurrent ? '700' : '500',
                          },
                        ]}
                      >
                        {step.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card>

            {/* 3. Itemized Order Items */}
            <Card
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.borderSubtle,
                  borderRadius: radius.card,
                },
              ]}
            >
              <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                Order Items ({order.items?.length || 0})
              </Text>

              {order.items?.map((item, idx) => (
                <View key={item.id || idx}>
                  {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />}
                  <View style={styles.itemRow}>
                    <OptimizedImage
                      source={item.productImage}
                      containerStyle={{
                        width: 64,
                        height: 82,
                        borderRadius: radius.sm,
                        overflow: 'hidden',
                      }}
                      style={{ width: '100%', height: '100%' }}
                    />

                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <Text style={[typography.titleMedium, { color: colors.textPrimary }]} numberOfLines={2}>
                        {item.productName}
                      </Text>

                      {(item.selectedSize || item.selectedHeight) && (
                        <Text style={[typography.caption1, { color: colors.textMuted, marginTop: 2 }]}>
                          {item.selectedSize ? `Size: ${item.selectedSize}` : ''}
                          {item.selectedSize && item.selectedHeight ? ' | ' : ''}
                          {item.selectedHeight ? `Height: ${item.selectedHeight}` : ''}
                        </Text>
                      )}

                      <View style={styles.priceQtyRow}>
                        <Text style={[typography.titleMedium, { color: colors.primary }]}>
                          {formatPrice(item.price)}
                        </Text>
                        <Text style={[typography.bodySmall, { color: colors.textMuted }]}>
                          Qty: {item.quantity}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </Card>

            {/* 4. Shipping Address */}
            {order.shippingAddress && (
              <Card
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.borderSubtle,
                    borderRadius: radius.card,
                  },
                ]}
              >
                <View style={styles.sectionHeaderRow}>
                  <MapPin size={16} color={colors.primary} />
                  <Text style={[typography.titleMedium, { color: colors.textPrimary, marginLeft: spacing.xs }]}>
                    Shipping Address
                  </Text>
                </View>
                <Text style={[typography.labelLarge, { color: colors.textPrimary, marginTop: 8 }]}>
                  {order.shippingAddress.name}
                </Text>
                <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: 2 }]}>
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
                </Text>
                <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
                  {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.postalCode}
                </Text>
                {order.shippingAddress.phone && (
                  <Text style={[typography.caption1, { color: colors.textMuted, marginTop: 4 }]}>
                    Phone: {order.shippingAddress.phone}
                  </Text>
                )}
              </Card>
            )}

            {/* 5. Order Price Summary Breakdown */}
            <Card
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.borderSubtle,
                  borderRadius: radius.card,
                },
              ]}
            >
              <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                Payment & Total Breakdown
              </Text>

              <View style={styles.summaryRow}>
                <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>Total Paid</Text>
                <Text style={[typography.priceLarge, { color: colors.primary }]}>
                  {formatPrice(order.totalAmount)}
                </Text>
              </View>

              <View style={[styles.summaryRow, { marginTop: 8 }]}>
                <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>Payment Status</Text>
                <Badge content={order.paymentStatus || 'COMPLETED'} variant="success" size="sm" />
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  circleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    position: 'relative',
    height: 24,
  },
  timelineCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timelineLine: {
    position: 'absolute',
    left: '50%',
    right: '-50%',
    height: 2,
    top: 10,
    zIndex: 1,
  },
  stepLabel: {
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
