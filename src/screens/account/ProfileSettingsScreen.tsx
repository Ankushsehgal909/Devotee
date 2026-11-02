import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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
import { useDevoteeAccount, useUpdateProfile } from '../../api/customer';
import { useAuthStore } from '../../store/useAuthStore';
import { resolveLocalizedText } from '../../utils/localization';

export const ProfileSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { data: serverUser, isLoading } = useDevoteeAccount();
  const updateProfileMutation = useUpdateProfile();

  const [name, setName] = useState('');
  const [gotra, setGotra] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (serverUser || user) {
      setName(resolveLocalizedText(serverUser?.name || user?.name, ''));
      setGotra(resolveLocalizedText(serverUser?.gotra || user?.gotra, ''));
      setEmail(serverUser?.email || user?.email || '');
    }
  }, [serverUser, user]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Devotee name cannot be empty.');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        name: name.trim(),
        gotra: gotra.trim() || undefined,
        email: email.trim() || undefined,
      });
      Alert.alert('Profile Saved', 'Your Vedic devotee profile has been updated.');
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update profile. Try again.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Header title="Vedic Devotee Profile" />
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const phone = serverUser?.phone || user?.phone || '+91 98765 43210';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Vedic Devotee Profile" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar Card */}
        <Card variant="warm" style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarChar}>{name.charAt(0).toUpperCase() || 'D'}</Text>
          </View>
          <Text style={styles.devoteeTitle}>{name || 'Devotee'}</Text>
          <View style={styles.badgeRow}>
            <Badge
              label="Verified Devotee"
              variant="success"
              icon={<Icon family="material-community" name="shield-check" size={12} color={colors.success} />}
            />
            <Badge label="Sanatan Karta" variant="sacred" />
          </View>
        </Card>

        {/* Shastric Profile Form */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionHeading}>Vedic Identity & Gotra</Text>

          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Devotee Name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.fieldLabel}>Devotee Gotra (Lineage)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Kashyap, Bharadwaj, Sandilya"
            placeholderTextColor={colors.textMuted}
            value={gotra}
            onChangeText={setGotra}
          />
          <Text style={styles.hintText}>
            Your Gotra is auto-chanted by the Acharya during puja sankalps.
          </Text>

          <Text style={styles.fieldLabel}>Email Address (For Tax Invoices & Muhurats)</Text>
          <TextInput
            style={styles.input}
            placeholder="devotee@example.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.fieldLabel}>Registered Mobile Number</Text>
          <View style={styles.phoneBox}>
            <Text style={styles.phoneText}>{phone}</Text>
            <Badge label="Active OTP Verified" variant="success" />
          </View>
        </Card>

        {/* Shortcuts to Addresses & Family */}
        <Card style={styles.shortcutsCard}>
          <TouchableOpacity
            style={styles.shortcutRow}
            onPress={() => navigation.navigate('SavedAddresses')}
          >
            <Icon family="material" name="location-on" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.shortcutTitle}>Manage Delivery & Puja Addresses</Text>
              <Text style={styles.shortcutSubtitle}>Home, temple venue, ancestral home</Text>
            </View>
            <Icon family="material" name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.shortcutRow}
            onPress={() => navigation.navigate('FamilyMembers')}
          >
            <Icon family="material" name="group" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.shortcutTitle}>Family Sankalp Tree</Text>
              <Text style={styles.shortcutSubtitle}>Manage family gotras & nakshatras</Text>
            </View>
            <Icon family="material" name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Save Button */}
        <Button
          title={updateProfileMutation.isPending ? 'Updating...' : 'Save Profile Changes'}
          variant="primary"
          loading={updateProfileMutation.isPending}
          onPress={handleSave}
          style={styles.saveBtn}
          leftIcon={<Icon family="material" name="check" size={18} color="#FFFFFF" />}
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
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  avatarCard: {
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarChar: {
    ...typography.h2,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  devoteeTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  formCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionHeading: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
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
  hintText: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  phoneBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgCream,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  phoneText: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  shortcutsCard: {
    marginBottom: spacing.lg,
    padding: 0,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  shortcutTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  shortcutSubtitle: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderWarm,
    marginLeft: 44,
  },
  saveBtn: {
    marginBottom: spacing.xl,
  },
});
