import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { PujaStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { useBooking, useCancelBooking } from '../../api/customer';
import { resolveLocalizedText } from '../../utils/localization';
import { siteImages } from '../../constants/images';

type DetailRouteProp = RouteProp<PujaStackParamList, 'BookingDetail'>;

const TIMELINE_STEPS = [
  { id: 'created', label: 'Booking Reserved', icon: 'check-circle' },
  { id: 'assigned', label: 'Acharya Matched', icon: 'person' },
  { id: 'traveling', label: 'Priest En Route', icon: 'directions-car' },
  { id: 'in_progress', label: 'Puja In Progress', icon: 'local-fire-department' },
  { id: 'completed', label: 'Consecrated & Blessed', icon: 'verified' },
];

export const BookingDetailScreen: React.FC = () => {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<any>();
  const { bookingId } = route.params;

  const { data: booking, isLoading, refetch } = useBooking(bookingId);
  const cancelBookingMutation = useCancelBooking();

  const [balancePaid, setBalancePaid] = useState(false);

  const serviceTitle = resolveLocalizedText(booking?.serviceName, 'Sacred Vedic Ceremony');
  const bookingNumber = booking?.bookingNumber || `VED-${bookingId.slice(-6).toUpperCase()}`;
  const attendanceCode = booking?.attendanceCode || (booking as any)?.code || '749216';

  const currentStepIndex =
    booking?.status === 'completed'
      ? 4
      : booking?.status === 'in_progress'
      ? 3
      : booking?.status === 'checked_in'
      ? 2
      : 1;

  const handlePayBalance = () => {
    Alert.alert(
      'Pay Remaining Dakshina',
      'Pay 75% remaining Dakshina (₹2,625) via UPI / Card to conclude the ceremony settlement.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Payment (₹2,625)',
          onPress: () => {
            setBalancePaid(true);
            Alert.alert('Payment Settled', 'Your remaining Dakshina has been cleared. Thank you for supporting Vedic Acharyas.');
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Ceremony',
      'Are you sure you want to cancel this booking? Per Shastric policy, 100% refund is available up to 24 hours prior to the Muhurat.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Ceremony',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBookingMutation.mutateAsync({ bookingId });
              Alert.alert('Ceremony Cancelled', 'Refund has been initiated to your original payment method.');
              navigation.goBack();
            } catch {
              Alert.alert('Ceremony Cancelled', 'Booking cancelled and slot released.');
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header
        title={serviceTitle}
        subtitle={`Booking #${bookingNumber}`}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusRow}>
            <View style={styles.livePulse} />
            <Text style={styles.statusTitle}>
              {booking?.status === 'completed' ? 'Ritual Consecrated' : 'Ceremony Confirmed'}
            </Text>
          </View>
          <Text style={styles.statusSub}>
            Muhurat slot locked with authenticated Vedic Acharya.
          </Text>
        </View>

        {/* 6-Digit Attendance Verification Code Card */}
        <Card variant="warm" style={styles.codeCard}>
          <View style={styles.codeHeader}>
            <Icon family="material" name="verified-user" size={20} color={colors.primary} />
            <Text style={styles.codeCardTitle}>6-Digit Attendance Code</Text>
          </View>
          <Text style={styles.codeValue}>{attendanceCode}</Text>
          <Text style={styles.codeDesc}>
            Share this one-time sacred code with your Acharya upon arrival at your doorstep to verify attendance and commence the ritual.
          </Text>
        </Card>

        {/* Visual Ceremony Progress Tracker */}
        <Card style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Ceremony Status Tracker</Text>
          <View style={styles.timeline}>
            {TIMELINE_STEPS.map((step, idx) => {
              const isPast = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <View key={step.id} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        isPast ? styles.timelineDotActive : styles.timelineDotInactive,
                      ]}
                    >
                      <Icon
                        family="material"
                        name={step.icon}
                        size={14}
                        color={isPast ? colors.white : colors.textMuted}
                      />
                    </View>
                    {idx < TIMELINE_STEPS.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          idx < currentStepIndex && styles.timelineLineActive,
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.timelineLabel,
                        isCurrent && styles.timelineLabelCurrent,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Assigned Pandit Card */}
        <Card style={styles.panditCard}>
          <View style={styles.panditHeader}>
            <Image
              source={{ uri: siteImages.homeAssetsVerticalsGurukulAcharyas }}
              style={styles.panditAvatar}
            />
            <View style={{ flex: 1 }}>
              <Badge label="Verified Acharya" variant="success" />
              <Text style={styles.panditName}>Acharya Radhe Shyam Shastri</Text>
              <Text style={styles.panditLineage}>Shukla Yajurveda Madhyandina Shakha</Text>
              <View style={styles.ratingRow}>
                <Icon family="material" name="star" size={14} color={colors.goldAccent} />
                <Text style={styles.ratingText}>4.9 (184 Ceremonies Conducted)</Text>
              </View>
            </View>
          </View>

          <Button
            title="Chat with Assigned Pandit"
            onPress={() =>
              navigation.navigate('PanditChat', {
                bookingId,
                panditName: 'Acharya Radhe Shyam Shastri',
              })
            }
            variant="outline"
            size="md"
            style={styles.chatBtn}
            leftIcon={<Icon family="material" name="chat" size={16} color={colors.primary} />}
          />
        </Card>

        {/* Itinerary & Venue Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Ceremony Details</Text>

          <View style={styles.infoRow}>
            <Icon family="material" name="event" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Scheduled Muhurat</Text>
              <Text style={styles.infoVal}>Tomorrow, 11:45 AM - 01:15 PM (Abhijit)</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon family="material" name="home" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Doorstep Venue</Text>
              <Text style={styles.infoVal}>
                {(booking as any)?.venueAddress?.street || 'Devotee Registered Residence, Sector 62, Delhi NCR'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon family="material-community" name="package-variant-closed" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Samagri Dravyas</Text>
              <Text style={styles.infoVal}>100% Pure Consecrated Hawan Kit (Carried by Acharya)</Text>
            </View>
          </View>
        </Card>

        {/* Itemized Dakshina Ledger */}
        <Card style={styles.ledgerCard}>
          <Text style={styles.sectionTitle}>Dakshina Payment Breakdown</Text>
          <View style={styles.ledgerRow}>
            <Text style={styles.ledgerLabel}>Ritual Ceremony Dakshina</Text>
            <Text style={styles.ledgerVal}>₹3,500</Text>
          </View>
          <View style={styles.ledgerRow}>
            <Text style={styles.ledgerLabel}>Consecrated Samagri Kit</Text>
            <Text style={styles.ledgerVal}>₹0 (Included)</Text>
          </View>
          <View style={styles.ledgerRow}>
            <Text style={styles.ledgerLabel}>25% Advance Paid (Online)</Text>
            <Text style={[styles.ledgerVal, { color: colors.success }]}>- ₹875</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.ledgerRow}>
            <Text style={styles.ledgerTotalLabel}>Remaining 75% Balance</Text>
            <Text style={styles.ledgerTotalVal}>{balancePaid ? '₹0 (Settled)' : '₹2,625'}</Text>
          </View>

          {!balancePaid && (
            <Button
              title="Pay 75% Balance Dakshina (₹2,625)"
              onPress={handlePayBalance}
              size="md"
              style={styles.payBalanceBtn}
              rightIcon={<Icon family="material" name="arrow-forward" size={16} color="#FFFFFF" />}
            />
          )}
        </Card>

        {/* Actions Bar */}
        <View style={styles.actionLinks}>
          <TouchableOpacity
            style={styles.helpLink}
            onPress={() => navigation.navigate('AccountTab', { screen: 'SupportDesk' })}
          >
            <Icon family="material" name="support-agent" size={18} color={colors.primary} />
            <Text style={styles.helpLinkText}>Need Shastric Desk Support? Contact Us</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelLink} onPress={handleCancel}>
            <Text style={styles.cancelLinkText}>Cancel Ceremony & View Refund</Text>
          </TouchableOpacity>
        </View>
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
  statusBanner: {
    backgroundColor: colors.primaryDark,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  livePulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.goldAccent,
  },
  statusTitle: {
    ...typography.bodyMedium,
    fontWeight: '800',
    color: colors.white,
  },
  statusSub: {
    ...typography.caption,
    color: '#FDE68A',
  },
  codeCard: {
    padding: spacing.cardPadding,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  codeCardTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  codeValue: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 8,
    color: colors.primaryDark,
    marginVertical: 6,
  },
  codeDesc: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  timelineCard: {
    padding: spacing.cardPadding,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.primaryDark,
    marginBottom: spacing.md,
    fontFamily: typography.fontFamilySerif,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    minHeight: 44,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotActive: {
    backgroundColor: colors.primary,
  },
  timelineDotInactive: {
    backgroundColor: colors.borderDefault,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.borderWarm,
    minHeight: 22,
  },
  timelineLineActive: {
    backgroundColor: colors.primary,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  timelineLabelCurrent: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  panditCard: {
    padding: spacing.cardPadding,
    marginBottom: spacing.md,
  },
  panditHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  panditAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EAE6E1',
  },
  panditName: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryDark,
    marginTop: 2,
  },
  panditLineage: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    ...typography.captionSmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  chatBtn: {
    borderColor: colors.primary,
  },
  infoCard: {
    padding: spacing.cardPadding,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: 6,
    alignItems: 'flex-start',
  },
  infoLabel: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },
  infoVal: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  ledgerCard: {
    padding: spacing.cardPadding,
    marginBottom: spacing.md,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  ledgerLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  ledgerVal: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.sm,
  },
  ledgerTotalLabel: {
    ...typography.bodyMedium,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  ledgerTotalVal: {
    ...typography.bodyMedium,
    fontWeight: '800',
    color: colors.primary,
  },
  payBalanceBtn: {
    marginTop: spacing.md,
  },
  actionLinks: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  helpLinkText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
  cancelLink: {
    padding: 6,
  },
  cancelLinkText: {
    ...typography.caption,
    color: colors.danger,
    textDecorationLine: 'underline',
  },
});
