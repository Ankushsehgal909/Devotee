import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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
import { useOrders } from '../../api/customer';
import { Order } from '../../types';
import { resolveLocalizedText } from '../../utils/localization';

export const OrdersHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { data: orders, isLoading, refetch } = useOrders();

  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'delivered'>('all');

  const filteredOrders = (orders || []).filter((o) => {
    if (filterTab === 'active') {
      return (
        o.status === 'confirmed' ||
        o.status === 'processing' ||
        o.status === 'packed' ||
        o.status === 'dispatched' ||
        o.status === 'in_transit' ||
        o.status === 'out_for_delivery'
      );
    }
    if (filterTab === 'delivered') {
      return o.status === 'delivered';
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge label="Delivered" variant="success" />;
      case 'dispatched':
      case 'in_transit':
      case 'out_for_delivery':
        return <Badge label="In Transit" variant="warning" />;
      case 'packed':
      case 'processing':
        return <Badge label="Consecrating" variant="sacred" />;
      case 'confirmed':
        return <Badge label="Confirmed" variant="neutral" />;
      default:
        return <Badge label={status} variant="neutral" />;
    }
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const totalAmount = item.totalMinor ? item.totalMinor / 100 : 499;
    const itemCount = item.items?.length || 1;
    const firstItem = item.items?.[0];
    const firstItemTitle = firstItem
      ? resolveLocalizedText(firstItem.product?.title, 'Consecrated Samagri Item')
      : 'Sacred Puja Samagri Package';

    return (
      <Card
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderConfirmation', { orderId: item.id })}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>{item.orderNumber || item.id}</Text>
            <Text style={styles.orderDate}>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Recent Order'}
            </Text>
          </View>
          {getStatusBadge(item.status)}
        </View>

        <View style={styles.itemSummaryBox}>
          <Icon family="material-community" name="package-variant-closed" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.itemSummaryText} numberOfLines={1}>
              {firstItemTitle}
              {itemCount > 1 ? ` + ${itemCount - 1} more items` : ''}
            </Text>
            <Text style={styles.addressSummary} numberOfLines={1}>
              Ship to: {item.deliveryAddress || 'Devotee Address, Varanasi'}
            </Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.totalPrice}>₹{totalAmount.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => navigation.navigate('OrderConfirmation', { orderId: item.id })}
          >
            <Text style={styles.trackBtnText}>Track Shipment</Text>
            <Icon family="material" name="chevron-right" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="My Samagri Orders" />

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, filterTab === 'all' && styles.tabBtnActive]}
          onPress={() => setFilterTab('all')}
        >
          <Text style={[styles.tabText, filterTab === 'all' && styles.tabTextActive]}>
            All ({orders?.length || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, filterTab === 'active' && styles.tabBtnActive]}
          onPress={() => setFilterTab('active')}
        >
          <Text style={[styles.tabText, filterTab === 'active' && styles.tabTextActive]}>
            Active Shipments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, filterTab === 'delivered' && styles.tabBtnActive]}
          onPress={() => setFilterTab('delivered')}
        >
          <Text style={[styles.tabText, filterTab === 'delivered' && styles.tabTextActive]}>
            Delivered
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching your consecrated orders...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Icon family="material-community" name="package-variant" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Orders Found</Text>
              <Text style={styles.emptySubtext}>
                You haven't placed any consecrated samagri orders yet.
              </Text>
              <Button
                title="Browse Consecrated Store"
                variant="primary"
                style={{ marginTop: spacing.md }}
                onPress={() => navigation.navigate('StoreHome')}
                leftIcon={<Icon family="material-community" name="store" size={18} color="#FFFFFF" />}
              />
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
  orderCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderNumber: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  orderDate: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCream,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  itemSummaryText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addressSummary: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderWarm,
    paddingTop: spacing.sm,
  },
  totalPrice: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: '800',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trackBtnText: {
    ...typography.caption,
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
