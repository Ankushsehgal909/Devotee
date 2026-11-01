import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { PanchangSkeleton, PujaCardSkeleton } from '../../components/common/Skeleton';
import { useAuthStore } from '../../store/useAuthStore';
import { useServices } from '../../api/services';
import { usePanchang, useBookings, useDevoteeAccount } from '../../api/customer';
import { PujaService } from '../../types';

export const HomeScreen: React.FC = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();

  // Real API data hooks
  const { data: serverUser } = useDevoteeAccount();
  const { data: panchang, isLoading: isPanchangLoading } = usePanchang();
  const { data: services, isLoading: isServicesLoading } = useServices({ limit: 6 });
  const { data: bookings } = useBookings({ limit: 1 });

  const activeBooking = bookings && bookings.length > 0 ? bookings[0] : null;

  const devoteeName = serverUser?.name || user?.name || 'Devotee';
  const devoteeGotra = serverUser?.gotra || user?.gotra || 'Kashyap';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Devotee Navigation Bar */}
      <View style={styles.topNav}>
        <View>
          <Text style={styles.greetingText}>Namaste, {devoteeName}</Text>
          <Text style={styles.gotraText}>{devoteeGotra} Gotra | Sanatan Devotee</Text>
        </View>
        <View style={styles.topNavActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon family="material" name="favorite-border" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon family="material" name="notifications-none" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Daily Panchang Strip from live API or Skeleton */}
        {isPanchangLoading ? (
          <PanchangSkeleton style={styles.panchangCard} />
        ) : (
          <Card variant="warm" style={styles.panchangCard}>
            <View style={styles.panchangRow}>
              <View style={styles.panchangLeft}>
                <View style={styles.panchangIcon}>
                  <Icon family="material-community" name="weather-sunny" size={20} color={colors.goldAccent} />
                </View>
                <View>
                  <Text style={styles.panchangTithi}>{panchang?.tithi || 'Shukla Ashtami'}</Text>
                  <Text style={styles.panchangNakshatra}>
                    {panchang?.nakshatra || 'Rohini'} Nakshatra | {panchang?.paksha || 'Shukla'} Paksha
                  </Text>
                </View>
              </View>
              <Badge label="Shubh Day" variant="gold" />
            </View>
            <View style={styles.panchangDivider} />
            <View style={styles.muhuratRow}>
              <View style={styles.muhuratItem}>
                <Icon family="material" name="schedule" size={14} color={colors.success} />
                <Text style={styles.muhuratText}>
                  Abhijit: {panchang?.abhijitMuhurat || '11:45 AM - 12:30 PM'}
                </Text>
              </View>
              <View style={styles.muhuratItem}>
                <Text style={styles.muhuratRed}>
                  Rahu: {panchang?.rahuKaalam || '04:15 PM - 05:35 PM'}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Active Booking Pulse (from live API) */}
        {activeBooking && (
          <Card style={styles.activeBookingCard}>
            <View style={styles.bookingHeader}>
              <View style={styles.activeIndicatorRow}>
                <View style={styles.activeDot} />
                <Text style={styles.activeBookingTitle}>Upcoming Vedic Ceremony</Text>
              </View>
              <Badge label="Confirmed" variant="success" />
            </View>
            <Text style={styles.bookingServiceName}>{activeBooking.serviceName}</Text>
            {activeBooking.attendanceCode && (
              <Text style={styles.bookingDetails}>
                Attendance Code: <Text style={styles.codeText}>{activeBooking.attendanceCode}</Text>
              </Text>
            )}
            <Text style={styles.bookingSubtext}>
              Share this 6-digit verification code with the Acharya upon arrival.
            </Text>
          </Card>
        )}

        {/* Quick Devotional Actions */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('PujasTab')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FDF2F8' }]}>
              <Icon family="material-community" name="fire" size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickActionText}>Book Puja</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('MalaTab')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Icon family="material-community" name="om" size={24} color={colors.goldAccent} />
            </View>
            <Text style={styles.quickActionText}>Japam Mala</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('StoreTab')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#F0FDF4' }]}>
              <Icon family="material-community" name="shopping-outline" size={24} color={colors.success} />
            </View>
            <Text style={styles.quickActionText}>Pure Samagri</Text>
          </TouchableOpacity>
        </View>

        {/* Trending Vedic Pujas from API */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Sacred Pujas</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PujasTab')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {isServicesLoading ? (
          <View>
            <PujaCardSkeleton style={styles.serviceCard} />
            <PujaCardSkeleton style={styles.serviceCard} />
          </View>
        ) : services && services.length > 0 ? (
          services.slice(0, 3).map((service: PujaService) => (
            <Card
              key={service.id}
              style={styles.serviceCard}
              onPress={() => navigation.navigate('PujasTab', { screen: 'PujaDetail', params: { serviceId: service.id } })}
            >
              <View style={styles.serviceHeader}>
                <View style={styles.serviceCategoryBadge}>
                  <Text style={styles.serviceCategoryText}>{service.category || 'Vedic Vidhi'}</Text>
                </View>
                <Text style={styles.servicePrice}>₹{service.priceMinor ? service.priceMinor / 100 : 3500}</Text>
              </View>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceSubtitle} numberOfLines={2}>
                {service.subtitle || service.description}
              </Text>
              <View style={styles.serviceFooter}>
                <Text style={styles.serviceDuration}>~{service.durationMinutes || 120} mins | Authentic Vidhi</Text>
                <View style={styles.bookCta}>
                  <Text style={styles.bookCtaText}>Book Slot</Text>
                  <Icon family="material" name="chevron-right" size={16} color={colors.primary} />
                </View>
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Icon family="material-community" name="book-open-page-variant" size={32} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Sacred Offerings</Text>
            <Text style={styles.emptySubtext}>
              Explore our full directory of certified Acharyas and Vedic ritual vidhis.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('PujasTab')}
            >
              <Text style={styles.emptyBtnText}>Explore Puja Catalog</Text>
            </TouchableOpacity>
          </Card>
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
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderWarm,
    backgroundColor: colors.bgSand,
  },
  greetingText: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  gotraText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  topNavActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  panchangCard: {
    marginBottom: spacing.md,
  },
  panchangRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panchangLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  panchangIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.amberMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panchangTithi: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  panchangNakshatra: {
    ...typography.caption,
    color: colors.textMuted,
  },
  panchangDivider: {
    height: 1,
    backgroundColor: '#FDE68A',
    marginVertical: spacing.sm,
  },
  muhuratRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  muhuratItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  muhuratText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  muhuratRed: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '500',
  },
  activeBookingCard: {
    backgroundColor: '#FFFDF9',
    borderColor: colors.goldAccent,
    marginBottom: spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  activeIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  activeBookingTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'uppercase',
  },
  bookingServiceName: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: 4,
  },
  bookingDetails: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  codeText: {
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: 2,
  },
  bookingSubtext: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.md,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  quickActionText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  viewAllText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  serviceCard: {
    marginBottom: spacing.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceCategoryBadge: {
    backgroundColor: colors.primaryMuted,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
  },
  serviceCategoryText: {
    ...typography.captionSmall,
    color: colors.primary,
    fontWeight: '600',
  },
  servicePrice: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: '700',
  },
  serviceTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  serviceSubtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderWarm,
    paddingTop: spacing.xs,
  },
  serviceDuration: {
    ...typography.caption,
    color: colors.textMuted,
  },
  bookCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  bookCtaText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.sm,
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
    marginBottom: spacing.md,
  },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
  },
  emptyBtnText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
