/**
 * Premika 2.0 Semantic Border & Separator Specifications
 * Quiet, restrained hairline borders for subtle structural separation.
 */

import { StyleSheet, ViewStyle } from 'react-native';

export const BORDER_WIDTH = {
  hairline: StyleSheet.hairlineWidth,
  thin: 1,
  medium: 1.5,
  thick: 2,
} as const;

export const BORDERS = {
  separator: {
    borderBottomWidth: BORDER_WIDTH.hairline,
  } as ViewStyle,
  subtle: {
    borderWidth: BORDER_WIDTH.hairline,
  } as ViewStyle,
  card: {
    borderWidth: BORDER_WIDTH.hairline,
  } as ViewStyle,
  control: {
    borderWidth: BORDER_WIDTH.thin,
  } as ViewStyle,
  focus: {
    borderWidth: BORDER_WIDTH.medium,
  } as ViewStyle,
  selected: {
    borderWidth: BORDER_WIDTH.medium,
  } as ViewStyle,
} as const;

export type BorderWidth = keyof typeof BORDER_WIDTH;
