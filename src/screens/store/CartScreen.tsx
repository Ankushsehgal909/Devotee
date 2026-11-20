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
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from '../../components/common/Icon';
import { CommonAppBackgroundScreen } from '../../components/common/CommonAppBackgroundScreen';
import { LinearGradient } from '../../components/common/LinearGradient';
import { useCartStore } from '../../store/useCartStore';
import { resolveLocalizedText } from '../../utils/localization';
import { localImages, getProductImageUrl } from '../../constants/images';

const QUICK_COUPONS = ['VEDIC10', 'SHUBH10', 'FESTIVE20'];

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

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || promoInput).trim().toUpperCase();
    if (!code) return;
    const success = applyCoupon(code);
    if (success) {
      setPromoInput(code);
      setPromoMessage(`Shubh! Vedic coupon ${code} applied successfully.`);
    } else {
      Alert.alert(
        'Invalid Coupon',
        'Try "VEDIC10", "SHUBH10", or "FESTIVE20" for divine savings.',
      );
    }
  };

  const handleToggleGift = () => {
    const nextVal = !isGiftActive;
    setIsGiftActive(nextVal);
    items.forEach((item) => {
      toggleSacredGift(item.id, nextVal, giftNote);
    });
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Sacred Basket?',
      'Are you sure you want to remove all items from your basket?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearCart },
      ],
    );
  };

  // If cart is empty
  if (items.length === 0) {
    return (
      <CommonAppBackgroundScreen
        safeAreaEdges={['top', 'left', 'right']}
        resizeMode="stretch"
      >
        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon family="material" name="arrow-back" size={24} color="#6B0E1E" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Sacred Basket</Text>
            <Text style={styles.headerSubtitle}>0 Consecrated Dravyas</Text>
          </View>
        </View>

        <View style={styles.emptyContainer}>
          {/* Central Medallion Badge */}
          <View style={styles.emptyMedallionOuter}>
            <View style={styles.emptyMedallionInner}>
              <Icon
                family="material-community"
                name="shopping-outline"
                size={44}
                color="#6B0E1E"
              />
            </View>
          </View>

          <Text style={styles.emptyTitle}>Your Sacred Basket is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Add consecrated puja samagri, certified A2 Gir Cow Ghee, hand-cast brass lamps, or spiritual gift hampers to proceed.
          </Text>

          <Image
            source={localImages.divider}
            style={styles.sacredDivider}
            resizeMode="contain"
          />

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('StoreHome')}
          >
            <LinearGradient
              colors={['#8B1528', '#5A0C1A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.exploreBtnGradient}
            >
              <Icon
                family="material-community"
                name="store"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.exploreBtnText}>Explore Consecrated Store</Text>
              <Icon
                family="material"
                name="arrow-forward"
                size={16}
                color="#FFFFFF"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </CommonAppBackgroundScreen>
    );
  }

  const freeDeliveryThreshold = 499;
  const isFreeDeliveryUnlocked = subtotal >= freeDeliveryThreshold;
  const amountNeeded = Math.round(freeDeliveryThreshold - subtotal);
  const progressRatio = Math.min(1, subtotal / freeDeliveryThreshold);

  return (
    <CommonAppBackgroundScreen
      safeAreaEdges={['top', 'left', 'right']}
      resizeMode="stretch"
    >
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon family="material" name="arrow-back" size={24} color="#6B0E1E" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Sacred Basket</Text>
          <Text style={styles.headerSubtitle}>
            {items.length} {items.length === 1 ? 'Item' : 'Items'} • Consecrated Dravyas
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleClearCart}
          style={styles.clearBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon family="material" name="delete-sweep" size={20} color="#6B0E1E" />
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Free Delivery Progress Banner */}
        <View style={styles.deliveryProgressCard}>
          <View style={styles.deliveryHeaderRow}>
            <View style={styles.deliveryIconCircle}>
              <Icon
                family="material-community"
                name={isFreeDeliveryUnlocked ? 'truck-check' : 'truck-fast'}
                size={18}
                color={isFreeDeliveryUnlocked ? '#16A34A' : '#B45309'}
              />
            </View>
            <View style={{ flex: 1 }}>
              {isFreeDeliveryUnlocked ? (
                <Text style={styles.deliveryUnlockedTitle}>
                  Free Consecrated Delivery Unlocked!
                </Text>
              ) : (
                <Text style={styles.deliveryLockedTitle}>
                  Add ₹{amountNeeded} more for <Text style={{ fontWeight: '800' }}>Free Consecrated Delivery</Text>
                </Text>
              )}
              <Text style={styles.deliverySub}>
                {isFreeDeliveryUnlocked
                  ? 'All items sanctified and packed in blessed tamper-proof boxes.'
                  : 'Orders above ₹499 qualify for complimentary holy courier dispatch.'}
              </Text>
            </View>
          </View>

          {/* Progress Bar Track */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.round(progressRatio * 100)}%`,
                  backgroundColor: isFreeDeliveryUnlocked ? '#16A34A' : '#B45309',
                },
              ]}
            />
          </View>
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>Sacred Items ({items.length})</Text>
          <Text style={styles.sectionHeaderSubtitle}>Blessed Dravyas</Text>
        </View>

        {/* Itemized List */}
        {items.map((cartItem) => {
          const itemTitle = resolveLocalizedText(
            cartItem.product.title,
            'Consecrated Samagri',
          );
          const itemImg =
            cartItem.product.imageUrl || getProductImageUrl(cartItem.product);
          const itemPrice = (cartItem.unitPriceMinor * cartItem.quantity) / 100;
          const unitPrice = cartItem.unitPriceMinor / 100;

          return (
            <View key={cartItem.id} style={styles.cartItemCard}>
              <View style={styles.itemRow}>
                <Image
                  source={{ uri: itemImg }}
                  style={styles.itemThumb}
                  resizeMode="cover"
                />

                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {itemTitle}
                  </Text>
                  {Boolean(cartItem.variantTitle) && (
                    <View style={styles.variantChip}>
                      <Text style={styles.variantBadgeText}>
                        Size: {cartItem.variantTitle}
                      </Text>
                    </View>
                  )}
                  <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>₹{itemPrice.toFixed(0)}</Text>
                    {cartItem.quantity > 1 && (
                      <Text style={styles.unitPriceText}>
                        (₹{unitPrice.toFixed(0)} each)
                      </Text>
                    )}
                  </View>
                </View>

                {/* Stepper + Delete Action */}
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => removeItem(cartItem.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon
                      family="material"
                      name="delete-outline"
                      size={18}
                      color="#DC2626"
                    />
                  </TouchableOpacity>

                  <View style={styles.stepper}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() =>
                        updateQuantity(cartItem.id, cartItem.quantity - 1)
                      }
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Icon family="material" name="remove" size={14} color="#6B0E1E" />
                    </TouchableOpacity>
                    <Text style={styles.stepperQty}>{cartItem.quantity}</Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() =>
                        updateQuantity(cartItem.id, cartItem.quantity + 1)
                      }
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Icon family="material" name="add" size={14} color="#6B0E1E" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* Sacred Gifting Toggle Card */}
        <View style={styles.giftCard}>
          <TouchableOpacity
            style={styles.giftToggleRow}
            onPress={handleToggleGift}
            activeOpacity={0.8}
          >
            <View style={styles.giftIconCircle}>
              <Icon
                family="material-community"
                name="gift-outline"
                size={20}
                color="#6B0E1E"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.giftTitle}>
                Consecrated Gift for Family / Temple
              </Text>
              <Text style={styles.giftSubtitle}>
                Includes sacred kalava thread, Ganga Jal sprinkling, and customized blessing card
              </Text>
            </View>
            <Icon
              family="material-community"
              name={
                isGiftActive
                  ? 'checkbox-marked-circle'
                  : 'checkbox-blank-circle-outline'
              }
              size={22}
              color={isGiftActive ? '#6B0E1E' : '#A3988C'}
            />
          </TouchableOpacity>

          {isGiftActive && (
            <View style={styles.giftInputBox}>
              <Text style={styles.inputMiniLabel}>Personalized Blessing Message:</Text>
              <TextInput
                style={styles.giftTextInput}
                placeholder="Enter personal blessing note"
                placeholderTextColor="#A3988C"
                value={giftNote}
                onChangeText={(txt) => {
                  setGiftNote(txt);
                  items.forEach((item) => toggleSacredGift(item.id, true, txt));
                }}
                multiline
                numberOfLines={2}
              />
            </View>
          )}
        </View>

        {/* Vedic Coupon & Shubh Promo Box */}
        <View style={styles.promoCard}>
          <View style={styles.promoHeader}>
            <Icon family="material" name="local-offer" size={16} color="#6B0E1E" />
            <Text style={styles.promoTitle}>Vedic Coupon / Shubh Promo</Text>
          </View>

          <View style={styles.promoRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter coupon code"
              placeholderTextColor="#A3988C"
              value={promoInput}
              onChangeText={setPromoInput}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => handleApplyCoupon()}
              activeOpacity={0.8}
            >
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Apply Coupons */}
          <View style={styles.quickCouponsRow}>
            <Text style={styles.quickCouponLabel}>Try:</Text>
            {QUICK_COUPONS.map((code) => (
              <TouchableOpacity
                key={code}
                onPress={() => handleApplyCoupon(code)}
                style={styles.quickCouponChip}
              >
                <Text style={styles.quickCouponText}>{code}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {Boolean(couponCode) && (
            <View style={styles.appliedRow}>
              <Icon family="material" name="check-circle" size={15} color="#16A34A" />
              <Text style={styles.appliedText}>
                Coupon <Text style={{ fontWeight: '800' }}>{couponCode}</Text> applied ({discountPercentage}% off)!
              </Text>
            </View>
          )}
        </View>

        {/* Dakshina & Price Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Dakshina & Price Summary</Text>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Basket Subtotal</Text>
            <Text style={styles.breakdownVal}>₹{subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Vedic Consecration & Packing</Text>
            <Text style={[styles.breakdownVal, { color: '#16A34A' }]}>
              FREE (Shubh)
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Holy Delivery Charges</Text>
            <Text style={styles.breakdownVal}>
              {delivery === 0 ? (
                <Text style={{ color: '#16A34A', fontWeight: '700' }}>FREE</Text>
              ) : (
                `₹${delivery.toFixed(2)}`
              )}
            </Text>
          </View>

          {discount > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: '#16A34A' }]}>
                Vedic Promo Discount
              </Text>
              <Text style={[styles.breakdownVal, { color: '#16A34A', fontWeight: '700' }]}>
                -₹{discount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalSub}>Inclusive of all sacred taxes</Text>
            </View>
            <Text style={styles.totalVal}>₹{grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Trust Badges Banner */}
        <View style={styles.trustBanner}>
          <View style={styles.trustItem}>
            <Icon family="material" name="verified" size={15} color="#16A34A" />
            <Text style={styles.trustText}>100% Pure Dravyas</Text>
          </View>
          <View style={styles.trustItem}>
            <Icon family="material" name="spa" size={15} color="#16A34A" />
            <Text style={styles.trustText}>Temple Sanctified</Text>
          </View>
          <View style={styles.trustItem}>
            <Icon family="material" name="lock" size={15} color="#16A34A" />
            <Text style={styles.trustText}>Secure Checkout</Text>
          </View>
        </View>

        {/* Proceed to Checkout Action Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('StoreCheckout')}
        >
          <LinearGradient
            colors={['#8B1528', '#5A0C1A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkoutBtnGradient}
          >
            <Text style={styles.checkoutBtnText}>
              Proceed to Sacred Checkout (₹{grandTotal.toFixed(0)})
            </Text>
            <Icon family="material" name="arrow-forward" size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </CommonAppBackgroundScreen>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 8,
    paddingBottom: 6,
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#7A6E63',
    fontWeight: '500',
    marginTop: 1,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#FDECE7',
  },
  clearText: {
    fontSize: 12,
    color: '#6B0E1E',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 8,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyMedallionOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: '#ECC77B',
    backgroundColor: 'rgba(255, 248, 235, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  emptyMedallionInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1.5,
    borderColor: '#DFBF7C',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: typography.fontFamilySerif,
    fontWeight: '700',
    color: '#6B0E1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#7A6E63',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sacredDivider: {
    width: 140,
    height: 18,
    alignSelf: 'center',
    marginVertical: 12,
    opacity: 0.85,
  },
  exploreBtn: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 8,
    elevation: 3,
    shadowColor: '#6B0E1E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  exploreBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 24,
    gap: 8,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  deliveryProgressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE5D8',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  deliveryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  deliveryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryUnlockedTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  deliveryLockedTitle: {
    fontSize: 13,
    color: '#341118',
    fontWeight: '600',
  },
  deliverySub: {
    fontSize: 11,
    color: '#7A6E63',
    marginTop: 1,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F3EDE4',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#341118',
    fontFamily: typography.fontFamilySerif,
  },
  sectionHeaderSubtitle: {
    fontSize: 11.5,
    color: '#B45309',
    fontWeight: '600',
  },
  cartItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE5D8',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemThumb: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#FAF5EE',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2A1F1D',
    lineHeight: 18,
  },
  variantChip: {
    backgroundColor: '#FAF5EE',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 3,
  },
  variantBadgeText: {
    fontSize: 10.5,
    color: '#7A6E63',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6B0E1E',
  },
  unitPriceText: {
    fontSize: 11,
    color: '#8A7E73',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 64,
  },
  deleteBtn: {
    padding: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8DFD5',
  },
  stepperBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepperQty: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B0E1E',
    paddingHorizontal: 4,
  },
  giftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE5D8',
    marginVertical: 6,
  },
  giftToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  giftIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDECE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#341118',
  },
  giftSubtitle: {
    fontSize: 11,
    color: '#7A6E63',
    marginTop: 1,
    lineHeight: 15,
  },
  giftInputBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0E7DD',
  },
  inputMiniLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B0E1E',
    marginBottom: 4,
  },
  giftTextInput: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8DFD5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#2A1F1D',
    minHeight: 52,
    textAlignVertical: 'top',
  },
  promoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE5D8',
    marginVertical: 6,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  promoTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#341118',
  },
  promoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  promoInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8DFD5',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#2A1F1D',
  },
  applyBtn: {
    backgroundColor: '#6B0E1E',
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 12,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  quickCouponsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  quickCouponLabel: {
    fontSize: 11,
    color: '#8A7E73',
    fontWeight: '600',
  },
  quickCouponChip: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8DFD5',
  },
  quickCouponText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#6B0E1E',
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  appliedText: {
    fontSize: 11.5,
    color: '#16A34A',
    fontWeight: '600',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE5D8',
    marginVertical: 8,
  },
  breakdownTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
    marginBottom: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  breakdownLabel: {
    fontSize: 12.5,
    color: '#8A7E73',
  },
  breakdownVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2A1F1D',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0E7DD',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#6B0E1E',
  },
  totalSub: {
    fontSize: 10.5,
    color: '#8A7E73',
    marginTop: 1,
  },
  totalVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
  },
  trustBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingVertical: 10,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E8DFD5',
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#341118',
  },
  checkoutBtn: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#6B0E1E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  checkoutBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 8,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
