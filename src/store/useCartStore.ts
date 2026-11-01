import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  couponCode?: string;
  discountPercentage: number;
  addItem: (product: Product, quantity?: number, variantId?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  toggleSacredGift: (itemId: string, isGift: boolean, note?: string) => void;
  applyCoupon: (code: string) => boolean;
  clearCart: () => void;
  // Computed helpers
  getSubtotalMinor: () => number;
  getDeliveryFeeMinor: () => number;
  getDiscountMinor: () => number;
  getTotalMinor: () => number;
  getTotalCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  couponCode: undefined,
  discountPercentage: 0,

  addItem: (product: Product, quantity = 1, variantId?: string) => {
    const items = get().items;
    const existingIndex = items.findIndex(
      (item) => item.productId === product.id && item.variantId === variantId
    );

    const variant = product.variants.find((v) => v.id === variantId);
    const unitPriceMinor = variant ? variant.priceMinor : product.priceMinor;

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += quantity;
      set({ items: updated });
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${variantId || 'default'}-${Date.now()}`,
        productId: product.id,
        product,
        variantId,
        variantTitle: variant?.title,
        unitPriceMinor,
        quantity,
      };
      set({ items: [...items, newItem] });
    }
  },

  removeItem: (itemId: string) => {
    set({ items: get().items.filter((item) => item.id !== itemId) });
  },

  updateQuantity: (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set({
      items: get().items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    });
  },

  toggleSacredGift: (itemId: string, isGift: boolean, note?: string) => {
    set({
      items: get().items.map((item) =>
        item.id === itemId
          ? { ...item, isSacredGift: isGift, giftBlessingNote: note }
          : item
      ),
    });
  },

  applyCoupon: (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (normalized === 'VEDIC10' || normalized === 'SHUBH10') {
      set({ couponCode: normalized, discountPercentage: 10 });
      return true;
    }
    if (normalized === 'FESTIVE20') {
      set({ couponCode: normalized, discountPercentage: 20 });
      return true;
    }
    return false;
  },

  clearCart: () => {
    set({ items: [], couponCode: undefined, discountPercentage: 0 });
  },

  getSubtotalMinor: () => {
    return get().items.reduce(
      (acc, item) => acc + item.unitPriceMinor * item.quantity,
      0
    );
  },

  getDeliveryFeeMinor: () => {
    const subtotal = get().getSubtotalMinor();
    if (subtotal === 0) return 0;
    // Free delivery on orders above ₹499 (49900 paise)
    return subtotal >= 49900 ? 0 : 5000; // ₹50 delivery
  },

  getDiscountMinor: () => {
    const subtotal = get().getSubtotalMinor();
    return Math.round((subtotal * get().discountPercentage) / 100);
  },

  getTotalMinor: () => {
    const subtotal = get().getSubtotalMinor();
    const delivery = get().getDeliveryFeeMinor();
    const discount = get().getDiscountMinor();
    return Math.max(0, subtotal + delivery - discount);
  },

  getTotalCount: () => {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  },
}));
