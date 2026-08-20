/**
 * Full-Width Hero Banner Carousel Component
 * Auto-scrolling carousel with pagination dots indicator
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
} from 'react-native';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { useTheme } from '@/hooks/useTheme';

export interface BannerItem {
  id: string;
  image: any;
  title?: string;
  subtitle?: string;
  link?: string;
}

export interface BannerCarouselProps {
  banners?: BannerItem[];
  autoScrollInterval?: number;
}

const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: 'b1',
    image: require('../../../assets/logos/logo.png'),
    title: 'Festive Kurti Collection',
    subtitle: 'Up to 40% OFF on Designer Kurtas',
  },
  {
    id: 'b2',
    image: require('../../../assets/logos/text-logo.png'),
    title: 'Elegant Cotton Sets',
    subtitle: 'Handcrafted Premium Ethnic Wear',
  },
];

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners = DEFAULT_BANNERS,
  autoScrollInterval = 4000,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const { colors, radius, spacing } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const bannerWidth = Math.max(0, windowWidth - spacing.lg * 2);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        scrollViewRef.current?.scrollTo({ x: next * bannerWidth, animated: true });
        return next;
      });
    }, autoScrollInterval);

    return () => clearInterval(timer);
  }, [banners.length, bannerWidth, autoScrollInterval]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / bannerWidth);
    if (slide !== activeIndex && slide >= 0 && slide < banners.length) {
      setActiveIndex(slide);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        contentContainerStyle={{ gap: 0 }}
      >
        {banners.map((item) => (
          <Pressable key={item.id} style={[styles.bannerCard, { width: bannerWidth, borderRadius: radius.xl }]}>
            <OptimizedImage
              source={item.image}
              aspectRatio={2.2}
              resizeMode="contain"
              style={{ borderRadius: radius.xl, backgroundColor: colors.accent }}
            />
          </Pressable>
        ))}
      </ScrollView>

      {/* Pagination Indicator Dots */}
      {banners.length > 1 && (
        <View style={styles.pagination}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === activeIndex ? colors.primary : colors.border,
                  width: index === activeIndex ? 18 : 6,
                  borderRadius: radius.full,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  bannerCard: {
    overflow: 'hidden',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    height: 6,
  },
});
