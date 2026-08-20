/**
 * Premika 2.0 Global Application Sidebar Drawer Component
 * Premium iOS sheet/drawer experience with gesture tracking, spring dismissal, and existing routes.
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  BackHandler,
  useWindowDimensions,
  Image,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  X,
  Sparkles,
  Flame,
  LayoutGrid,
  Heart,
  ShoppingBag,
  Package,
  MapPin,
  Settings,
  HelpCircle,
  ShieldCheck,
  User,
  LogIn,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSidebarStore } from '@/store/sidebar-store';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import { Badge } from '@/components/ui/Badge';
import { SPRING } from '@/theme/motion';
import { haptic } from '@/utils/haptics';

export const SidebarDrawer: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { colors, typography, spacing, radius, isDark } = useTheme();

  const isOpen = useSidebarStore((state) => state.isOpen);
  const closeSidebar = useSidebarStore((state) => state.closeSidebar);

  const customer = useAuthStore((state) => state.customer);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signOut = useAuthStore((state) => state.signOut);

  const wishlistCount = useWishlistStore((state) => state.items.length);
  const cartCount = useCartStore((state) => state.getItemCount());

  const drawerWidth = Math.min(windowWidth * 0.82, 340);

  const translateX = useSharedValue(-drawerWidth);
  const backdropOpacity = useSharedValue(0);

  const handleDismiss = useCallback(() => {
    closeSidebar();
  }, [closeSidebar]);

  useEffect(() => {
    if (isOpen) {
      translateX.value = withSpring(0, SPRING.standard);
      backdropOpacity.value = withTiming(1, { duration: 220 });
    } else {
      translateX.value = -drawerWidth;
      backdropOpacity.value = 0;
    }
  }, [isOpen, drawerWidth, translateX, backdropOpacity]);

  // Hardware Back Handler on Android
  useEffect(() => {
    if (!isOpen) return;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleDismiss();
      return true;
    });
    return () => backHandler.remove();
  }, [isOpen, handleDismiss]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX < -60 || event.velocityX < -400) {
        translateX.value = withSpring(-drawerWidth, SPRING.snappy, () => {
          runOnJS(handleDismiss)();
        });
        backdropOpacity.value = withTiming(0, { duration: 180 });
      } else {
        translateX.value = withSpring(0, SPRING.standard);
      }
    });

  const animatedDrawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const navigateTo = (route: string) => {
    haptic.selection();
    handleDismiss();
    setTimeout(() => {
      router.push(route as any);
    }, 150);
  };

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      handleDismiss();
      await signOut();
    } else {
      navigateTo('/auth');
    }
  };

  if (!isOpen) return null;

  const displayName = customer
    ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.phone || customer.email || 'Customer'
    : 'Welcome to Premika';

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleDismiss}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close navigation drawer"
          />
        </Animated.View>

        {/* Gesture Drawer */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.drawerSurface,
              {
                width: drawerWidth,
                backgroundColor: colors.surface,
                paddingTop: insets.top + spacing.sm,
                paddingBottom: insets.bottom + spacing.md,
                borderRightColor: colors.border,
                borderRightWidth: StyleSheet.hairlineWidth,
              },
              animatedDrawerStyle,
            ]}
            accessibilityViewIsModal={true}
          >
            {/* Drawer Header */}
            <View style={[styles.headerRow, { paddingHorizontal: spacing.lg, paddingBottom: spacing.md }]}>
              <View style={styles.brandRow}>
                <Image
                  source={require('../../../assets/logos/logo.png')}
                  style={styles.brandLogo}
                  resizeMode="contain"
                />
                <Text style={[typography.titleMedium, { color: colors.primary, fontWeight: '700', marginLeft: spacing.xs }]}>
                  PREMIKA
                </Text>
              </View>

              <Pressable
                onPress={handleDismiss}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.closeBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close menu"
              >
                <X size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Profile Glance Card */}
            <Pressable
              onPress={() => navigateTo('/(tabs)/account')}
              style={[
                styles.userGlance,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  marginHorizontal: spacing.lg,
                  marginBottom: spacing.md,
                  borderRadius: radius.md,
                },
              ]}
            >
              <View style={[styles.avatarBox, { backgroundColor: isAuthenticated ? colors.primary : colors.accent }]}>
                {customer?.avatarUrl ? (
                  <Image source={{ uri: customer.avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <User size={18} color={isAuthenticated ? '#FFFFFF' : colors.primary} />
                )}
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={[typography.labelLarge, { color: colors.textPrimary }]} numberOfLines={1}>
                  {displayName}
                </Text>
                <Text style={[typography.caption1, { color: colors.textTertiary }]}>
                  {isAuthenticated ? 'View account details' : 'Sign in for full access'}
                </Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </Pressable>

            <ScrollView
              contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
              showsVerticalScrollIndicator={false}
            >
              {/* SECTION: SHOP */}
              <Text style={[typography.caption1, styles.sectionTitle, { color: colors.textTertiary }]}>
                SHOP & COLLECTIONS
              </Text>

              <Pressable onPress={() => navigateTo('/(tabs)/categories')} style={styles.menuRow}>
                <View style={styles.menuRowLeft}>
                  <LayoutGrid size={18} color={colors.primary} />
                  <Text style={[typography.bodyMedium, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                    All Categories
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </Pressable>

              <Pressable onPress={() => navigateTo('/(tabs)')} style={styles.menuRow}>
                <View style={styles.menuRowLeft}>
                  <Sparkles size={18} color={colors.primary} />
                  <Text style={[typography.bodyMedium, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                    New Arrivals
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </Pressable>

              <Pressable onPress={() => navigateTo('/(tabs)')} style={styles.menuRow}>
                <View style={styles.menuRowLeft}>
                  <Flame size={18} color={colors.primary} />
                  <Text style={[typography.bodyMedium, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                    Featured Collection
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </Pressable>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* SECTION: ACCOUNT & COMMERCE */}
              <Text style={[typography.caption1, styles.sectionTitle, { color: colors.textTertiary }]}>
                MY ACCOUNT
              </Text>

              <Pressable onPress={() => navigateTo('/(tabs)/cart')} style={styles.menuRow}>
                <View style={styles.menuRowLeft}>
                  <ShoppingBag size={18} color={colors.primary} />
                  <Text style={[typography.bodyMedium, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                    Shopping Cart
                  </Text>
                </View>
                {cartCount > 0 ? (
                  <Badge content={cartCount > 9 ? '9+' : cartCount} variant="primary" size="sm" />
                ) : (
                  <ChevronRight size={16} color={colors.textMuted} />
                )}
              </Pressable>

              <Pressable onPress={() => navigateTo('/(tabs)/wishlist')} style={styles.menuRow}>
                <View style={styles.menuRowLeft}>
                  <Heart size={18} color={colors.primary} />
                  <Text style={[typography.bodyMedium, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                    My Wishlist
                  </Text>
                </View>
                {wishlistCount > 0 ? (
                  <Badge content={wishlistCount > 9 ? '9+' : wishlistCount} variant="primary" size="sm" />
                ) : (
                  <ChevronRight size={16} color={colors.textMuted} />
                )}
              </Pressable>

              <Pressable
                onPress={() => (isAuthenticated ? navigateTo('/orders') : navigateTo('/auth'))}
                style={styles.menuRow}
              >
                <View style={styles.menuRowLeft}>
                  <Package size={18} color={colors.primary} />
                  <Text style={[typography.bodyMedium, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                    Order History
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </Pressable>

              <Pressable
                onPress={() => (isAuthenticated ? navigateTo('/addresses') : navigateTo('/auth'))}
                style={styles.menuRow}
              >
                <View style={styles.menuRowLeft}>
                  <MapPin size={18} color={colors.primary} />
                  <Text style={[typography.bodyMedium, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                    Saved Addresses
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </Pressable>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* SECTION: SUPPORT & PREFERENCES */}
              <Text style={[typography.caption1, styles.sectionTitle, { color: colors.textTertiary }]}>
                SUPPORT & PREFERENCES
              </Text>

              <Pressable onPress={() => navigateTo('/settings')} style={styles.menuRow}>
                <View style={styles.menuRowLeft}>
                  <Settings size={18} color={colors.primary} />
                  <Text style={[typography.bodyMedium, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                    Settings
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </Pressable>

              <Pressable onPress={() => navigateTo('/settings')} style={styles.menuRow}>
                <View style={styles.menuRowLeft}>
                  <HelpCircle size={18} color={colors.primary} />
                  <Text style={[typography.bodyMedium, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                    Help & Customer Support
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </Pressable>

              <Pressable onPress={() => navigateTo('/settings')} style={styles.menuRow}>
                <View style={styles.menuRowLeft}>
                  <ShieldCheck size={18} color={colors.primary} />
                  <Text style={[typography.bodyMedium, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                    Privacy & Terms
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </Pressable>
            </ScrollView>

            {/* Footer Auth Action */}
            <View style={[styles.footer, { borderTopColor: colors.border, paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}>
              <Pressable
                onPress={handleAuthAction}
                style={[
                  styles.authBtn,
                  {
                    backgroundColor: isAuthenticated ? 'transparent' : colors.primary,
                    borderColor: isAuthenticated ? colors.border : colors.primary,
                    borderRadius: radius.button,
                  },
                ]}
              >
                {isAuthenticated ? (
                  <>
                    <LogOut size={16} color="#EF4444" />
                    <Text style={[typography.labelMedium, { color: '#EF4444', marginLeft: spacing.xs }]}>
                      Sign Out
                    </Text>
                  </>
                ) : (
                  <>
                    <LogIn size={16} color="#FFFFFF" />
                    <Text style={[typography.labelMedium, { color: '#FFFFFF', marginLeft: spacing.xs }]}>
                      Sign In / Register
                    </Text>
                  </>
                )}
              </Pressable>

              <Text style={[typography.caption2, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm }]}>
                Premika 2.0 • iOS Shell Edition
              </Text>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
  },
  drawerSurface: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 24,
    height: 24,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userGlance: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    minHeight: 44,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderWidth: 1,
  },
});
