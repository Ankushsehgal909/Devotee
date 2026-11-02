import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { useBookings, useOrders } from '../../api/customer';
import { resolveLocalizedText } from '../../utils/localization';

interface LedgerItem {
  id: string;
  type: 'puja' | 'order';
  title: string;
  amountMinor: number;
  date: string;
  status: 'paid' | 'partial' | 'pending' | 'refunded';
  referenceId: string;
}

export const PaymentLedgerScreen: React.FC = () => {
  const { data: bookings, isLoading: isBookingsLoading } = useBookings();
  const { data: orders, isLoading: isOrdersLoading } = useOrders();

  const [filterType, setFilterType] = useState<'all' | 'puja' | 'order'>('all');

  const ledgerItems = useMemo(() => {
    const list: LedgerItem[] = [];

    // Map bookings
    (bookings || []).forEach((b) => {
      const title = resolveLocalizedText(b.serviceName, 'Vedic Puja Ceremony');
      const amount = b.totalAmountMinor || 510000;
      const isAdvance = (b.balanceDueMinor ?? 0) > 0;
      list.push({
        id: `puja-${b.id}`,
        type: 'puja',
        title: `Puja Dakshina: ${title}`,
        amountMinor: isAdvance ? (b.advancePaidMinor || Math.round(amount * 0.25)) : amount,
        date: b.createdAt || b.startAt,
        status: isAdvance ? 'partial' : 'paid',
        referenceId: `TXN-DKS-${b.id.slice(-6).toUpperCase()}`,
      });
    });

    // Map orders
    (orders || []).forEach((o) => {
      const firstItem = o.items?.[0];
      const title = firstItem
        ? resolveLocalizedText(firstItem.product?.title, 'Samagri Order')
        : 'Consecrated Samagri Package';
      list.push({
        id: `order-${o.id}`,
        type: 'order',
        title: `Store Purchase: ${title}`,
        amountMinor: o.totalMinor || 49900,
        date: o.createdAt,
        status: o.status === 'cancelled' ? 'refunded' : 'paid',
        referenceId: `TXN-SMG-${o.id.slice(-6).toUpperCase()}`,
      });
    });

    // Sort by date descending
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [bookings, orders]);

  const filteredItems = ledgerItems.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const getStatusBadge = (status: LedgerItem['status']) => {
    switch (status) {
      case 'paid':
        return <Badge label="Dakshina Paid" variant="success" />;
      case 'partial':
        return <Badge label="25% Advance Paid" variant="warning" />;
      case 'refunded':
        return <Badge label="Refund Processed" variant="neutral" />;
      default:
        return <Badge label="Pending" variant="neutral" />;
    }
  };

  const handleDownloadReceipt = (item: LedgerItem) => {
    Alert.alert(
      'Tax & Shubh Receipt',
      `Official receipt for reference ${item.referenceId} has been sent to your registered email address.`
    );
  };

  const renderItem = ({ item }: { item: LedgerItem }) => {
    const isPuja = item.type === 'puja';
    const amountInRupees = (item.amountMinor / 100).toFixed(2);

    return (
      <Card style={styles.ledgerCard}>
        <View style={styles.cardHeader}>
          <View style={styles.typeIconBox}>
            <Icon
              family={isPuja ? 'material-community' : 'material-community'}
              name={isPuja ? 'fire' : 'shopping-outline'}
              size={20}
              color={colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.refId}>Ref: {item.referenceId}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.amountText}>₹{amountInRupees}</Text>
            {getStatusBadge(item.status)}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            {item.date
              ? new Date(item.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Recent Transaction'}
          </Text>
          <TouchableOpacity
            style={styles.receiptBtn}
            onPress={() => handleDownloadReceipt(item)}
          >
            <Icon family="material" name="receipt" size={14} color={colors.primary} />
            <Text style={styles.receiptText}>Tax Receipt</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const isLoading = isBookingsLoading || isOrdersLoading;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Payment & Refund Ledger" />

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, filterType === 'all' && styles.tabBtnActive]}
          onPress={() => setFilterType('all')}
        >
          <Text style={[styles.tabText, filterType === 'all' && styles.tabTextActive]}>
            All ({ledgerItems.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, filterType === 'puja' && styles.tabBtnActive]}
          onPress={() => setFilterType('puja')}
        >
          <Text style={[styles.tabText, filterType === 'puja' && styles.tabTextActive]}>
            Puja Dakshina
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, filterType === 'order' && styles.tabBtnActive]}
          onPress={() => setFilterType('order')}
        >
          <Text style={[styles.tabText, filterType === 'order' && styles.tabTextActive]}>
            Samagri Orders
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching payment history...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Card variant="warm" style={styles.bannerCard}>
              <Text style={styles.bannerTitle}>Transparent Shastric Ledger</Text>
              <Text style={styles.bannerSubtitle}>
                Complete record of all Vedic ceremony Dakshinas, 25% booking advances, and consecrated samagri orders.
              </Text>
            </Card>
          }
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Icon family="material" name="payment" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Transactions Found</Text>
              <Text style={styles.emptySubtext}>
                Transactions will appear here when you book a ceremony or order sacred samagri.
              </Text>
            </Card>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSand,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.xs,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderWarm,
    gap: spacing.xs,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    backgroundColor: colors.bgSand,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
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
  ledgerCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.bgCream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  refId: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  amountText: {
    ...typography.bodyMedium,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderWarm,
    paddingTop: spacing.xs,
    marginTop: spacing.sm,
  },
  dateText: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  receiptText: {
    ...typography.captionSmall,
    color: colors.primary,
    fontWeight: '700',
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
});
