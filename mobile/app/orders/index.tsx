/**
 * Premika 2.0 Customer Order History Screen
 * Displays list of past customer orders with status badges, date, items count & details navigation.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Package, ChevronRight, Calendar, CreditCard, ShoppingBag } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Toast } from '@/components/ui/Toast';
import { formatPrice } from '@/utils/formatters';
import { useAuthStore } from '@/store/auth-store';
import { ordersApi } from '@/api/orders';
import { CustomerOrder } from '@/api/types';
import { haptic } from '@/utils/haptics';

export default function OrderHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing, radius } = useTheme();

  const session = useAuthStore((state) => state.session);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!session?.access_token) return;
    try {
      const res = await ordersApi.getOrders(session.access_token);
      setOrders(res.items || []);
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to load order history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [session?.access_token])
  );

  const getStatusVariant = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('delivered') || s.includes('completed')) return 'success';
    if (s.includes('cancelled') || s.includes('failed')) return 'error';
    return 'primary';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Toast message={toastMessage || ''} visible={!!toastMessage} type="error" />

      <ScrollView
        contentContainerStyle={{
          padding: spacing.page,
          paddingBottom: insets.bottom + spacing.xl,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchOrders}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ gap: spacing.md }}>
            <Skeleton height={140} width="100%" borderRadius={radius.card} />
            <Skeleton height={140} width="100%" borderRadius={radius.card} />
          </View>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No Orders Yet"
            description="You haven't placed any orders yet. Discover our handcrafted ethnic wear collection!"
            icon={<ShoppingBag size={48} color={colors.primary} />}
            actionTitle="Discover Collections"
            onAction={() => router.push('/(tabs)')}
          />
        ) : (
          <View style={{ gap: spacing.md }}>
            {orders.map((order) => (
              <Pressable
                key={order.id || order.orderNumber}
                onPress={() => {
                  haptic.light();
                  router.push(`/orders/${order.orderNumber}` as any);
                }}
              >
                <Card
                  style={[
                    styles.orderCard,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.borderSubtle,
                      borderRadius: radius.card,
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.orderNumberRow}>
                      <Package size={18} color={colors.primary} />
                      <Text style={[typography.titleMedium, { color: colors.textPrimary }]}>
                        #{order.orderNumber}
                      </Text>
                    </View>

                    <Badge
                      content={order.status.toUpperCase()}
                      variant={getStatusVariant(order.status) as any}
                      size="sm"
                    />
                  </View>

                  <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                      <Calendar size={14} color={colors.textMuted} />
                      <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <CreditCard size={14} color={colors.textMuted} />
                      <Text style={[typography.titleSmall, { color: colors.textPrimary }]}>
                        {formatPrice(order.totalAmount)}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.cardFooter, { borderTopColor: colors.borderSubtle }]}>
                    <Text style={[typography.labelMedium, { color: colors.textMuted }]}>
                      {order.itemsCount || order.items?.length || 1} Item(s)
                    </Text>
                    <View style={styles.viewDetailBtn}>
                      <Text style={[styles.viewDetailText, { color: colors.primary }]}>View Details</Text>
                      <ChevronRight size={16} color={colors.primary} />
                    </View>
                  </View>
                </Card>
              </Pressable>
            ))}
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
  orderCard: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  viewDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
