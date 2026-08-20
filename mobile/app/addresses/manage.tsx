/**
 * Premika 2.0 Add / Edit Customer Address Screen
 * Supports address details, address type chips (Home, Office, Other) & set default address toggle.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, User, Phone, Home, Briefcase, Tag, Save } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Card } from '@/components/ui/Card';
import { Toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth-store';
import { addressesApi } from '@/api/addresses';
import { CustomerAddress } from '@/api/types';
import { haptic } from '@/utils/haptics';

export default function ManageAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { address: addressParam } = useLocalSearchParams<{ address?: string }>();
  const { colors, typography, spacing, radius } = useTheme();

  const session = useAuthStore((state) => state.session);

  const existingAddress: CustomerAddress | null = addressParam ? JSON.parse(addressParam) : null;
  const isEditing = !!existingAddress;

  const [name, setName] = useState(existingAddress?.name || '');
  const [phone, setPhone] = useState(existingAddress?.phone || '');
  const [addressLine1, setAddressLine1] = useState(existingAddress?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(existingAddress?.addressLine2 || '');
  const [city, setCity] = useState(existingAddress?.city || '');
  const [state, setState] = useState(existingAddress?.state || '');
  const [postalCode, setPostalCode] = useState(existingAddress?.postalCode || '');
  const [country, setCountry] = useState(existingAddress?.country || 'India');
  const [addressType, setAddressType] = useState<'home' | 'office' | 'other'>(existingAddress?.addressType || 'home');
  const [isDefault, setIsDefault] = useState(existingAddress?.isDefault || false);

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success' | 'error'>('info');

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async () => {
    if (!addressLine1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      haptic.error();
      showToast('Please fill in Address Line 1, City, State and PIN Code', 'error');
      return;
    }

    if (!session?.access_token) {
      showToast('Please login to save address', 'error');
      return;
    }

    setLoading(true);
    haptic.medium();
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
        addressType,
        isDefault,
      };

      if (isEditing && existingAddress.id) {
        await addressesApi.updateAddress(session.access_token, existingAddress.id, payload);
        haptic.success();
        showToast('Address updated successfully!', 'success');
      } else {
        await addressesApi.createAddress(session.access_token, payload);
        haptic.success();
        showToast('Address saved successfully!', 'success');
      }

      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (err: any) {
      haptic.error();
      showToast(err.message || 'Failed to save address', 'error');
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
          contentContainerStyle={{
            padding: spacing.page,
            paddingBottom: insets.bottom + 28,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Card
            style={[
              styles.formCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderSubtle,
                borderRadius: radius.card,
              },
            ]}
          >
            <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
              Address Type
            </Text>

            <View style={styles.typeChipsRow}>
              <Chip
                label="Home"
                selected={addressType === 'home'}
                onPress={() => {
                  haptic.selection();
                  setAddressType('home');
                }}
                icon={<Home size={14} color={addressType === 'home' ? colors.primary : colors.textMuted} />}
              />
              <Chip
                label="Office"
                selected={addressType === 'office'}
                onPress={() => {
                  haptic.selection();
                  setAddressType('office');
                }}
                icon={<Briefcase size={14} color={addressType === 'office' ? colors.primary : colors.textMuted} />}
              />
              <Chip
                label="Other"
                selected={addressType === 'other'}
                onPress={() => {
                  haptic.selection();
                  setAddressType('other');
                }}
                icon={<Tag size={14} color={addressType === 'other' ? colors.primary : colors.textMuted} />}
              />
            </View>

            <View style={{ height: spacing.md }} />

            <TextInput
              label="Recipient Name"
              value={name}
              onChangeText={setName}
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
              label="Address Line 1 *"
              value={addressLine1}
              onChangeText={setAddressLine1}
              placeholder="House No., Flat No., Building Name"
              leftIcon={<MapPin size={18} color={colors.textMuted} />}
            />

            <View style={{ height: spacing.sm }} />

            <TextInput
              label="Address Line 2"
              value={addressLine2}
              onChangeText={setAddressLine2}
              placeholder="Area, Street, Landmark"
            />

            <View style={{ height: spacing.sm }} />

            <View style={[styles.twoColumnRow, { gap: spacing.sm }]}>
              <View style={{ flex: 1 }}>
                <TextInput label="City *" value={city} onChangeText={setCity} placeholder="e.g. New Delhi" />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput label="State *" value={state} onChangeText={setState} placeholder="e.g. Delhi" />
              </View>
            </View>

            <View style={{ height: spacing.sm }} />

            <View style={[styles.twoColumnRow, { gap: spacing.sm }]}>
              <View style={{ flex: 1 }}>
                <TextInput
                  label="PIN Code *"
                  value={postalCode}
                  onChangeText={setPostalCode}
                  placeholder="e.g. 110001"
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput label="Country" value={country} onChangeText={setCountry} placeholder="India" />
              </View>
            </View>

            <View style={{ height: spacing.md }} />

            <View style={styles.switchRow}>
              <Text style={[typography.bodyMedium, { color: colors.textPrimary }]}>Set as Default Address</Text>
              <Switch
                value={isDefault}
                onValueChange={(val) => {
                  haptic.light();
                  setIsDefault(val);
                }}
                trackColor={{ false: colors.borderSubtle, true: colors.primary }}
              />
            </View>

            <View style={{ height: spacing.lg }} />

            <Button
              title={isEditing ? 'Update Address' : 'Save Address'}
              onPress={handleSave}
              loading={loading}
              variant="primary"
              size="lg"
              leftIcon={<Save size={18} color="#FFFFFF" />}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formCard: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  typeChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  twoColumnRow: {
    flexDirection: 'row',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
});
