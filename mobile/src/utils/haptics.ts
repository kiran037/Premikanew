/**
 * Premika 2.0 Centralized iOS Native Haptic Feedback System
 * Wraps expo-haptics with platform safety and semantic feedback intents.
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticIntent =
  | 'selection'
  | 'lightImpact'
  | 'mediumImpact'
  | 'heavyImpact'
  | 'success'
  | 'warning'
  | 'error';

export const haptic = {
  /**
   * Light impact for subtle touch feedback (chips, list item taps, tab switches)
   */
  light: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
  },
  lightImpact: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
  },

  /**
   * Medium impact for primary actions (Add to Cart, Buy Now, Save Address, Place Order)
   */
  medium: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }
  },
  mediumImpact: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }
  },

  /**
   * Heavy impact for significant state changes (modal confirm, delete actions)
   */
  heavy: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}
    }
  },
  heavyImpact: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}
    }
  },

  /**
   * Selection feedback for pickers, segmented controls, radio choices, variant chips
   */
  selection: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
  },

  /**
   * Notification success feedback (order placed, profile saved, coupon applied)
   */
  success: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
  },

  /**
   * Notification warning feedback
   */
  warning: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
    }
  },

  /**
   * Notification error feedback (validation failure, payment error)
   */
  error: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
    }
  },

  /**
   * Trigger by semantic intent string
   */
  trigger: (intent: HapticIntent) => {
    switch (intent) {
      case 'selection':
        return haptic.selection();
      case 'lightImpact':
        return haptic.light();
      case 'mediumImpact':
        return haptic.medium();
      case 'heavyImpact':
        return haptic.heavy();
      case 'success':
        return haptic.success();
      case 'warning':
        return haptic.warning();
      case 'error':
        return haptic.error();
    }
  },
};
