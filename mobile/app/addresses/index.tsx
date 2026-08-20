/**
 * Premika 2.0 Customer Address Book Screen
 * Lists saved addresses with set default, edit, and delete actions.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus, MapPin, Trash2, Edit3, Home, Briefcase, Star } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth-store';
import { addressesApi } from '@/api/addresses';
import { CustomerAddress } from '@/api/types';
import { haptic } from '@/utils/haptics';

export default function AddressBookScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing, radius } = useTheme();

  const session = useAuthStore((state) => state.session);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success' | 'error'>('info');

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchAddresses = async () => {
    if (!session?.access_token) return;
    try {
      const data = await addressesApi.getAddresses(session.access_token);
      setAddresses(data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load address book', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [session?.access_token])
  );

  const handleSetDefault = async (id: string) => {
    if (!session?.access_token) return;
    haptic.selection();
    try {
      await addressesApi.setDefaultAddress(session.access_token, id);
      showToast('Default address updated!', 'success');
      fetchAddresses();
    } catch (err: any) {
      showToast(err.message || 'Failed to set default address', 'error');
    }
  };

  const handleDelete = (id: string) => {
    haptic.light();
    Alert.alert('Delete Address', 'Are you sure you want to remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!session?.access_token) return;
          haptic.medium();
          try {
            await addressesApi.deleteAddress(session.access_token, id);
            showToast('Address deleted', 'info');
            fetchAddresses();
          } catch (err: any) {
            showToast(err.message || 'Failed to delete address', 'error');
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Toast message={toastMessage || ''} visible={!!toastMessage} type={toastType} />

      <ScrollView
        contentContainerStyle={{
          padding: spacing.page,
          paddingBottom: insets.bottom + spacing.xl,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchAddresses}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Button
          title="Add New Address"
          onPress={() => {
            haptic.light();
            router.push('/addresses/manage' as any);
          }}
          variant="primary"
          size="md"
          leftIcon={<Plus size={18} color="#FFFFFF" />}
          style={{ marginBottom: spacing.md }}
        />

        {loading ? (
          <View style={{ gap: spacing.md }}>
            <Skeleton height={120} width="100%" borderRadius={radius.card} />
            <Skeleton height={120} width="100%" borderRadius={radius.card} />
          </View>
        ) : addresses.length === 0 ? (
          <EmptyState
            title="No Saved Addresses"
            description="Add your delivery address to enjoy seamless, one-tap checkout."
            icon={<MapPin size={48} color={colors.primary} />}
            actionTitle="Add Address"
            onAction={() => router.push('/addresses/manage' as any)}
          />
        ) : (
          <View style={{ gap: spacing.md }}>
            {addresses.map((item) => (
              <Card
                key={item.id}
                style={[
                  styles.addressCard,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.borderSubtle,
                    borderRadius: radius.card,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.headerTitleRow}>
                    {item.addressType === 'office' ? (
                      <Briefcase size={16} color={colors.primary} />
                    ) : (
                      <Home size={16} color={colors.primary} />
                    )}
                    <Text style={[typography.titleMedium, { color: colors.textPrimary, textTransform: 'capitalize' }]}>
                      {item.name || item.addressType || 'Address'}
                    </Text>
                    {item.isDefault && <Badge content="DEFAULT" variant="primary" size="sm" />}
                  </View>

                  <View style={styles.headerActions}>
                    <Pressable
                      onPress={() => {
                        haptic.light();
                        router.push({
                          pathname: '/addresses/manage',
                          params: { address: JSON.stringify(item) },
                        } as any);
                      }}
                      style={styles.iconBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Edit address"
                    >
                      <Edit3 size={16} color={colors.textSecondary} />
                    </Pressable>

                    <Pressable
                      onPress={() => handleDelete(item.id)}
                      style={styles.iconBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Delete address"
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>

                <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: 8 }]}>
                  {item.addressLine1}
                  {item.addressLine2 ? `, ${item.addressLine2}` : ''}
                </Text>

                <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
                  {item.city}, {item.state} — {item.postalCode}
                </Text>

                {item.phone && (
                  <Text style={[typography.caption1, { color: colors.textMuted, marginTop: 4 }]}>
                    Phone: {item.phone}
                  </Text>
                )}

                {!item.isDefault && (
                  <Pressable
                    onPress={() => handleSetDefault(item.id)}
                    style={[styles.setDefaultLink, { borderTopColor: colors.borderSubtle }]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Star size={13} color={colors.primary} />
                    <Text style={[typography.caption1, { color: colors.primary, fontWeight: '600', marginLeft: 4 }]}>
                      Set as Default
                    </Text>
                  </Pressable>
                )}
              </Card>
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
  addressCard: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  setDefaultLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
