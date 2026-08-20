/**
 * Premika 2.0 Section Layout Primitive
 * Standardizes vertical section margins, inner gutters, and content grouping.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface SectionProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  marginTop?: number;
  marginBottom?: number;
  testID?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  style,
  marginTop,
  marginBottom,
  testID,
}) => {
  const { spacing } = useTheme();

  return (
    <View
      style={[
        styles.section,
        {
          marginTop: marginTop !== undefined ? marginTop : spacing.section,
          marginBottom: marginBottom !== undefined ? marginBottom : 0,
        },
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    width: '100%',
  },
});
