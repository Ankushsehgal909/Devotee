import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useAuthStore } from '../../store/useAuthStore';
import { MOCK_PANCHANG, MOCK_SERVICES, MOCK_BOOKING } from '../../api/mockData';
import {
  Bell,
  Heart,
  Flame,
  Sun,
  Clock,
  Sparkles,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react-native';

export const HomeScreen: React.FC = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();

  const devoteeName = user?.name || 'Sanatan Devotee';
  const devoteeGotra = user?.gotra || 'Kashyap';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Devotee Navigation Bar */}
      <View style={styles.topNav}>
        <View>
          <Text style={styles.greetingText}>Namaste, {devoteeName}</Text>
          <Text style={styles.gotraText}>{devoteeGotra} Gotra · Vedic Devotee</Text>
        </View>
        <View style={styles.topNavActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Heart size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Bell size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Daily Panchang Strip */}
        <Card variant="warm" style={styles.panchangCard}>
          <View style={styles.panchangRow}>
            <View style={styles.panchangLeft}>
              <View style={styles.panchangIcon}>
                <Sun size={20} color={colors.goldAccent} />
              </View>
              <View>
                <Text style={styles.panchangTithi}>{MOCK_PANCHANG.tithi}</Text>
                <Text style={styles.panchangNakshatra}>
                  {MOCK_PANCHANG.nakshatra} Nakshatra · {MOCK_PANCHANG.paksha} Paksha
                </Text>
              </View>
            </View>
            <Badge label="Shubh Day" variant="gold" />
          </View>
          <View style={styles.panchangDivider} />
          <View style={styles.muhuratRow}>
            <View style={styles.muhuratItem}>
              <Clock size={12} color={colors.success} />
              <Text style={styles.muhuratText}>Abhijit: {MOCK_PANCHANG.abhijitMuhurat}</Text>
            </View>
            <View style={styles.muhuratItem}>
              <Text style={styles.muhuratRed}>Rahu: {MOCK_PANCHANG.rahuKaalam}</Text>
            </View>
          </View>
        </Card>

        {/* Active Booking Pulse (if present) */}
        {MOCK_BOOKING && (
          <Card style={styles.activeBookingCard}>
            <View style={styles.bookingHeader}>
              <View style={styles.activeIndicatorRow}>
                <View style={styles.activeDot} />
                <Text style={styles.activeBookingTitle}>Upcoming Vedic Ceremony</Text>
              </View>
              <Badge label="Confirmed" variant="success" />
            </View>
            <Text style={styles.bookingServiceName}>{MOCK_BOOKING.serviceName}</Text>
            <Text style={styles.bookingDetails}>
              Attendance Code: <Text style={styles.codeText}>{MOCK_BOOKING.attendanceCode}</Text>
            </Text>
            <Text style={styles.bookingSubtext}>
              Share this 6-digit code with Pandit Ji when he arrives at your residence.
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
              <Flame size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickActionText}>Book Puja</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('MalaTab')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Sparkles size={24} color={colors.goldAccent} />
            </View>
            <Text style={styles.quickActionText}>Japam Mala</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('StoreTab')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#F0FDF4' }]}>
              <ShoppingBag size={24} color={colors.success} />
            </View>
            <Text style={styles.quickActionText}>Pure Samagri</Text>
          </TouchableOpacity>
        </View>

        {/* Trending Vedic Pujas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Sacred Pujas</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PujasTab')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {MOCK_SERVICES.map((service) => (
          <Card
            key={service.id}
            style={styles.serviceCard}
            onPress={() => navigation.navigate('PujasTab')}
          >
            <View style={styles.serviceHeader}>
              <View style={styles.serviceCategoryBadge}>
                <Text style={styles.serviceCategoryText}>{service.category}</Text>
              </View>
              <Text style={styles.servicePrice}>₹{service.priceMinor / 100}</Text>
            </View>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.serviceSubtitle} numberOfLines={2}>
              {service.subtitle}
            </Text>
            <View style={styles.serviceFooter}>
              <Text style={styles.serviceDuration}>~{service.durationMinutes} mins · Vedic Vidhi</Text>
              <View style={styles.bookCta}>
                <Text style={styles.bookCtaText}>Book Slot</Text>
                <ChevronRight size={14} color={colors.primary} />
              </View>
            </View>
          </Card>
        ))}
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
});
