import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useCartStore } from '../../store/useCartStore';
import { resolveLocalizedText } from '../../utils/localization';
import { getProductImageUrl } from '../../constants/images';

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    items,
    updateQuantity,
    removeItem,
    toggleSacredGift,
    applyCoupon,
    couponCode,
    discountPercentage,
    getSubtotalMinor,
    getDeliveryFeeMinor,
    getDiscountMinor,
    getTotalMinor,
    clearCart,
  } = useCartStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Sacred gifting local state
  const [isGiftActive, setIsGiftActive] = useState(false);
  const [giftNote, setGiftNote] = useState('');

  const subtotal = getSubtotalMinor() / 100;
  const delivery = getDeliveryFeeMinor() / 100;
  const discount = getDiscountMinor() / 100;
  const grandTotal = getTotalMinor() / 100;

  const handleApplyCoupon = () => {
    if (!promoInput.trim()) return;
    const success = applyCoupon(promoInput.trim());
    if (success) {
      setPromoMessage(`Shubh! Vedic coupon applied successfully.`);
    } else {
      Alert.alert('Invalid Coupon', 'Try "VEDIC10", "SHUBH10", or "FESTIVE20" for savings.');
    }
  };

  const handleToggleGift = () => {
    const nextVal = !isGiftActive;
    setIsGiftActive(nextVal);
    items.forEach((item) => {
      toggleSacredGift(item.id, nextVal, giftNote);
    });
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Header title="Sacred Basket" />
        <View style={styles.emptyContainer}>
          <Icon
            family="material-community"
            name="shopping-outline"
            size={56}
            color={colors.textMuted}
          />
          <Text style={styles.emptyTitle}>Your Sacred Basket is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Add consecrated samagri, A2 Vedic Ghee, brass lamps, or puja kits to proceed.
          </Text>
          <Button
            title="Explore Consecrated Store"
            variant="primary"
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('StoreHome')}
            leftIcon={<Icon family="material-community" name="store" size={18} color="#FFFFFF" />}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header
        title="Sacred Basket"
        rightAction={
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Free Delivery Progress Bar */}
        {subtotal < 499 ? (
          <Card variant="warm" style={styles.deliveryProgressCard}>
            <Text style={styles.deliveryProgressText}>
              Add ₹{Math.round(499 - subtotal)} more for <Text style={{ fontWeight: '700' }}>Free Consecrated Delivery</Text>
            </Text>
          </Card>
        ) : (
          <Card variant="warm" style={styles.deliveryProgressCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon family="material-community" name="truck-check" size={18} color={colors.success} />
              <Text style={[styles.deliveryProgressText, { color: colors.success }]}>
                Free Express Delivery unlocked for this order!
              </Text>
            </View>
          </Card>
        )}

        {/* Itemized List */}
        <Text style={styles.sectionHeader}>Sacred Items ({items.length})</Text>
        {items.map((cartItem) => {
          const itemTitle = resolveLocalizedText(
            cartItem.product.title,
            'Consecrated Samagri'
          );
          const itemImg = cartItem.product.imageUrl || getProductImageUrl(cartItem.product);
          const itemPrice = (cartItem.unitPriceMinor * cartItem.quantity) / 100;

          return (
            <Card key={cartItem.id} style={styles.cartItemCard}>
              <View style={styles.itemRow}>
                <Image source={{ uri: itemImg }} style={styles.itemThumb} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {itemTitle}
                  </Text>
                  {cartItem.variantTitle && (
                    <Text style={styles.variantBadge}>Size: {cartItem.variantTitle}</Text>
                  )}
                  <Text style={styles.itemPrice}>₹{itemPrice}</Text>
                </View>

                {/* Stepper + Delete */}
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => removeItem(cartItem.id)}
                  >
                    <Icon family="material" name="delete-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>

                  <View style={styles.stepper}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                    >
                      <Icon family="material" name="remove" size={14} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.stepperQty}>{cartItem.quantity}</Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                    >
                      <Icon family="material" name="add" size={14} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>
          );
        })}

        {/* Sacred Gifting Toggle Card */}
        <Card variant="warm" style={styles.giftCard}>
          <TouchableOpacity style={styles.giftToggleRow} onPress={handleToggleGift}>
            <View style={styles.giftLeft}>
              <Icon family="material-community" name="gift-outline" size={22} color={colors.primary} />
              <View>
                <Text style={styles.giftTitle}>Consecrated Gift for Family / Temple</Text>
                <Text style={styles.giftSubtitle}>
                  Includes consecrated packing & personalized blessing note
                </Text>
              </View>
            </View>
            <Icon
              family="material-community"
              name={isGiftActive ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
              size={24}
              color={isGiftActive ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>

          {isGiftActive && (
            <View style={styles.giftInputBox}>
              <TextInput
                style={styles.giftTextInput}
                placeholder="Enter personal blessing note (e.g. For peace & prosperity in the new home)"
                placeholderTextColor={colors.textMuted}
                value={giftNote}
                onChangeText={(txt) => {
                  setGiftNote(txt);
                  items.forEach((item) => toggleSacredGift(item.id, true, txt));
                }}
                multiline
              />
            </View>
          )}
        </Card>

        {/* Promo Code Box */}
        <Card style={styles.promoCard}>
          <Text style={styles.promoTitle}>Vedic Coupon / Shubh Promo</Text>
          <View style={styles.promoRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter VEDIC10 or SHUBH10"
              placeholderTextColor={colors.textMuted}
              value={promoInput}
              onChangeText={setPromoInput}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCoupon}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
          {couponCode && (
            <View style={styles.appliedRow}>
              <Icon family="material" name="check-circle" size={14} color={colors.success} />
              <Text style={styles.appliedText}>
                Coupon <Text style={{ fontWeight: '700' }}>{couponCode}</Text> active ({discountPercentage}% off)
              </Text>
            </View>
          )}
        </Card>

        {/* Price Breakdown */}
        <Card style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Dakshina & Price Summary</Text>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Basket Subtotal</Text>
            <Text style={styles.breakdownVal}>₹{subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Vedic Consecration & Packing</Text>
            <Text style={[styles.breakdownVal, { color: colors.success }]}>FREE (Shubh)</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Delivery Charges</Text>
            <Text style={styles.breakdownVal}>
              {delivery === 0 ? (
                <Text style={{ color: colors.success }}>FREE</Text>
              ) : (
                `₹${delivery.toFixed(2)}`
              )}
            </Text>
          </View>

          {discount > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: colors.success }]}>
                Vedic Promo Discount
              </Text>
              <Text style={[styles.breakdownVal, { color: colors.success }]}>
                -₹{discount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalVal}>₹{grandTotal.toFixed(2)}</Text>
          </View>
        </Card>

        {/* Checkout Button */}
        <Button
          title={`Proceed to Sacred Checkout (₹${grandTotal.toFixed(2)})`}
          variant="primary"
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('StoreCheckout')}
          rightIcon={<Icon family="material" name="arrow-forward" size={18} color="#FFFFFF" />}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSand,
  },
  clearText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  exploreBtn: {
    marginTop: spacing.md,
  },
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  deliveryProgressCard: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  deliveryProgressText: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  sectionHeader: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cartItemCard: {
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemThumb: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  variantBadge: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  itemActions: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  deleteBtn: {
    padding: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCream,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  stepperBtn: {
    padding: 6,
  },
  stepperQty: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    paddingHorizontal: 8,
  },
  giftCard: {
    marginVertical: spacing.sm,
    padding: spacing.md,
  },
  giftToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  giftLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  giftTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  giftSubtitle: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  giftInputBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderWarm,
  },
  giftTextInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    ...typography.bodySmall,
    color: colors.textPrimary,
    minHeight: 50,
  },
  promoCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  promoTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  promoRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  promoInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },
  applyBtnText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  appliedText: {
    ...typography.captionSmall,
    color: colors.success,
  },
  breakdownCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  breakdownTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  breakdownVal: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderWarm,
    marginVertical: spacing.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  totalVal: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '800',
  },
  checkoutBtn: {
    marginBottom: spacing.xl,
  },
});
