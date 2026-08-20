/**
 * Premika 2.0 Ambient Depth & Elevation System
 * Soft, restrained Apple iOS native shadows and ambient light elevations
 */

import { ViewStyle, Platform } from 'react-native';

export const SHADOWS: Record<string, ViewStyle> = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: Platform.OS === 'ios' ? 0.04 : 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.05 : 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.07 : 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: Platform.OS === 'ios' ? 0.10 : 0.24,
    shadowRadius: 16,
    elevation: 6,
  },
  sheet: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.10 : 0.20,
    shadowRadius: 18,
    elevation: 12,
  },
  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === 'ios' ? 0.14 : 0.30,
    shadowRadius: 24,
    elevation: 10,
  },
  glass: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.06 : 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  prominent: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === 'ios' ? 0.10 : 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
};

export type Shadow = keyof typeof SHADOWS;
