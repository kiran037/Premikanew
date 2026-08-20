/**
 * Premika 2.0 Passwordless Authentication Screen
 * Phone OTP Verification, Social OAuth Providers & Guest Access with V2 Design Tokens.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput as RNTextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { haptic } from '@/utils/haptics';

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { colors, typography, spacing, radius } = useTheme();

  const signInWithPhone = useAuthStore((state) => state.signInWithPhone);
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signInWithApple = useAuthStore((state) => state.signInWithApple);

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success' | 'error'>('info');

  const mergeCart = useCartStore((state) => state.mergeWithServer);
  const mergeWishlist = useWishlistStore((state) => state.mergeWithServer);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendOtp = async () => {
    const cleaned = phoneNumber.trim().replace(/\D/g, '');
    if (cleaned.length < 10) {
      haptic.error();
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setLoading(true);
    haptic.medium();
    const res = await signInWithPhone(cleaned);
    setLoading(false);

    if (res.success) {
      haptic.success();
      setStep('otp');
      setCountdown(30);
      setCanResend(false);
      showToast('Verification code sent!', 'success');
    } else {
      haptic.error();
      showToast(res.message || 'Failed to send verification code', 'error');
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.trim().length < 6) {
      haptic.error();
      showToast('Please enter the 6-digit verification code', 'error');
      return;
    }

    setLoading(true);
    haptic.medium();
    const res = await verifyOtp(phoneNumber, otpCode.trim());
    setLoading(false);

    if (res.success) {
      haptic.success();
      showToast('Welcome to Premika!', 'success');
      const token = useAuthStore.getState().session?.access_token;
      if (token) {
        mergeCart(token);
        mergeWishlist(token);
      }
      setTimeout(() => {
        if (redirect) {
          router.replace(redirect as any);
        } else if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      }, 800);
    } else {
      haptic.error();
      showToast(res.message || 'Invalid verification code', 'error');
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(30);
    haptic.light();
    const res = await signInWithPhone(phoneNumber);
    if (res.success) {
      haptic.success();
      showToast('New verification code sent!', 'success');
    } else {
      haptic.error();
      showToast(res.message || 'Resend failed', 'error');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    haptic.light();
    const res = await signInWithGoogle();
    setLoading(false);
    showToast(res.message || 'Connecting to Google...', 'info');
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    haptic.light();
    const res = await signInWithApple();
    setLoading(false);
    showToast(res.message || 'Connecting to Apple...', 'info');
  };

  const handleDismiss = () => {
    haptic.light();
    if (redirect) {
      router.replace(redirect as any);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerTitle: step === 'phone' ? 'Sign In' : 'Verify Code',
        }}
      />
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
              paddingBottom: insets.bottom + spacing.xl,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Identity Card */}
          <Card
            style={[
              styles.brandCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderSubtle,
                borderRadius: radius.card,
                padding: spacing.lg,
              },
            ]}
          >
            <Image
              source={require('../../assets/logos/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[typography.titleLarge, { color: colors.primary, letterSpacing: 4 }]}>
              PREMIKA
            </Text>
            <Text style={[typography.caption1, { color: colors.textMuted, letterSpacing: 1.5, marginTop: 4 }]}>
              LUXURY ETHNIC ATELIER
            </Text>
          </Card>

          {step === 'phone' ? (
            <View style={styles.formContainer}>
              <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: 2 }]}>
                Enter Mobile Number
              </Text>
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginBottom: spacing.md }]}>
                We will send a 6-digit one-time verification code
              </Text>

              {/* Phone Input Box */}
              <View
                style={[
                  styles.phoneInputRow,
                  {
                    borderColor: colors.borderSubtle,
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: radius.button,
                  },
                ]}
              >
                <View style={[styles.countryChip, { borderRightColor: colors.borderSubtle }]}>
                  <Text style={styles.flagText}>🇮🇳</Text>
                  <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>+91</Text>
                </View>
                <RNTextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={[styles.phoneInput, { color: colors.textPrimary }]}
                />
              </View>

              <Button
                title="Continue with Phone"
                onPress={handleSendOtp}
                loading={loading}
                disabled={phoneNumber.length < 10}
                variant="primary"
                size="lg"
                style={{ marginTop: spacing.sm }}
              />

              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: colors.borderSubtle }]} />
                <Text style={[typography.caption1, { color: colors.textMuted, paddingHorizontal: spacing.sm }]}>
                  OR
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.borderSubtle }]} />
              </View>

              {/* Social OAuth Providers */}
              <Button
                title="Continue with Google"
                onPress={handleGoogleSignIn}
                variant="outline"
                size="lg"
                style={styles.socialBtn}
              />

              <Button
                title="Continue with Apple"
                onPress={handleAppleSignIn}
                variant="outline"
                size="lg"
                style={styles.socialBtn}
              />

              {/* Continue as Guest */}
              <Pressable
                onPress={handleDismiss}
                style={styles.guestLink}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Skip sign in and continue as guest"
              >
                <Text style={[typography.caption1, { color: colors.textMuted }]}>
                  Skip for now — Continue as Guest
                </Text>
              </Pressable>
            </View>
          ) : (
            /* Step 2: OTP Verification Form */
            <View style={styles.formContainer}>
              <Text style={[typography.titleMedium, { color: colors.textPrimary, marginBottom: 2 }]}>
                Enter Verification Code
              </Text>
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginBottom: spacing.md }]}>
                Code sent to +91 {phoneNumber}
              </Text>

              <View
                style={[
                  styles.otpInputBox,
                  {
                    borderColor: colors.primary,
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: radius.card,
                  },
                ]}
              >
                <RNTextInput
                  value={otpCode}
                  onChangeText={setOtpCode}
                  placeholder="0 0 0 0 0 0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  style={[styles.otpInput, { color: colors.textPrimary }]}
                />
              </View>

              <Button
                title="Verify & Sign In"
                onPress={handleVerifyOtp}
                loading={loading}
                disabled={otpCode.length < 6}
                variant="primary"
                size="lg"
                style={{ marginTop: spacing.sm }}
              />

              <View style={styles.otpActionsRow}>
                <Pressable
                  onPress={handleResendOtp}
                  disabled={!canResend}
                  style={styles.resendBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text
                    style={[
                      typography.labelMedium,
                      { color: canResend ? colors.primary : colors.textMuted },
                    ]}
                  >
                    {canResend ? 'Resend OTP' : `Resend in ${countdown}s`}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setStep('phone')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[typography.labelMedium, { color: colors.textMuted, textDecorationLine: 'underline' }]}>
                    Change Number
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          <View style={styles.footerInfo}>
            <ShieldCheck size={16} color={colors.textMuted} />
            <Text style={[typography.caption2, { color: colors.textMuted, textAlign: 'center', marginLeft: 6 }]}>
              Secured by Premika Auth. By logging in, you agree to our Terms & Privacy.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  brandCard: {
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  logo: {
    width: 44,
    height: 44,
    marginBottom: 8,
  },
  formContainer: {
    marginTop: 0,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 10,
  },
  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    borderRightWidth: StyleSheet.hairlineWidth,
    marginRight: 12,
  },
  flagText: {
    fontSize: 16,
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Urbanist_600SemiBold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  socialBtn: {
    marginBottom: 10,
  },
  guestLink: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  otpInputBox: {
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  otpInput: {
    fontSize: 22,
    fontFamily: 'Urbanist_700Bold',
    letterSpacing: 10,
    textAlign: 'center',
    width: '100%',
  },
  otpActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  resendBtn: {
    padding: 4,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
});
