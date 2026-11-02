import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { DevoteeDashboardSkeleton, SkeletonLine } from '../../components/common/Skeleton';
import { useAuthStore } from '../../store/useAuthStore';
import { useDevoteeAccount, useFamilyMembers, useBookings, useOrders } from '../../api/customer';
import { FamilyMember } from '../../types';
import { resolveLocalizedText } from '../../utils/localization';

export const DevoteeDashboardScreen: React.FC = () => {
  const { user, logout } = useAuthStore();

  // Real API hooks
  const { data: serverUser, isLoading: isUserLoading } = useDevoteeAccount();
  const { data: familyMembers, isLoading: isFamilyLoading } = useFamilyMembers();
  const { data: bookings } = useBookings();
  const { data: orders } = useOrders();

  const devoteeName = resolveLocalizedText(serverUser?.name || user?.name, 'Devotee');
  const devoteeGotra = resolveLocalizedText(serverUser?.gotra || user?.gotra, 'Kashyap');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Devotee Spiritual Portal" showBack={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isUserLoading ? (
          <DevoteeDashboardSkeleton />
        ) : (
          <>
            {/* Devotee Profile Header Banner */}
            <View style={styles.profileBanner}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>{devoteeName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.profileName}>{devoteeName}</Text>
                  <Badge
                    label="Verified"
                    variant="success"
                    icon={<Icon family="material-community" name="shield-check" size={12} color={colors.success} />}
                  />
                </View>
                <Text style={styles.profileGotra}>{devoteeGotra} Gotra | Sanatan Devotee</Text>
                <Text style={styles.profilePhone}>{serverUser?.phone || user?.phone || '+91 98765 43210'}</Text>
              </View>
            </View>

            {/* 2x2 Metric Counters (from web dashboard analysis) */}
            <View style={styles.metricsGrid}>
              <Card style={styles.metricCard}>
                <Icon family="material-community" name="fire" size={22} color={colors.primary} />
                <Text style={styles.metricVal}>{bookings?.length ?? 0}</Text>
                <Text style={styles.metricLabel}>Puja Bookings</Text>
              </Card>

              <Card style={styles.metricCard}>
                <Icon family="material-community" name="package-variant" size={22} color={colors.goldAccent} />
                <Text style={styles.metricVal}>{orders?.length ?? 0}</Text>
                <Text style={styles.metricLabel}>Samagri Orders</Text>
              </Card>

              <Card style={styles.metricCard}>
                <Icon family="material" name="favorite-border" size={22} color={colors.danger} />
                <Text style={styles.metricVal}>0</Text>
                <Text style={styles.metricLabel}>Saved Wishlist</Text>
              </Card>

              <Card style={styles.metricCard}>
                <Icon family="material" name="group" size={22} color={colors.success} />
                <Text style={styles.metricVal}>{familyMembers?.length ?? 0}</Text>
                <Text style={styles.metricLabel}>Family Gotras</Text>
              </Card>
            </View>

            {/* Saved Family Sankalp Tree Card */}
            <Card variant="warm" style={styles.familyCard}>
              <View style={styles.familyHeader}>
                <Icon family="material" name="group" size={18} color={colors.primary} />
                <Text style={styles.familyTitle}>Registered Family Sankalp Tree</Text>
              </View>
              <Text style={styles.familySubtitle}>
                These family members are auto-recited during your Vedic ritual Sankalps.
              </Text>

              {isFamilyLoading ? (
                <View style={{ gap: 8, paddingVertical: spacing.sm }}>
                  <SkeletonLine width="60%" height={14} />
                  <SkeletonLine width="80%" height={10} />
                </View>
              ) : familyMembers && familyMembers.length > 0 ? (
                familyMembers.map((member: FamilyMember) => (
                  <View key={member.id} style={styles.memberItem}>
                    <View>
                      <Text style={styles.memberName}>{member.name} ({member.relation.toUpperCase()})</Text>
                      <Text style={styles.memberMeta}>
                        Gotra: {member.gotra || 'Kashyap'} | Nakshatra: {member.nakshatra || 'Rohini'}
                      </Text>
                    </View>
                    {member.isSankalpHead && (
                      <Badge label="Head" variant="sacred" />
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.emptyFamily}>
                  <Text style={styles.emptyFamilyText}>
                    No secondary family members registered yet. Add family members to include them in sacred sankalps.
                  </Text>
                </View>
              )}
            </Card>

            {/* Portal Nav Actions List */}
            <Card style={styles.actionsCard}>
              <TouchableOpacity style={styles.actionRow} onPress={() => {}}>
                <Icon family="material" name="payment" size={20} color={colors.primary} />
                <Text style={styles.actionText}>Payment and Refund Ledger</Text>
                <Icon family="material" name="chevron-right" size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.actionRow} onPress={() => {}}>
                <Icon family="material" name="chat-bubble-outline" size={20} color={colors.primary} />
                <Text style={styles.actionText}>Devotee HelpDesk and Chat Support</Text>
                <Icon family="material" name="chevron-right" size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.actionRow} onPress={() => {}}>
                <Icon family="material" name="person-outline" size={20} color={colors.primary} />
                <Text style={styles.actionText}>Edit Vedic Profile and Addresses</Text>
                <Icon family="material" name="chevron-right" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </Card>

            {/* Logout Button */}
            <Button
              title="Sign Out Devotee Session"
              variant="outline"
              onPress={logout}
              leftIcon={<Icon family="material" name="logout" size={16} color={colors.primary} />}
              style={styles.logoutBtn}
            />
          </>
        )}
      </ScrollView>
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
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarInitial: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    ...typography.h4,
    color: '#FFFFFF',
  },
  profileGotra: {
    ...typography.caption,
    color: '#FDE68A',
    marginTop: 2,
  },
  profilePhone: {
    ...typography.captionSmall,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  metricVal: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: 4,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  familyCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  familyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  familyTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  familySubtitle: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderWarm,
  },
  memberName: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  memberMeta: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },
  emptyFamily: {
    paddingVertical: spacing.sm,
  },
  emptyFamilyText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  actionsCard: {
    padding: 0,
    marginBottom: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  actionText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderWarm,
    marginLeft: 48,
  },
  logoutBtn: {
    marginTop: spacing.sm,
  },
});
