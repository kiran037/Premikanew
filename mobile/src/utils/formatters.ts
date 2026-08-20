/**
 * Formatting Utilities for Price, Currency, Discounts & Text
 */

export function formatPrice(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function calculateDiscountPercentage(price: number, originalPrice?: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  const discount = ((originalPrice - price) / originalPrice) * 100;
  return Math.round(discount);
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}
