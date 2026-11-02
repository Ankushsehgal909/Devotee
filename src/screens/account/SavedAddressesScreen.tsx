import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import {
  useAddresses,
  useAddAddress,
  useDeleteAddress,
  UserAddress,
} from '../../api/customer';

export const SavedAddressesScreen: React.FC = () => {
  const { data: addresses, isLoading, refetch } = useAddresses();
  const addMutation = useAddAddress();
  const deleteMutation = useDeleteAddress();

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('');

  const openAddModal = () => {
    setName('');
    setPhone('');
    setStreet('');
    setCity('');
    setState('Uttar Pradesh');
    setPincode('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim() || !street.trim() || !city.trim() || !pincode.trim()) {
      Alert.alert('Required Fields', 'Please complete all address fields.');
      return;
    }

    try {
      await addMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        isDefault: (addresses || []).length === 0,
      });
      setModalVisible(false);
      refetch();
      Alert.alert('Saved', 'Address registered successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save address.');
    }
  };

  const handleDelete = (addr: UserAddress) => {
    Alert.alert(
      'Remove Address',
      `Delete address "${addr.street}, ${addr.city}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(addr.id);
              refetch();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not delete address.');
            }
          },
        },
      ]
    );
  };

  const renderAddress = ({ item }: { item: UserAddress }) => {
    return (
      <Card style={styles.addressCard}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon family="material" name="location-on" size={18} color={colors.primary} />
            <Text style={styles.addressName}>{item.name}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {item.isDefault && <Badge label="Default" variant="success" />}
            <TouchableOpacity onPress={() => handleDelete(item)} style={{ padding: 4 }}>
              <Icon family="material" name="delete-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.addressLine}>{item.street}</Text>
        <Text style={styles.addressLine}>
          {item.city}, {item.state} - {item.pincode}
        </Text>
        <Text style={styles.phoneLine}>Contact: {item.phone}</Text>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header
        title="Saved Addresses"
        rightAction={
          <TouchableOpacity onPress={openAddModal}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching addresses...</Text>
        </View>
      ) : (
        <FlatList
          data={addresses || []}
          keyExtractor={(item) => item.id}
          renderItem={renderAddress}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          ListHeaderComponent={
            <Card variant="warm" style={styles.bannerCard}>
              <Text style={styles.bannerTitle}>Doorstep Puja Venues & Delivery Locations</Text>
              <Text style={styles.bannerSubtitle}>
                Save addresses for home pujas, temple ceremony venues, and consecrated samagri deliveries.
              </Text>
            </Card>
          }
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Icon family="material" name="location-city" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Addresses Saved</Text>
              <Text style={styles.emptySubtext}>
                Save your home or venue address for faster puja bookings and sacred deliveries.
              </Text>
              <Button
                title="Add New Address"
                variant="primary"
                style={{ marginTop: spacing.md }}
                onPress={openAddModal}
                leftIcon={<Icon family="material" name="add" size={18} color="#FFFFFF" />}
              />
            </Card>
          }
        />
      )}

      {/* Add Address Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Address</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon family="material" name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Recipient / Karta Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Full Name"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.inputLabel}>Contact Phone</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="10-digit Mobile Number"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={styles.inputLabel}>House / Street / Colony</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Flat / House No., Landmark, Street"
                placeholderTextColor={colors.textMuted}
                value={street}
                onChangeText={setStreet}
              />

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="City"
                    placeholderTextColor={colors.textMuted}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Pincode</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Pincode"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={pincode}
                    onChangeText={setPincode}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>State</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="State"
                placeholderTextColor={colors.textMuted}
                value={state}
                onChangeText={setState}
              />

              <Button
                title={addMutation.isPending ? 'Saving...' : 'Save Address'}
                variant="primary"
                loading={addMutation.isPending}
                onPress={handleSave}
                style={{ marginTop: spacing.md, marginBottom: spacing.md }}
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
  addBtnText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '700',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  listContent: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  bannerCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  bannerTitle: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: 4,
  },
  bannerSubtitle: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  addressCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  addressName: {
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
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
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
    maxHeight: '85%',
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
  inputLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
});
