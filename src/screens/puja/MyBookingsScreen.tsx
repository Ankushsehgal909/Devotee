import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icon';
import { useBookings } from '../../api/customer';
import { Booking } from '../../types';
import { resolveLocalizedText } from '../../utils/localization';
import { siteImages } from '../../constants/images';

const FILTERS = ['All', 'Upcoming', 'In Progress', 'Completed'];

export const MyBookingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState('All');

  const { data: bookings, isLoading, refetch } = useBookings();

  const filteredBookings = (bookings || []).filter((b: Booking) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Upcoming') return b.status === 'confirmed' || b.status === 'requested';
    if (activeFilter === 'In Progress') return b.status === 'in_progress' || b.status === 'checked_in';
    if (activeFilter === 'Completed') return b.status === 'completed';
    return true;
  });

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const serviceTitle = resolveLocalizedText(item.serviceName, 'Sacred Vedic Ceremony');
    const imageUri = (item as any).serviceImage || siteImages.homeAssetsVerticalsHomePujas;
    const isCompleted = item.status === 'completed';

    return (
      <Card
        style={styles.card}
        onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
      >
        <View style={styles.cardRow}>
          <Image source={{ uri: imageUri }} style={styles.cardImage} resizeMode="cover" />
          <View style={styles.cardInfo}>
            <View style={styles.badgeRow}>
              <Badge
                label={isCompleted ? 'Completed' : 'Confirmed'}
                variant={isCompleted ? 'neutral' : 'success'}
              />
              <Text style={styles.bookingNum}>{item.bookingNumber || `VED-${item.id.slice(-6).toUpperCase()}`}</Text>
            </View>

            <Text style={styles.serviceName} numberOfLines={1}>{serviceTitle}</Text>

            <View style={styles.detailRow}>
              <Icon family="material" name="event" size={14} color={colors.textMuted} />
              <Text style={styles.detailText}>
                {(item as any).scheduledDate || 'Upcoming Muhurat'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon family="material" name="location-on" size={14} color={colors.primary} />
              <Text style={styles.detailText}>
                {item.mode === 'home_visit' ? 'Doorstep Home Visit' : item.mode === 'online' ? 'Live Online E-Puja' : 'Temple'}
              </Text>
            </View>

            {item.attendanceCode && (
              <View style={styles.attendancePill}>
                <Text style={styles.attendanceText}>Code: {item.attendanceCode}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.trackCta}>View Ceremony Progress & Details</Text>
          <Icon family="material" name="chevron-right" size={18} color={colors.primary} />
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="My Sacred Bookings" showBack onBackPress={() => navigation.goBack()} />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Icon family="material-community" name="calendar-blank-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Ceremonies Listed</Text>
            <Text style={styles.emptySubtext}>
              You do not have any {activeFilter.toLowerCase()} ceremonies at this time.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('PujaCatalog')}
            >
              <Text style={styles.emptyBtnText}>Explore Puja Catalog</Text>
            </TouchableOpacity>
          </Card>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSand,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.bgSand,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderWarm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    backgroundColor: colors.white,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textMuted,
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.screenPadding,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.md,
    backgroundColor: '#EAE6E1',
  },
  cardInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bookingNum: {
    ...typography.captionSmall,
    color: colors.textMuted,
    fontWeight: '600',
  },
  serviceName: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 2,
  },
  detailText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  attendancePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  attendanceText: {
    ...typography.captionSmall,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  trackCta: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xxl,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    marginTop: spacing.sm,
    color: colors.textPrimary,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  emptyBtnText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '700',
  },
});
