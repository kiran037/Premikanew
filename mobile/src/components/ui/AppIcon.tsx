/**
 * Premika Centralized AppIcon Component
 * Wraps icon rendering with standard semantic size tokens and prepared for native SF Symbols in Phase 3.
 */

import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import {
  Home,
  LayoutGrid,
  Heart,
  ShoppingCart,
  ShoppingBag,
  User,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Trash2,
  Settings,
  ShieldCheck,
  Package,
  MapPin,
  Truck,
  Star,
  Tag,
  Phone,
  Mail,
  Camera,
  Edit3,
  Lock,
  Info,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Flame,
  Clock,
  LucideIcon,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { IconName, IconSize, resolveIconSize } from '@/theme/icons';

export interface AppIconProps {
  name: IconName;
  size?: IconSize;
  color?: string;
  fill?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const ICON_MAP: Record<IconName, LucideIcon> = {
  'home': Home,
  'grid': LayoutGrid,
  'categories': LayoutGrid,
  'heart': Heart,
  'heart-filled': Heart,
  'cart': ShoppingCart,
  'bag': ShoppingBag,
  'user': User,
  'search': Search,
  'close': X,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  'check': Check,
  'check-circle': CheckCircle2,
  'trash': Trash2,
  'settings': Settings,
  'shield': ShieldCheck,
  'package': Package,
  'pin': MapPin,
  'map-pin': MapPin,
  'truck': Truck,
  'star': Star,
  'tag': Tag,
  'phone': Phone,
  'mail': Mail,
  'camera': Camera,
  'edit': Edit3,
  'lock': Lock,
  'info': Info,
  'refresh': RefreshCw,
  'filter': SlidersHorizontal,
  'sparkles': Sparkles,
  'flame': Flame,
  'clock': Clock,
};

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 'medium',
  color,
  fill = 'transparent',
  strokeWidth = 2,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const IconComponent = ICON_MAP[name] || Info;
  const numSize = resolveIconSize(size);
  const resolvedColor = color || colors.textPrimary;
  const resolvedFill = name === 'heart-filled' ? (color || colors.primary) : fill;

  return (
    <IconComponent
      size={numSize}
      color={resolvedColor}
      fill={resolvedFill}
      strokeWidth={strokeWidth}
      style={style}
      testID={testID}
    />
  );
};
