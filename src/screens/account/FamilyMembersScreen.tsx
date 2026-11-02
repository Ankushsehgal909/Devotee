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
  useFamilyMembers,
  useAddFamilyMember,
  useUpdateFamilyMember,
  useDeleteFamilyMember,
} from '../../api/customer';
import { FamilyMember } from '../../types';
import { resolveLocalizedText } from '../../utils/localization';

const RELATIONS = [
  'Self',
  'Spouse',
  'Father',
  'Mother',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Grandfather',
  'Grandmother',
  'Other',
];

const RASHIS = [
  'Mesha (Aries)',
  'Vrishabha (Taurus)',
  'Mithuna (Gemini)',
  'Karka (Cancer)',
  'Simha (Leo)',
  'Kanya (Virgo)',
  'Tula (Libra)',
  'Vrishchika (Scorpio)',
  'Dhanu (Sagittarius)',
  'Makara (Capricorn)',
  'Kumbha (Aquarius)',
  'Meena (Pisces)',
];

const NAKSHATRAS = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
];

export const FamilyMembersScreen: React.FC = () => {
  const { data: members, isLoading, refetch } = useFamilyMembers();
  const addMutation = useAddFamilyMember();
  const updateMutation = useUpdateFamilyMember();
  const deleteMutation = useDeleteFamilyMember();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Self');
  const [gotra, setGotra] = useState('');
  const [rashi, setRashi] = useState('');
  const [nakshatra, setNakshatra] = useState('');

  const openAddModal = () => {
    setEditingMember(null);
    setName('');
    setRelation('Self');
    setGotra('');
    setRashi('');
    setNakshatra('');
    setModalVisible(true);
  };

  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setName(resolveLocalizedText(member.name, ''));
    setRelation(member.relation || 'Self');
    setGotra(member.gotra || '');
    setRashi(member.rashi || '');
    setNakshatra(member.nakshatra || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter the family member name.');
      return;
    }

    try {
      if (editingMember) {
        await updateMutation.mutateAsync({
          id: editingMember.id,
          name: name.trim(),
          relation: relation.toLowerCase(),
          gotra: gotra.trim() || undefined,
          rashi: rashi || undefined,
          nakshatra: nakshatra || undefined,
        });
        Alert.alert('Updated', 'Family member updated successfully.');
      } else {
        await addMutation.mutateAsync({
          name: name.trim(),
          relation: relation.toLowerCase(),
          gotra: gotra.trim() || undefined,
          rashi: rashi || undefined,
          nakshatra: nakshatra || undefined,
        });
        Alert.alert('Saved', 'Family member added to Sankalp Tree.');
      }
      setModalVisible(false);
      refetch();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save family member.');
    }
  };

  const handleDelete = (member: FamilyMember) => {
    Alert.alert(
      'Remove Family Member',
      `Are you sure you want to remove ${resolveLocalizedText(member.name, 'this member')} from your Sacred Sankalp Tree?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(member.id);
              refetch();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not remove member.');
            }
          },
        },
      ]
    );
  };

  const renderMember = ({ item }: { item: FamilyMember }) => {
    const memberName = resolveLocalizedText(item.name, 'Family Member');
    const memberRelation = item.relation ? item.relation.toUpperCase() : 'FAMILY';

    return (
      <Card style={styles.memberCard}>
        <View style={styles.memberTop}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.memberName}>{memberName}</Text>
              <Badge label={memberRelation} variant="sacred" />
              {item.isSankalpHead && (
                <Badge label="Sankalp Karta" variant="success" />
              )}
            </View>

            <View style={styles.metaRow}>
              {item.gotra && (
                <Text style={styles.metaItem}>Gotra: {item.gotra}</Text>
              )}
              {item.rashi && (
                <Text style={styles.metaItem}>Rashi: {item.rashi}</Text>
              )}
              {item.nakshatra && (
                <Text style={styles.metaItem}>Nakshatra: {item.nakshatra}</Text>
              )}
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => openEditModal(item)}>
              <Icon family="material" name="edit" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item)}>
              <Icon family="material" name="delete-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header
        title="Family Sankalp Tree"
        rightAction={
          <TouchableOpacity onPress={openAddModal}>
            <Text style={styles.headerAddBtn}>+ Add</Text>
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading Vedic Sankalp Tree...</Text>
        </View>
      ) : (
        <FlatList
          data={members || []}
          keyExtractor={(item) => item.id}
          renderItem={renderMember}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          ListHeaderComponent={
            <Card variant="warm" style={styles.bannerCard}>
              <View style={styles.bannerRow}>
                <Icon family="material" name="group" size={24} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerTitle}>Registered Gotra & Shastric Lineage</Text>
                  <Text style={styles.bannerSubtitle}>
                    All members registered here are recited during your ceremony Sankalp by the presiding Acharya for ancestral blessings.
                  </Text>
                </View>
              </View>
            </Card>
          }
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Icon family="material" name="group" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Family Members Added</Text>
              <Text style={styles.emptySubtext}>
                Add your family members, their Gotra and Nakshatras so they can be blessed during puja Sankalps.
              </Text>
              <Button
                title="Add First Family Member"
                variant="primary"
                style={{ marginTop: spacing.md }}
                onPress={openAddModal}
                leftIcon={<Icon family="material" name="add" size={18} color="#FFFFFF" />}
              />
            </Card>
          }
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMember ? 'Edit Family Member' : 'Add to Sankalp Tree'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon family="material" name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ramesh Chandra Sharma"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.inputLabel}>Relationship</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                {RELATIONS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.chip, relation === r && styles.chipActive]}
                    onPress={() => setRelation(r)}
                  >
                    <Text style={[styles.chipText, relation === r && styles.chipTextActive]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Gotra</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Kashyap, Bharadwaj, Vashishta"
                placeholderTextColor={colors.textMuted}
                value={gotra}
                onChangeText={setGotra}
              />

              <Text style={styles.inputLabel}>Rashi (Zodiac Moon Sign)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                {RASHIS.map((ras) => (
                  <TouchableOpacity
                    key={ras}
                    style={[styles.chip, rashi === ras && styles.chipActive]}
                    onPress={() => setRashi(ras)}
                  >
                    <Text style={[styles.chipText, rashi === ras && styles.chipTextActive]}>
                      {ras}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Nakshatra (Birth Star)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                {NAKSHATRAS.map((nak) => (
                  <TouchableOpacity
                    key={nak}
                    style={[styles.chip, nakshatra === nak && styles.chipActive]}
                    onPress={() => setNakshatra(nak)}
                  >
                    <Text style={[styles.chipText, nakshatra === nak && styles.chipTextActive]}>
                      {nak}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Button
                title={
                  addMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : 'Save into Sankalp Tree'
                }
                variant="primary"
                loading={addMutation.isPending || updateMutation.isPending}
                onPress={handleSave}
                style={{ marginTop: spacing.lg, marginBottom: spacing.md }}
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
  headerAddBtn: {
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
  bannerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
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
  memberCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  memberTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberName: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 6,
  },
  metaItem: {
    ...typography.captionSmall,
    color: colors.textMuted,
    backgroundColor: colors.bgCream,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBtn: {
    padding: 6,
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
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  chipsScroll: {
    marginBottom: spacing.xs,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    backgroundColor: colors.bgSand,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
