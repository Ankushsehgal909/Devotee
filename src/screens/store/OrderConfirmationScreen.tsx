import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useOrder } from '../../api/customer';

type ParamList = {
  OrderConfirmation: { orderId: string };
};

export const OrderConfirmationScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, 'OrderConfirmation'>>();
  const navigation = useNavigation<any>();
  const orderId = route.params?.orderId || 'ORD-982143';

  const { data: order } = useOrder(orderId);

  const displayOrderNum = order?.orderNumber || orderId;
  const status = order?.status || 'confirmed';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Order Confirmation" showBack={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Celebration Banner */}
        <Card variant="warm" style={styles.celebrationCard}>
          <View style={styles.omBadge}>
            <Icon family="material-community" name="om" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.blessingTitle}>Shubh Sankalpam!</Text>
          <Text style={styles.blessingSubtitle}>
            Your consecrated samagri order has been confirmed with Vedic blessings.
          </Text>
          <View style={styles.orderNumberBadge}>
            <Text style={styles.orderNumberLabel}>Order ID: </Text>
            <Text style={styles.orderNumberText}>{displayOrderNum}</Text>
          </View>
        </Card>

        {/* Shipment Tracker Timeline */}
        <Card style={styles.timelineCard}>
          <Text style={styles.cardHeading}>Shipment & Consecration Timeline</Text>

          <View style={styles.timelineRow}>
            <View style={styles.timelineIconActive}>
              <Icon family="material" name="check" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitleActive}>Order Placed & Dakshina Received</Text>
              <Text style={styles.timelineDesc}>Order recorded with Sanatan Vedic registry</Text>
            </View>
          </View>
          <View style={styles.timelineLineActive} />

          <View style={styles.timelineRow}>
            <View style={styles.timelineIconProgress}>
              <Icon family="material-community" name="fire" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitleActive}>Temple Consecration & Packing</Text>
              <Text style={styles.timelineDesc}>
                Being packed in sacred jute pouches with Gangajal purification
              </Text>
            </View>
          </View>
          <View style={styles.timelineLine} />

          <View style={styles.timelineRow}>
            <View style={styles.timelineIconPending}>
              <Icon family="material-community" name="truck-outline" size={16} color={colors.textMuted} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitlePending}>Dispatched via Sacred Courier</Text>
              <Text style={styles.timelineDesc}>Tracking number will be sent via SMS / WhatsApp</Text>
            </View>
          </View>
          <View style={styles.timelineLine} />

          <View style={styles.timelineRow}>
            <View style={styles.timelineIconPending}>
              <Icon family="material" name="home" size={16} color={colors.textMuted} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitlePending}>Delivered to Doorstep</Text>
              <Text style={styles.timelineDesc}>Ready for your sacred puja & rituals</Text>
            </View>
          </View>
        </Card>

        {/* Delivery Address & Note */}
        <Card style={styles.sectionCard}>
          <Text style={styles.cardHeading}>Delivery Destination</Text>
          <Text style={styles.addressText}>
            {order?.deliveryAddress || 'Devotee Mandir Residence, Varanasi, Uttar Pradesh - 221001'}
          </Text>
          <View style={styles.guaranteeRow}>
            <Icon family="material-community" name="shield-check" size={16} color={colors.primary} />
            <Text style={styles.guaranteeText}>100% Damage-proof Vedic Sealed Packaging</Text>
          </View>
        </Card>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <Button
            title="View All Orders"
            variant="outline"
            style={{ flex: 1 }}
            onPress={() => navigation.navigate('OrderHistory')}
            leftIcon={<Icon family="material-community" name="history" size={18} color={colors.primary} />}
          />
          <Button
            title="Return to Store"
            variant="primary"
            style={{ flex: 1 }}
            onPress={() => navigation.navigate('StoreHome')}
            leftIcon={<Icon family="material-community" name="shopping-outline" size={18} color="#FFFFFF" />}
          />
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
  celebrationCard: {
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  omBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  blessingTitle: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '800',
  },
  blessingSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  orderNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCream,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    marginTop: spacing.md,
  },
  orderNumberLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  orderNumberText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  timelineCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardHeading: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timelineIconActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconProgress: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconPending: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.borderWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitleActive: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timelineTitlePending: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textMuted,
  },
  timelineDesc: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  timelineLineActive: {
    width: 2,
    height: 20,
    backgroundColor: colors.success,
    marginLeft: 15,
    marginVertical: 2,
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.borderWarm,
    marginLeft: 15,
    marginVertical: 2,
  },
  sectionCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  addressText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  guaranteeText: {
    ...typography.captionSmall,
    color: colors.primary,
    fontWeight: '600',
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
});
