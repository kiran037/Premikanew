/**
 * Premika 2.0 Home Editorial Brand Intro Component
 * Clean, minimal brand statement providing calm editorial context without taking over the screen.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { haptic } from '@/utils/haptics';

export const HomeBrandIntro: React.FC = () => {
  const router = useRouter();
  const { colors, typography, spacing, radius } = useTheme();

  const handleExplore = () => {
    haptic.selection();
    router.push('/(tabs)/categories');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.borderSubtle,
          borderRadius: radius.cardLarge,
          marginHorizontal: spacing.page,
          marginTop: spacing.sm,
          marginBottom: spacing.xs,
          padding: spacing.cardInner + 2,
        },
      ]}
    >
      <View style={styles.badgeRow}>
        <View
          style={[
            styles.sparkleBadge,
            {
              backgroundColor: colors.accent,
              borderRadius: radius.pill,
            },
          ]}
        >
          <Sparkles size={13} color={colors.primary} />
          <Text
            style={[
              typography.caption1,
              {
                color: colors.primary,
                fontWeight: '700',
                marginLeft: 4,
                letterSpacing: 0.8,
              },
            ]}
          >
            ATELIER 2026
          </Text>
        </View>
      </View>

      <Text
        style={[
          typography.titleMedium,
          {
            color: colors.textPrimary,
            fontWeight: '700',
            marginTop: spacing.xs,
            letterSpacing: -0.3,
          },
        ]}
      >
        Artisanal Indian Luxury
      </Text>

      <Text
        style={[
          typography.bodySmall,
          {
            color: colors.textSecondary,
            marginTop: 2,
            lineHeight: 18,
          },
        ]}
      >
        Curated ethnic ensembles, handcrafted embroidery & modern drape silhouettes.
      </Text>

      <Pressable
        onPress={handleExplore}
        style={styles.exploreBtn}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Explore Collections"
      >
        <Text
          style={[
            typography.labelMedium,
            {
              color: colors.primary,
              fontWeight: '600',
            },
          ]}
        >
          Explore Collections
        </Text>
        <ArrowRight size={14} color={colors.primary} style={{ marginLeft: 4 }} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
});
