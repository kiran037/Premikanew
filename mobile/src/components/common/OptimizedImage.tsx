/**
 * Premika Optimized Image Loader Component
 * Handles remote images, relative backend paths, local assets, placeholder skeletons,
 * fade-in transitions, dimension stability, and fallback defaults
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ImageProps,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTheme } from '@/hooks/useTheme';
import { ENV } from '@/config/env';

export interface OptimizedImageProps extends Omit<ImageProps, 'source' | 'style'> {
  source?: string | ImageSourcePropType | null;
  fallbackSource?: ImageSourcePropType;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ImageStyle | ViewStyle>;
  aspectRatio?: number;
}

const DEFAULT_LOGO_FALLBACK = require('../../../assets/logos/logo.png');

/**
 * Resolves raw source inputs (relative URL, absolute URL, asset number, object)
 * into a valid React Native ImageSourcePropType.
 */
export function resolveImageSource(
  source: string | ImageSourcePropType | null | undefined,
  fallback: ImageSourcePropType = DEFAULT_LOGO_FALLBACK
): { sourceProp: ImageSourcePropType; isLocalAsset: boolean } {
  if (!source || source === '/placeholder.svg') {
    return { sourceProp: fallback, isLocalAsset: typeof fallback === 'number' };
  }

  // 1. Local require(...) asset number
  if (typeof source === 'number') {
    return { sourceProp: source, isLocalAsset: true };
  }

  // 2. String URL / Path
  if (typeof source === 'string') {
    const trimmed = source.trim();
    if (!trimmed || trimmed === '/placeholder.svg') {
      return { sourceProp: fallback, isLocalAsset: typeof fallback === 'number' };
    }

    // Absolute HTTP(S), local file URI, or base64 data URI
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('file://') ||
      trimmed.startsWith('data:')
    ) {
      return { sourceProp: { uri: trimmed }, isLocalAsset: false };
    }

    // Relative backend path (e.g. /Chand/Chand1.png or Chand/Chand1.png)
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    const baseApiUrl = ENV.API_URL.replace(/\/+$/, '');
    return { sourceProp: { uri: `${baseApiUrl}${cleanPath}` }, isLocalAsset: false };
  }

  // 3. Object with uri property (e.g. { uri: '...' })
  if (typeof source === 'object' && 'uri' in source) {
    const uriStr = typeof (source as any).uri === 'string' ? (source as any).uri.trim() : '';
    if (!uriStr || uriStr === '/placeholder.svg') {
      return { sourceProp: fallback, isLocalAsset: typeof fallback === 'number' };
    }

    if (
      uriStr.startsWith('http://') ||
      uriStr.startsWith('https://') ||
      uriStr.startsWith('file://') ||
      uriStr.startsWith('data:')
    ) {
      return { sourceProp: source as ImageSourcePropType, isLocalAsset: false };
    }

    const cleanPath = uriStr.startsWith('/') ? uriStr : `/${uriStr}`;
    const baseApiUrl = ENV.API_URL.replace(/\/+$/, '');
    return {
      sourceProp: { ...(source as object), uri: `${baseApiUrl}${cleanPath}` } as ImageSourcePropType,
      isLocalAsset: false,
    };
  }

  return { sourceProp: source as ImageSourcePropType, isLocalAsset: false };
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  fallbackSource = DEFAULT_LOGO_FALLBACK,
  containerStyle,
  aspectRatio,
  style,
  resizeMode = 'cover',
  ...restProps
}) => {
  const { colors } = useTheme();

  const { sourceProp, isLocalAsset } = resolveImageSource(source, fallbackSource);

  const [isLoading, setIsLoading] = useState(!isLocalAsset);
  const [hasError, setHasError] = useState(false);
  const opacity = useSharedValue(isLocalAsset ? 1 : 0);

  // Reset loading & error state whenever source changes (vital for recycled list items)
  useEffect(() => {
    if (isLocalAsset) {
      setIsLoading(false);
      setHasError(false);
      opacity.value = 1;
    } else {
      setIsLoading(true);
      setHasError(false);
      opacity.value = 0;
    }
  }, [source, isLocalAsset]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleLoadSuccess = () => {
    setIsLoading(false);
    setHasError(false);
    opacity.value = withTiming(1, { duration: 250 });
  };

  const handleLoadError = (e: any) => {
    if (__DEV__) {
      const uriStr = typeof source === 'string' ? source : (source as any)?.uri || 'unknown';
      console.warn(`[OptimizedImage] Failed to load image from "${uriStr}". Falling back to default logo.`, e?.nativeEvent?.error);
    }
    setIsLoading(false);
    setHasError(true);
    opacity.value = withTiming(1, { duration: 250 });
  };

  const effectiveSource = hasError ? fallbackSource : sourceProp;
  const effectiveResizeMode = hasError ? 'contain' : resizeMode;

  return (
    <View
      style={[
        styles.container,
        aspectRatio ? { width: '100%', aspectRatio } : null,
        containerStyle,
        style,
      ]}
    >
      {isLoading && !hasError && (
        <Skeleton style={StyleSheet.absoluteFillObject} borderRadius={0} />
      )}
      <Animated.Image
        source={effectiveSource}
        onLoad={handleLoadSuccess}
        onError={handleLoadError}
        resizeMode={effectiveResizeMode}
        style={[
          StyleSheet.absoluteFillObject,
          styles.image,
          hasError ? { backgroundColor: colors.surfaceElevated, padding: 16 } : null,
          animatedStyle,
        ]}
        {...restProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
