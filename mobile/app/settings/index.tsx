/**
 * Premika 2.0 Settings & Preferences Screen
 * Customer Account Preferences, Notifications, Help Support, Privacy Policy & App Info.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bell,
  ShieldCheck,
  FileText,
  HelpCircle,
  Mail,
  MessageSquare,
  LogOut,
  LogIn,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useAuthStore } from '@/store/auth-store';
import { haptic } from '@/utils/haptics';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing, radius } = useTheme();

  const session = useAuthStore((state) => state.session);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signOut = useAuthStore((state) => state.signOut);

  // Preference States
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotionalOffers, setPromotionalOffers] = useState(false);

  // Modal States
  const [activeModal, setActiveModal] = useState<'faq' | 'privacy' | 'terms' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSignOut = () => {
    haptic.light();
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your Premika account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          haptic.medium();
          await signOut();
          showToast('Signed out successfully');
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)');
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Toast message={toastMessage || ''} visible={!!toastMessage} type="info" />

      <ScrollView
        contentContainerStyle={{
          padding: spacing.page,
          paddingBottom: insets.bottom + spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Preferences & Notifications */}
        <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
          Preferences & Notifications
        </Text>

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
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Bell size={18} color={colors.primary} />
              <View style={{ marginLeft: spacing.md }}>
                <Text style={[typography.bodyLarge, { color: colors.textPrimary }]}>Order Updates</Text>
                <Text style={[typography.caption1, { color: colors.textMuted }]}>
                  SMS & push notifications for order status
                </Text>
              </View>
            </View>
            <Switch
              value={orderUpdates}
              onValueChange={(val) => {
                haptic.light();
                setOrderUpdates(val);
                showToast(val ? 'Order notifications enabled' : 'Order notifications disabled');
              }}
              trackColor={{ false: colors.borderSubtle, true: colors.primary }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Bell size={18} color={colors.primary} />
              <View style={{ marginLeft: spacing.md }}>
                <Text style={[typography.bodyLarge, { color: colors.textPrimary }]}>Promotions & Sales</Text>
                <Text style={[typography.caption1, { color: colors.textMuted }]}>
                  Exclusive seasonal offers & new arrivals
                </Text>
              </View>
            </View>
            <Switch
              value={promotionalOffers}
              onValueChange={(val) => {
                haptic.light();
                setPromotionalOffers(val);
                showToast(val ? 'Promotional alerts enabled' : 'Promotional alerts disabled');
              }}
              trackColor={{ false: colors.borderSubtle, true: colors.primary }}
            />
          </View>
        </Card>

        {/* Section 2: Help & Customer Support */}
        <Text
          style={[
            typography.titleMedium,
            { color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.sm },
          ]}
        >
          Help & Support
        </Text>

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
          <Pressable
            onPress={() => {
              haptic.light();
              setActiveModal('faq');
            }}
            style={styles.menuRow}
          >
            <View style={styles.settingLeft}>
              <HelpCircle size={18} color={colors.primary} />
              <Text style={[typography.bodyLarge, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                Frequently Asked Questions
              </Text>
            </View>
            <ChevronRight size={16} color={colors.textMuted} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          <Pressable
            onPress={() => {
              haptic.light();
              showToast('Email support: support@premika.in');
            }}
            style={styles.menuRow}
          >
            <View style={styles.settingLeft}>
              <Mail size={18} color={colors.primary} />
              <View style={{ marginLeft: spacing.md }}>
                <Text style={[typography.bodyLarge, { color: colors.textPrimary }]}>Customer Support Email</Text>
                <Text style={[typography.caption1, { color: colors.textMuted }]}>support@premika.in</Text>
              </View>
            </View>
            <ChevronRight size={16} color={colors.textMuted} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          <Pressable
            onPress={() => {
              haptic.light();
              showToast('WhatsApp Helpline: +91 98765 43210');
            }}
            style={styles.menuRow}
          >
            <View style={styles.settingLeft}>
              <MessageSquare size={18} color={colors.primary} />
              <View style={{ marginLeft: spacing.md }}>
                <Text style={[typography.bodyLarge, { color: colors.textPrimary }]}>WhatsApp Care Helpline</Text>
                <Text style={[typography.caption1, { color: colors.textMuted }]}>Mon-Sat 9 AM - 7 PM</Text>
              </View>
            </View>
            <ChevronRight size={16} color={colors.textMuted} />
          </Pressable>
        </Card>

        {/* Section 3: Legal & Privacy */}
        <Text
          style={[
            typography.titleMedium,
            { color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.sm },
          ]}
        >
          Legal & Policies
        </Text>

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
          <Pressable
            onPress={() => {
              haptic.light();
              setActiveModal('privacy');
            }}
            style={styles.menuRow}
          >
            <View style={styles.settingLeft}>
              <ShieldCheck size={18} color={colors.primary} />
              <Text style={[typography.bodyLarge, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                Privacy Policy
              </Text>
            </View>
            <ChevronRight size={16} color={colors.textMuted} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          <Pressable
            onPress={() => {
              haptic.light();
              setActiveModal('terms');
            }}
            style={styles.menuRow}
          >
            <View style={styles.settingLeft}>
              <FileText size={18} color={colors.primary} />
              <Text style={[typography.bodyLarge, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                Terms & Conditions of Sale
              </Text>
            </View>
            <ChevronRight size={16} color={colors.textMuted} />
          </Pressable>
        </Card>

        {/* Section 4: Account Sign Out / In Action */}
        <View style={{ marginTop: spacing.xl }}>
          {isAuthenticated ? (
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="outline"
              size="lg"
              leftIcon={<LogOut size={18} color="#EF4444" />}
            />
          ) : (
            <Button
              title="Sign In / Register Account"
              onPress={() => router.push('/auth' as any)}
              variant="primary"
              size="lg"
              leftIcon={<LogIn size={18} color="#FFFFFF" />}
            />
          )}
        </View>

        {/* Section 5: App Version Info */}
        <View style={styles.footer}>
          <Image
            source={require('../../assets/logos/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[typography.caption1, { color: colors.textMuted, marginTop: 6 }]}>
            Premika Mobile App v1.0.0
          </Text>
          <Text style={[typography.caption2, { color: colors.textMuted, marginTop: 2 }]}>
            Expo SDK 54 — Native iOS Build
          </Text>
        </View>
      </ScrollView>

      {/* Interactive Bottom Sheet for FAQ, Privacy & Terms */}
      <BottomSheet
        visible={!!activeModal}
        onClose={() => setActiveModal(null)}
        detent="large"
        title={
          activeModal === 'faq'
            ? 'Help & FAQs'
            : activeModal === 'privacy'
            ? 'Privacy Policy'
            : 'Terms of Service'
        }
      >
        <ScrollView style={{ padding: spacing.page }}>
          {activeModal === 'faq' && (
            <View style={{ gap: spacing.md }}>
              <Text style={[typography.titleMedium, { color: colors.primary }]}>How long does shipping take?</Text>
              <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
                Orders are delivered within 3-5 business days across India via premier courier partners (Delhivery, BlueDart).
              </Text>
              <Text style={[typography.titleMedium, { color: colors.primary, marginTop: spacing.md }]}>What is the return policy?</Text>
              <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
                We offer a 7-day hassle-free return and exchange policy on all kurtis and ethnic wear in unused condition.
              </Text>
              <Text style={[typography.titleMedium, { color: colors.primary, marginTop: spacing.md }]}>How can I track my order?</Text>
              <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
                You can view real-time tracking timeline inside Account {'>'} Order History or using your order number.
              </Text>
            </View>
          )}

          {activeModal === 'privacy' && (
            <View style={{ gap: spacing.sm }}>
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, lineHeight: 22 }]}>
                At Premika, we prioritize your privacy. We collect personal details (name, phone number, shipping address, and email) solely to process your orders, deliver products, and send order status updates.
              </Text>
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, lineHeight: 22, marginTop: 8 }]}>
                Payment data is processed securely through PCI-DSS compliant payment gateways (Razorpay). Premika never stores your credit/debit card numbers or CVV.
              </Text>
            </View>
          )}

          {activeModal === 'terms' && (
            <View style={{ gap: spacing.sm }}>
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, lineHeight: 22 }]}>
                By using the Premika mobile application, you agree to our terms of sale. All product images, designs, and content are the intellectual property of Premika Ethnic Wear.
              </Text>
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, lineHeight: 22, marginTop: 8 }]}>
                Prices listed include all applicable taxes. Coupon codes are subject to minimum order value requirements and validity periods.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={{ padding: spacing.page }}>
          <Button title="Close" onPress={() => setActiveModal(null)} variant="outline" size="md" />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    padding: 0,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  logo: {
    width: 36,
    height: 36,
    opacity: 0.6,
  },
});
