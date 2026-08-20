/**
 * Premika 2.0 Section Header Component
 * Standardizes title, subtitle, optional left icon, and "See All" / action button.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, StyleProp } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { haptic } from '@/utils/haptics';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  paddingHorizontal?: number;
  testID?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  actionTitle,
  onAction,
  style,
  paddingHorizontal,
  testID,
}) => {
  const { colors, typography, spacing } = useTheme();

  const handleAction = () => {
    haptic.light();
    onAction?.();
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: paddingHorizontal !== undefined ? paddingHorizontal : spacing.page,
          marginBottom: spacing.sectionHeader,
        },
        style,
      ]}
      testID={testID}
    >
      <View style={styles.titleGroup}>
        <View style={styles.titleRow}>
          {icon && <View style={[styles.iconBox, { marginRight: spacing.xs }]}>{icon}</View>}
          <Text style={[typography.sectionHeader, { color: colors.textPrimary }]}>
            {title}
          </Text>
        </View>
        {subtitle && (
          <Text style={[typography.sectionSubtitle, { color: colors.textSecondary, marginTop: 2 }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {actionTitle && onAction && (
        <Pressable
          onPress={handleAction}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.actionBtn}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${actionTitle} for ${title}`}
        >
          <Text style={[typography.labelMedium, { color: colors.primary }]}>{actionTitle}</Text>
          <ChevronRight size={14} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
