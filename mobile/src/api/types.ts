/**
 * Centralized API Data Types & DTO Definitions
 */

export interface SizeOption {
  label: string;
  inStock: boolean;
}

export interface HeightOption {
  label: string;
  value: string;
  default?: boolean;
}

export interface Review {
  name: string;
  date: string;
  rating: number;
  comment: string;
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  shortDescription: string;
  longDescription: string;
  images: string[];
  category: string;
  inStock: boolean;
  sizes: SizeOption[];
  heights?: HeightOption[];
  reviews?: Review[];
  gender?: string;
  hasHeightOption?: boolean;
  isCombo?: boolean;
  featured?: boolean;
  newArrival?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedProductsResponse {
  items: Product[];
  pagination: PaginationInfo;
}

export type SortOption = 'featured' | 'price-low' | 'price-high' | 'name' | 'newest';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  newArrival?: boolean;
  sort?: SortOption | string;
}

export interface CouponValidationResult {
  valid: boolean;
  code?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount?: number;
  message?: string;
}

export interface CustomerProfile {
  id: string;
  supabaseUserId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface CustomerAddress {
  id: string;
  customerId?: string;
  name?: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
  addressType?: 'home' | 'office' | 'other';
}

export interface ServerCartItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  selectedSize?: string;
  selectedHeight?: string;
}

export interface ServerCartResponse {
  items: ServerCartItem[];
  subtotal: number;
}

export interface CustomerOrderItem {
  id?: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedHeight?: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  itemsCount?: number;
  items?: CustomerOrderItem[];
  shippingAddress?: CustomerAddress;
}

