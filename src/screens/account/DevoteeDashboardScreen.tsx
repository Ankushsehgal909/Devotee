import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { CommonAppBackgroundScreen } from '../../components/common/CommonAppBackgroundScreen';
import { DevoteeDashboardSkeleton, SkeletonLine } from '../../components/common/Skeleton';
import { useAuthStore } from '../../store/useAuthStore';
import {
  useDevoteeAccount,
  useFamilyMembers,
  useBookings,
  useOrders,
} from '../../api/customer';
import { FamilyMember } from '../../types';
import { resolveLocalizedText } from '../../utils/localization';

export const DevoteeDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  // Real live API hooks
  const {
    data: serverUser,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useDevoteeAccount();
  const {
    data: familyMembers,
    isLoading: isFamilyLoading,
    refetch: refetchFamily,
  } = useFamilyMembers();
  const {
    data: bookings,
    refetch: refetchBookings,
  } = useBookings();
  const {
    data: orders,
    refetch: refetchOrders,
  } = useOrders();

  const devoteeName = resolveLocalizedText(
    serverUser?.name || user?.name,
    'Sanatan Devotee'
  );
  const devoteeGotra = resolveLocalizedText(
    serverUser?.gotra || user?.gotra,
    ''
  );
  const devoteePhone = serverUser?.phone || user?.phone || '';
  const devoteeEmail = serverUser?.email || user?.email || '';

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchUser(),
        refetchFamily(),
        refetchBookings(),
        refetchOrders(),
      ]);
    } catch {
      // Ignore network errors on pull-to-refresh
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your devotee session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <CommonAppBackgroundScreen
      safeAreaEdges={['top', 'left', 'right']}
      resizeMode="stretch"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Top Header - Devotee Spiritual Portal */}
        <View style={styles.headerArea}>
          <Text style={styles.headerTitle}>Devotee Spiritual Portal</Text>
          <Text style={styles.headerSubtitle}>
            Your Vedic Journey with VedSarthi
          </Text>
        </View>

        {isUserLoading ? (
          <DevoteeDashboardSkeleton />
        ) : (
          <>
            {/* Top Devotee Identity Card (Crimson Card) */}
            <View style={styles.profileBanner}>
              {/* Subtle temple spires silhouette on right */}
              <View style={styles.templeSilhouetteBox} pointerEvents="none">
                <Icon
                  family="material-community"
                  name="temple-hindu"
                  size={76}
                  color="rgba(255, 255, 255, 0.12)"
                />
              </View>

              {/* Devotee Avatar Circle */}
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>
                  {devoteeName.charAt(0).toUpperCase() || 'D'}
                </Text>
              </View>

              {/* Devotee Details */}
              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.profileName} numberOfLines={1}>
                    {devoteeName}
                  </Text>
                  <View style={styles.verifiedBadge}>
                    <Icon
                      family="material"
                      name="check-circle"
                      size={12}
                      color="#16A34A"
                    />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                </View>

                <Text style={styles.profileGotra} numberOfLines={1}>
                  {devoteeGotra
                    ? `${devoteeGotra} Gotra | Sanatan Devotee`
                    : 'Sanatan Devotee'}
                </Text>

                {Boolean(devoteePhone || devoteeEmail) && (
                  <View style={styles.contactRow}>
                    <Icon
                      family="material-community"
                      name={devoteePhone ? 'phone' : 'email-outline'}
                      size={12}
                      color="rgba(255, 255, 255, 0.85)"
                    />
                    <Text style={styles.profilePhone} numberOfLines={1}>
                      {devoteePhone ? `+91 ${devoteePhone.replace(/^\+?91/, '').trim()}` : devoteeEmail}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* 2x2 Metric Counters Grid */}
            <View style={styles.metricsGrid}>
              {/* 1. Puja Bookings */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.metricCard}
                onPress={() => navigation.navigate('MyBookings')}
              >
                <View style={styles.watermarkIcon} pointerEvents="none">
                  <Icon
                    family="material-community"
                    name="flower-tulip-outline"
                    size={30}
                    color="#C5221F"
                  />
                </View>
                <Icon
                  family="material-community"
                  name="fire"
                  size={26}
                  color="#C5221F"
                />
                <Text style={styles.metricVal}>
                  {bookings?.length ?? 0}
                </Text>
                <Text style={styles.metricLabel}>Puja Bookings</Text>
              </TouchableOpacity>

              {/* 2. Samagri Orders */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.metricCard}
                onPress={() => navigation.navigate('OrderHistory')}
              >
                <View style={styles.watermarkIcon} pointerEvents="none">
                  <Icon
                    family="material-community"
                    name="flower-tulip-outline"
                    size={30}
                    color="#D97706"
                  />
                </View>
                <Icon
                  family="material-community"
                  name="package-variant"
                  size={26}
                  color="#D97706"
                />
                <Text style={styles.metricVal}>
                  {orders?.length ?? 0}
                </Text>
                <Text style={styles.metricLabel}>Samagri Orders</Text>
              </TouchableOpacity>

              {/* 3. Saved Wishlist */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.metricCard}
                onPress={() => navigation.navigate('OrderHistory')}
              >
                <View style={styles.watermarkIcon} pointerEvents="none">
                  <Icon
                    family="material-community"
                    name="flower-tulip-outline"
                    size={30}
                    color="#C5221F"
                  />
                </View>
                <Icon
                  family="material-community"
                  name="cards-heart-outline"
                  size={26}
                  color="#C5221F"
                />
                <Text style={styles.metricVal}>0</Text>
                <Text style={styles.metricLabel}>Saved Wishlist</Text>
              </TouchableOpacity>

              {/* 4. Family Gotras */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.metricCard}
                onPress={() => navigation.navigate('FamilyMembers')}
              >
                <View style={styles.watermarkIcon} pointerEvents="none">
                  <Icon
                    family="material-community"
                    name="flower-tulip-outline"
                    size={30}
                    color="#16A34A"
                  />
                </View>
                <Icon
                  family="material-community"
                  name="account-group"
                  size={26}
                  color="#16A34A"
                />
                <Text style={styles.metricVal}>
                  {familyMembers?.length ?? 0}
                </Text>
                <Text style={styles.metricLabel}>Family Gotras</Text>
              </TouchableOpacity>
            </View>

            {/* Registered Family Sankalp Tree Card */}
            <View style={styles.familyCard}>
              {/* Tree silhouette watermark */}
              <View style={styles.treeWatermark} pointerEvents="none">
                <Icon
                  family="material-community"
                  name="tree"
                  size={76}
                  color="#D8C4A8"
                />
              </View>

              <View style={styles.familyHeader}>
                <View style={styles.familyHeaderLeft}>
                  <Icon
                    family="material-community"
                    name="account-group"
                    size={18}
                    color="#6B0E1E"
                  />
                  <Text style={styles.familyTitle}>
                    Registered Family Sankalp Tree
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.manageBtn}
                  onPress={() => navigation.navigate('FamilyMembers')}
                >
                  <Text style={styles.manageBtnText}>+ Manage</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.familySubtitle}>
                These family members are auto-recited during your Vedic ritual
                Sankalps.
              </Text>

              {isFamilyLoading ? (
                <View style={{ gap: 8, paddingVertical: spacing.sm }}>
                  <SkeletonLine width="60%" height={14} />
                  <SkeletonLine width="80%" height={10} />
                </View>
              ) : familyMembers && familyMembers.length > 0 ? (
                <View style={styles.familyList}>
                  {familyMembers.map((member: FamilyMember) => (
                    <View key={member.id} style={styles.memberItem}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.memberName} numberOfLines={1}>
                          {member.name} ({member.relation.toUpperCase()})
                        </Text>
                        <Text style={styles.memberMeta} numberOfLines={1}>
                          Gotra: {member.gotra || 'Kashyap'}{' '}
                          {member.nakshatra
                            ? `| Nakshatra: ${member.nakshatra}`
                            : ''}
                        </Text>
                      </View>
                      {member.isSankalpHead && (
                        <Badge label="Head" variant="sacred" />
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyFamily}>
                  <Text style={styles.emptyFamilyText}>
                    No secondary family members registered yet. Add family
                    members to include them in sacred sankalps.
                  </Text>
                </View>
              )}
            </View>

            {/* Portal Action List */}
            <View style={styles.actionsCard}>
              {/* Row 1: Payment and Refund Ledger */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.actionRow}
                onPress={() => navigation.navigate('PaymentLedger')}
              >
                <View style={styles.actionIconBox}>
                  <Icon
                    family="material-community"
                    name="credit-card-outline"
                    size={19}
                    color="#7E1528"
                  />
                </View>
                <Text style={styles.actionText}>
                  Payment and Refund Ledger
                </Text>
                <Icon
                  family="material"
                  name="chevron-right"
                  size={18}
                  color="#8E8278"
                />
              </TouchableOpacity>

              <View style={styles.actionDivider} />

              {/* Row 2: Devotee HelpDesk and Chat Support */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.actionRow}
                onPress={() => navigation.navigate('SupportDesk')}
              >
                <View style={styles.actionIconBox}>
                  <Icon
                    family="material-community"
                    name="comment-text-outline"
                    size={19}
                    color="#7E1528"
                  />
                </View>
                <Text style={styles.actionText}>
                  Devotee HelpDesk and Chat Support
                </Text>
                <Icon
                  family="material"
                  name="chevron-right"
                  size={18}
                  color="#8E8278"
                />
              </TouchableOpacity>

              <View style={styles.actionDivider} />

              {/* Row 3: Edit Vedic Profile and Addresses */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.actionRow}
                onPress={() => navigation.navigate('ProfileSettings')}
              >
                <View style={styles.actionIconBox}>
                  <Icon
                    family="material-community"
                    name="account-outline"
                    size={19}
                    color="#7E1528"
                  />
                </View>
                <Text style={styles.actionText}>
                  Edit Vedic Profile and Addresses
                </Text>
                <Icon
                  family="material"
                  name="chevron-right"
                  size={18}
                  color="#8E8278"
                />
              </TouchableOpacity>
            </View>

            {/* Sign Out Devotee Session Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.logoutBtn}
              onPress={handleLogout}
            >
              <Icon
                family="material"
                name="logout"
                size={18}
                color="#7E1528"
              />
              <Text style={styles.logoutBtnText}>
                Sign Out Devotee Session
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </CommonAppBackgroundScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xs,
    paddingBottom: 40,
  },
  headerArea: {
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: typography.fontFamilySerif,
    fontWeight: '700',
    color: '#6B0E1E',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: '#7A6E63',
    marginTop: 2,
    fontWeight: '400',
  },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#741021',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginBottom: 14,
    gap: 14,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#3A0810',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  templeSilhouetteBox: {
    position: 'absolute',
    right: 8,
    bottom: -8,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FDE49E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '800',
    color: '#741021',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#FFFFFF',
    maxWidth: '65%',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EBF7EE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  profileGotra: {
    fontSize: 12,
    color: '#F5CDD3',
    marginTop: 3,
    fontWeight: '500',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  profilePhone: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0E5D8',
    paddingVertical: 15,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  watermarkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    opacity: 0.08,
  },
  metricVal: {
    fontSize: 22,
    fontFamily: typography.fontFamilySerif,
    fontWeight: '700',
    color: '#1A1110',
    marginTop: 5,
  },
  metricLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#6E6259',
    marginTop: 2,
  },
  familyCard: {
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#EEDECB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  treeWatermark: {
    position: 'absolute',
    right: 0,
    bottom: -6,
    opacity: 0.28,
  },
  familyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  familyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  familyTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#6B0E1E',
  },
  manageBtn: {
    borderWidth: 1,
    borderColor: '#7E1528',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: 'transparent',
  },
  manageBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7E1528',
  },
  familySubtitle: {
    fontSize: 11.5,
    color: '#7A6E63',
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 10,
    paddingRight: 30,
  },
  familyList: {
    borderTopWidth: 0.5,
    borderTopColor: '#F0E5D8',
    paddingTop: 6,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F5ECE3',
  },
  memberName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2C1810',
  },
  memberMeta: {
    fontSize: 11,
    color: '#7A6E63',
    marginTop: 2,
  },
  emptyFamily: {
    paddingVertical: 4,
    paddingRight: 50,
  },
  emptyFamilyText: {
    fontSize: 11.5,
    color: '#7A6E63',
    lineHeight: 17,
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0E5D8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 16,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FCEFEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#2C1810',
    flex: 1,
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#F5EBE1',
    marginLeft: 52,
  },
  logoutBtn: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#7E1528',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    shadowColor: '#7E1528',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7E1528',
  },
});
