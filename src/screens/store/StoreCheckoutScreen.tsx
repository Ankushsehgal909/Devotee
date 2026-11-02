import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
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
import { useAddresses, useAddAddress, useCreateOrder } from '../../api/customer';
import { resolveLocalizedText } from '../../utils/localization';

export const StoreCheckoutScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    items,
    getSubtotalMinor,
    getDeliveryFeeMinor,
    getDiscountMinor,
    getTotalMinor,
    couponCode,
    clearCart,
  } = useCartStore();

  const { data: addresses, isLoading: isAddressesLoading } = useAddresses();
  const addAddressMutation = useAddAddress();
  const createOrderMutation = useCreateOrder();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [deliverySpeed, setDeliverySpeed] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');

  // New address modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPincode, setNewPincode] = useState('');

  const subtotal = getSubtotalMinor() / 100;
  const baseDelivery = getDeliveryFeeMinor() / 100;
  const expressFee = deliverySpeed === 'express' ? 99 : 0;
  const delivery = baseDelivery + expressFee;
  const discount = getDiscountMinor() / 100;
  const totalPayable = subtotal + delivery - discount;

  // Selected address object
  const currentAddress =
    addresses?.find((a) => a.id === selectedAddressId) ||
    addresses?.[0] ||
    null;

  const handleSaveNewAddress = async () => {
    if (!newRecipientName || !newPhone || !newStreet || !newCity || !newPincode) {
      Alert.alert('Required Fields', 'Please complete the recipient name, phone, street, city, and pincode.');
      return;
    }

    try {
      const added = await addAddressMutation.mutateAsync({
        name: newRecipientName,
        phone: newPhone,
        street: newStreet,
        city: newCity,
        state: newState || 'Uttar Pradesh',
        pincode: newPincode,
        isDefault: true,
      });
      setSelectedAddressId(added.id);
      setShowAddressModal(false);
      Alert.alert('Address Saved', 'New delivery destination registered.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save address. Please try again.');
    }
  };

  const handlePlaceOrder = async () => {
    const formattedAddress = currentAddress
      ? `${currentAddress.name}, ${currentAddress.phone}, ${currentAddress.street}, ${currentAddress.city}, ${currentAddress.state} - ${currentAddress.pincode}`
      : 'Devotee Mandir Residence, Varanasi, Uttar Pradesh - 221001';

    try {
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          unitPriceMinor: i.unitPriceMinor,
          title: resolveLocalizedText(i.product.title, 'Samagri Item'),
          isSacredGift: i.isSacredGift,
          giftBlessingNote: i.giftBlessingNote,
        })),
        deliveryAddress: formattedAddress,
        deliverySpeed,
        paymentMethod,
        totalMinor: Math.round(totalPayable * 100),
        couponCode: couponCode || null,
      };

      const result = await createOrderMutation.mutateAsync(orderPayload);
      clearCart();
      const orderId = result?.id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      navigation.navigate('OrderConfirmation', { orderId });
    } catch (err: any) {
      Alert.alert('Order Failed', err.message || 'Unable to complete order. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Sacred Checkout" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step 1: Delivery Address */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon family="material" name="location-on" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>1. Delivery Destination</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAddressModal(true)}>
              <Text style={styles.addAddressLink}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {currentAddress ? (
            <View style={styles.addressBox}>
              <View style={styles.addressTop}>
                <Text style={styles.recipientName}>{currentAddress.name}</Text>
                <Badge label="Delivery" variant="neutral" />
              </View>
              <Text style={styles.addressLine}>{currentAddress.street}</Text>
              <Text style={styles.addressLine}>
                {currentAddress.city}, {currentAddress.state} - {currentAddress.pincode}
              </Text>
              <Text style={styles.phoneLine}>Contact: {currentAddress.phone}</Text>
            </View>
          ) : (
            <View style={styles.addressBox}>
              <Text style={styles.recipientName}>Default Devotee Address</Text>
              <Text style={styles.addressLine}>Shri Kashi Vishwanath Dham Road</Text>
              <Text style={styles.addressLine}>Varanasi, Uttar Pradesh - 221001</Text>
              <Text style={styles.phoneLine}>Contact: +91 98765 43210</Text>
            </View>
          )}
        </Card>

        {/* Step 2: Delivery Speed */}
        <Card style={styles.sectionCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs }}>
            <Icon family="material-community" name="truck-fast-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>2. Delivery Speed & Packaging</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.optionChoice,
              deliverySpeed === 'standard' && styles.optionChoiceSelected,
            ]}
            onPress={() => setDeliverySpeed('standard')}
          >
            <View style={styles.radioRow}>
              <Icon
                family="material-community"
                name={deliverySpeed === 'standard' ? 'radiobox-marked' : 'radiobox-blank'}
                size={20}
                color={deliverySpeed === 'standard' ? colors.primary : colors.textMuted}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.optionHeading}>Standard Sacred Delivery (3-5 Days)</Text>
                <Text style={styles.optionDesc}>
                  Eco-friendly sacred jute packaging with Ganga Jal spray
                </Text>
              </View>
              <Text style={styles.optionPrice}>
                {baseDelivery === 0 ? 'FREE' : `₹${baseDelivery}`}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionChoice,
              deliverySpeed === 'express' && styles.optionChoiceSelected,
            ]}
            onPress={() => setDeliverySpeed('express')}
          >
            <View style={styles.radioRow}>
              <Icon
                family="material-community"
                name={deliverySpeed === 'express' ? 'radiobox-marked' : 'radiobox-blank'}
                size={20}
                color={deliverySpeed === 'express' ? colors.primary : colors.textMuted}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.optionHeading}>Sacred Express (24-48 Hours)</Text>
                <Text style={styles.optionDesc}>
                  Priority Temple dispatch with consecrated Tulsi leaf
                </Text>
              </View>
              <Text style={styles.optionPrice}>+₹99</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Step 3: Payment Options */}
        <Card style={styles.sectionCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs }}>
            <Icon family="material" name="payment" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>3. Payment Mode</Text>
          </View>

          <TouchableOpacity
            style={[styles.optionChoice, paymentMethod === 'upi' && styles.optionChoiceSelected]}
            onPress={() => setPaymentMethod('upi')}
          >
            <View style={styles.radioRow}>
              <Icon
                family="material-community"
                name={paymentMethod === 'upi' ? 'radiobox-marked' : 'radiobox-blank'}
                size={20}
                color={paymentMethod === 'upi' ? colors.primary : colors.textMuted}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.optionHeading}>UPI Instant Payment</Text>
                <Text style={styles.optionDesc}>Google Pay, PhonePe, Paytm, BHIM</Text>
              </View>
              <Badge label="Fastest" variant="success" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionChoice, paymentMethod === 'card' && styles.optionChoiceSelected]}
            onPress={() => setPaymentMethod('card')}
          >
            <View style={styles.radioRow}>
              <Icon
                family="material-community"
                name={paymentMethod === 'card' ? 'radiobox-marked' : 'radiobox-blank'}
                size={20}
                color={paymentMethod === 'card' ? colors.primary : colors.textMuted}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.optionHeading}>Credit / Debit Card</Text>
                <Text style={styles.optionDesc}>Visa, MasterCard, RuPay</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionChoice, paymentMethod === 'cod' && styles.optionChoiceSelected]}
            onPress={() => setPaymentMethod('cod')}
          >
            <View style={styles.radioRow}>
              <Icon
                family="material-community"
                name={paymentMethod === 'cod' ? 'radiobox-marked' : 'radiobox-blank'}
                size={20}
                color={paymentMethod === 'cod' ? colors.primary : colors.textMuted}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.optionHeading}>Cash / Dakshina on Delivery</Text>
                <Text style={styles.optionDesc}>Pay securely when receiving sacred package</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Order Items Preview */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Order Summary ({items.length} items)</Text>
          {items.map((i) => (
            <View key={i.id} style={styles.summaryItemRow}>
              <Text style={styles.summaryItemTitle} numberOfLines={1}>
                {i.quantity}x {resolveLocalizedText(i.product.title, 'Samagri')}
              </Text>
              <Text style={styles.summaryItemPrice}>
                ₹{(i.unitPriceMinor * i.quantity) / 100}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Total Amount Payable</Text>
            <Text style={styles.totalPayableVal}>₹{totalPayable.toFixed(2)}</Text>
          </View>
        </Card>

        {/* Place Order CTA */}
        <Button
          title={
            createOrderMutation.isPending
              ? 'Consecrating & Placing Order...'
              : `Confirm & Pay ₹${totalPayable.toFixed(2)}`
          }
          variant="primary"
          style={styles.confirmBtn}
          loading={createOrderMutation.isPending}
          onPress={handlePlaceOrder}
          leftIcon={<Icon family="material-community" name="shield-check" size={18} color="#FFFFFF" />}
        />
      </ScrollView>

      {/* Add Address Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Delivery Address</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Icon family="material" name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.modalInput}
                placeholder="Recipient Full Name"
                value={newRecipientName}
                onChangeText={setNewRecipientName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Phone Number (10 digits)"
                keyboardType="phone-pad"
                value={newPhone}
                onChangeText={setNewPhone}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="House / Flat / Street Name"
                value={newStreet}
                onChangeText={setNewStreet}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={[styles.modalInput, { flex: 1 }]}
                  placeholder="City"
                  value={newCity}
                  onChangeText={setNewCity}
                />
                <TextInput
                  style={[styles.modalInput, { flex: 1 }]}
                  placeholder="Pincode"
                  keyboardType="number-pad"
                  value={newPincode}
                  onChangeText={setNewPincode}
                />
              </View>
              <TextInput
                style={styles.modalInput}
                placeholder="State (e.g. Uttar Pradesh, Maharashtra)"
                value={newState}
                onChangeText={setNewState}
              />

              <Button
                title={addAddressMutation.isPending ? 'Saving...' : 'Save & Select Address'}
                variant="primary"
                loading={addAddressMutation.isPending}
                onPress={handleSaveNewAddress}
                style={{ marginTop: spacing.md }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSand,
  },
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  sectionCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  addAddressLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  addressBox: {
    backgroundColor: colors.bgCream,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
  },
  addressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recipientName: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addressLine: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  phoneLine: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginTop: 4,
  },
  optionChoice: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    backgroundColor: '#FFFFFF',
    marginTop: spacing.xs,
  },
  optionChoiceSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.bgCream,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionHeading: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  optionDesc: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  optionPrice: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryItemTitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  summaryItemPrice: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderWarm,
    marginVertical: spacing.xs,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  totalPayableVal: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '800',
  },
  confirmBtn: {
    marginBottom: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
});
