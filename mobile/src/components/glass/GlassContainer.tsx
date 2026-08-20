/**
 * Premika Liquid Glass Container Component
 * Full-screen or modal backdrop container providing frosted overlay effects
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { GlassSurface } from './GlassSurface';

export interface GlassContainerProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'surface' | 'floating' | 'navigation';
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  style,
  variant = 'surface',
}) => {
  return (
    <GlassSurface variant={variant} style={[styles.container, style]}>
      {children}
    </GlassSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
