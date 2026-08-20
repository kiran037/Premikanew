/**
 * Premika 2.0 Edit Customer Profile Screen
 * Update first name, last name, mobile phone & avatar with live avatar image preview.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Phone, Camera, Save } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth-store';
import { customerApi } from '@/api/customer';
import { haptic } from '@/utils/haptics';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing, radius } = useTheme();

  const session = useAuthStore((state) => state.session);
  const customer = useAuthStore((state) => state.customer);
  const refreshCustomer = useAuthStore((state) => state.refreshCustomer);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success' | 'error'>('info');

  useEffect(() => {
    if (customer) {
      setFirstName(customer.firstName || '');
      setLastName(customer.lastName || '');
      setPhone(customer.phone || '');
      setAvatarUrl(customer.avatarUrl || '');
    }
  }, [customer]);

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async () => {
    if (!session?.access_token) {
      showToast('Authentication required', 'error');
      return;
    }

    setLoading(true);
    haptic.medium();
    try {
      await customerApi.updateProfile(session.access_token, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      await refreshCustomer();
      haptic.success();
      showToast('Profile updated successfully!', 'success');
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (err: any) {
      haptic.error();
      showToast(err.message || 'Failed to update profile', 'error');
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
            {/* Avatar Live Preview */}
            <View style={styles.avatarPreviewBox}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                {avatarUrl.trim() ? (
                  <Image source={{ uri: avatarUrl.trim() }} style={styles.avatarImg} />
                ) : (
                  <User size={36} color="#FFFFFF" />
                )}
              </View>
              <Text style={[typography.caption1, { color: colors.textMuted, marginTop: 8 }]}>
                Profile Picture Preview
              </Text>
            </View>

            <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.md }]}>
              Personal Details
            </Text>

            <TextInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="e.g. Priyanshu"
              leftIcon={<User size={18} color={colors.textMuted} />}
            />

            <View style={{ height: spacing.sm }} />

            <TextInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              placeholder="e.g. Sharma"
              leftIcon={<User size={18} color={colors.textMuted} />}
            />

            <View style={{ height: spacing.sm }} />

            <TextInput
              label="Mobile Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              leftIcon={<Phone size={18} color={colors.textMuted} />}
            />

            <View style={{ height: spacing.sm }} />

            <TextInput
              label="Avatar Image URL"
              value={avatarUrl}
              onChangeText={setAvatarUrl}
              placeholder="https://images.unsplash.com/..."
              leftIcon={<Camera size={18} color={colors.textMuted} />}
            />

            <View style={{ height: spacing.lg }} />

            <Button
              title="Save Changes"
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
  avatarPreviewBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
});
