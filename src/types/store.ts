export interface ProductVariant {
  id: string;
  title: string; // e.g. "500g", "1kg", "Pack of 3"
  priceMinor: number;
  compareAtPriceMinor?: number;
  inventoryCount: number;
  sku: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  description: string;
  category: string;
  priceMinor: number;
  compareAtPriceMinor?: number;
  imageUrl: string;
  images: string[];
  isPurityCertified: boolean;
  labCertificateBatch?: string;
  vedicUsageGuide?: string;
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  variantTitle?: string;
  unitPriceMinor: number;
  quantity: number;
  // Sacred Gifting features
  isSacredGift?: boolean;
  giftBlessingNote?: string;
  recipientName?: string;
}

export interface Cart {
  items: CartItem[];
  subtotalMinor: number;
  deliveryFeeMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
  couponCode?: string;
}

export type OrderStatus =
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'dispatched'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  totalMinor: number;
  status: OrderStatus;
  deliveryAddress: string;
  trackingNumber?: string;
  courierPartner?: string;
  estimatedDeliveryDate?: string;
  invoiceUrl?: string;
  createdAt: string;
}
