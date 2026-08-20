/**
 * Premika 2.0 Order Confirmation Screen
 * Celebratory completion view with order number, financial summary & quick tracking actions.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, Package, ShoppingBag, Truck } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/utils/formatters';
import { haptic } from '@/utils/haptics';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderNumber, total, name, city } = useLocalSearchParams<{
    orderNumber?: string;
    total?: string;
    name?: string;
    city?: string;
  }>();
  const { colors, typography, spacing, radius } = useTheme();

  const numTotal = total ? parseFloat(total) : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            padding: spacing.page,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
      >
        {/* Success Hero Section */}
        <View style={styles.heroBox}>
          <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
            <CheckCircle2 size={44} color="#FFFFFF" />
          </View>

          <Text style={[typography.displaySmall, { color: colors.textPrimary, marginTop: spacing.md }]}>
            Order Placed!
          </Text>

          <Text style={[typography.bodyLarge, { color: colors.textSecondary, textAlign: 'center', marginTop: 4 }]}>
            Thank you for shopping with Premika{name ? `, ${name}` : ''}!
          </Text>
        </View>

        {/* Order Details Summary Card */}
        <Card
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.borderSubtle,
              borderRadius: radius.card,
              padding: spacing.lg,
            },
          ]}
        >
          <View style={styles.detailRow}>
            <Text style={[typography.bodyMedium, { color: colors.textMuted }]}>Order Number</Text>
            <Text style={[typography.titleMedium, { color: colors.primary, fontWeight: '700' }]}>
              #{orderNumber || 'PMK-SUCCESS'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          <View style={styles.detailRow}>
            <Text style={[typography.bodyMedium, { color: colors.textMuted }]}>Total Amount</Text>
            <Text style={[typography.priceLarge, { color: colors.textPrimary }]}>
              {formatPrice(numTotal)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          <View style={styles.detailRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Truck size={16} color={colors.primary} />
              <Text style={[typography.bodyMedium, { color: colors.textMuted }]}>Estimated Delivery</Text>
            </View>
            <Text style={[typography.titleSmall, { color: colors.textPrimary }]}>
              3-5 Business Days {city ? `(${city})` : ''}
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={[styles.actionsBox, { gap: spacing.sm }]}>
          {orderNumber && (
            <Button
              title="View Order Details"
              onPress={() => {
                haptic.light();
                router.replace(`/orders/${orderNumber}` as any);
              }}
              variant="primary"
              size="lg"
              leftIcon={<Package size={18} color="#FFFFFF" />}
            />
          )}

          <Button
            title="Continue Shopping"
            onPress={() => {
              haptic.light();
              router.replace('/(tabs)' as any);
            }}
            variant="outline"
            size="lg"
            leftIcon={<ShoppingBag size={18} color={colors.textPrimary} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  heroBox: {
    alignItems: 'center',
    marginBottom: 28,
  },
  checkCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    marginBottom: 28,
    borderWidth: StyleSheet.hairlineWidth,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
  },
  actionsBox: {
    width: '100%',
  },
});
