/**
 * Premika Gesture-Driven Interactive Bottom Sheet Component
 * iOS-Native Spring Physics, Detents, Drag-to-Dismiss & Interactive Backdrop Tracking
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  BackHandler,
  useWindowDimensions,
  StyleProp,
  ViewStyle,
  Modal,
  Platform,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { SPRING } from '@/theme/motion';
import { haptic } from '@/utils/haptics';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  detent?: 'compact' | 'medium' | 'large' | 'fitContent';
  showHandle?: boolean;
  dismissOnBackdropPress?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  detent = 'fitContent',
  showHandle = true,
  dismissOnBackdropPress = true,
  children,
  style,
  testID,
}) => {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors, typography, radius, spacing, isDark } = useTheme();

  const translateY = useSharedValue(windowHeight);
  const backdropOpacity = useSharedValue(0);

  const getDetentHeight = useCallback(() => {
    switch (detent) {
      case 'compact':
        return windowHeight * 0.35;
      case 'medium':
        return windowHeight * 0.55;
      case 'large':
        return windowHeight * 0.85;
      default:
        return undefined;
    }
  }, [detent, windowHeight]);

  const handleDismiss = useCallback(() => {
    haptic.light();
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      haptic.light();
      translateY.value = withSpring(0, SPRING.standard);
      backdropOpacity.value = withTiming(1, { duration: 220 });
    } else {
      translateY.value = windowHeight;
      backdropOpacity.value = 0;
    }
  }, [visible, windowHeight, translateY, backdropOpacity]);

  // Android Hardware Back Button Integration
  useEffect(() => {
    if (!visible) return;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleDismiss();
      return true;
    });
    return () => backHandler.remove();
  }, [visible, handleDismiss]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      } else {
        // Subtle resistance when dragging upward past top detent
        translateY.value = event.translationY * 0.2;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 600) {
        translateY.value = withSpring(windowHeight, SPRING.snappy, () => {
          runOnJS(handleDismiss)();
        });
        backdropOpacity.value = withTiming(0, { duration: 180 });
      } else {
        translateY.value = withSpring(0, SPRING.standard);
      }
    });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, windowHeight * 0.5], [1, 0], 'clamp') * backdropOpacity.value,
  }));

  if (!visible) return null;

  const detentHeight = getDetentHeight();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
      testID={testID}
    >
      <View style={styles.container}>
        {/* Animated Dimming Backdrop */}
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={dismissOnBackdropPress ? handleDismiss : undefined}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close sheet backdrop"
          />
        </Animated.View>

        {/* Gesture-Driven Sheet Surface */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.sheetSurface,
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: radius.sheet,
                borderTopRightRadius: radius.sheet,
                paddingBottom: insets.bottom + spacing.md,
                maxHeight: windowHeight * 0.90,
                height: detentHeight,
                borderColor: colors.border,
                borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
              },
              animatedSheetStyle,
              style,
            ]}
            accessibilityViewIsModal={true}
          >
            {/* Grabber Handle */}
            {showHandle && (
              <View style={styles.handleContainer}>
                <View
                  style={[
                    styles.handle,
                    { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.18)' },
                  ]}
                />
              </View>
            )}

            {/* Optional Sheet Header with Title and Close Button */}
            {title ? (
              <View style={[styles.headerRow, { borderBottomColor: colors.border, paddingHorizontal: spacing.lg }]}>
                <Text style={[typography.headline, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                  {title}
                </Text>
                <Pressable
                  onPress={handleDismiss}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.closeBtn}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <X size={20} color={colors.textMuted} />
                </Pressable>
              </View>
            ) : null}

            {/* Sheet Body Content */}
            <View style={styles.content}>{children}</View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetSurface: {
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
    overflow: 'hidden',
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  content: {
    width: '100%',
  },
});
