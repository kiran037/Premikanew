/**
 * Premika 2.0 Product Card Semantic Slot Contract
 *
 * Defines the future structural slots, token mappings, and accessibility roles
 * for all catalog, discovery rail, and lookbook product card components.
 *
 * Semantic Slot Mapping:
 * ┌──────────────────────────────────────────────────┐
 * │ [SLOT: Image]                                    │
 * │ - Aspect ratio: MEDIA_ASPECT_RATIOS.productPortrait (0.78)
 * │ - Corner radius: RADIUS.productImage (16px)      │
 * │ - Background: colors.surfaceElevated             │
 * │                                                  │
 * │ [SLOT: Badge] (Top-Left overlay)                 │
 * │ - Sale / New Arrival / Out of Stock              │
 * │ - Typography: typography.discountBadge           │
 * │                                                  │
 * │ [SLOT: Wishlist] (Top-Right overlay)             │
 * │ - Background: colors.glassBg                     │
 * │ - Touch target: min 44pt (hitSlop)               │
 * │ - Haptic intent: 'selection'                     │
 * └──────────────────────────────────────────────────┘
 * │ [SLOT: Category] (Optional top metadata)         │
 * │ - Typography: typography.productCategory         │
 * │ - Color: colors.textTertiary                     │
 * │                                                  │
 * │ [SLOT: Title]                                    │
 * │ - Typography: typography.productName             │
 * │ - Color: colors.textPrimary                      │
 * │                                                  │
 * │ [SLOT: Price Block]                              │
 * │ - Selling Price: typography.priceMedium          │
 * │ - Original Price: typography.originalPrice       │
 * │ - Discount Tag: typography.discountBadge         │
 * │                                                  │
 * │ [SLOT: Quick Action] (Optional cart trigger)     │
 * └──────────────────────────────────────────────────┘
 */

import { Product } from '@/api/types';
import { StyleProp, ViewStyle } from 'react-native';

export interface ProductCardSlots {
  /**
   * Primary image slot configuration
   */
  imageAspectRatio?: number; // Default 0.78
  imageBorderRadius?: number; // Default 16

  /**
   * Status overlay badges
   */
  showDiscountBadge?: boolean;
  showOutOfStockBadge?: boolean;
  showNewArrivalBadge?: boolean;

  /**
   * Wishlist floating action
   */
  showWishlistAction?: boolean;

  /**
   * Metadata & details
   */
  showCategory?: boolean;
  showRating?: boolean;
  titleNumberOfLines?: number; // Default 1

  /**
   * Interactive behavior
   */
  interactivePressScale?: number; // Default 0.98
}

export interface ProductCardContractProps {
  product: Product;
  slots?: ProductCardSlots;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onWishlistPress?: () => void;
  onQuickAddPress?: () => void;
}
