import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icon';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import { useCatalog } from '../../api/shop';
import { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { resolveLocalizedText } from '../../utils/localization';

export const StoreHomeScreen: React.FC = () => {
  const { addItem, getTotalCount } = useCartStore();
  const cartItemCount = getTotalCount();

  // Real API hook
  const { data: products, isLoading, refetch } = useCatalog();

  const renderProduct = ({ item }: { item: Product }) => {
    const productTitle = resolveLocalizedText(item.title, 'Sacred Samagri');
    const productDesc = resolveLocalizedText(
      item.shortDescription || item.description,
      'Consecrated pure Vedic samagri item.'
    );
    const price = item.priceMinor ? item.priceMinor / 100 : 499;

    return (
      <Card style={styles.productCard}>
        <View style={styles.cardHeader}>
          <Badge
            label="100% Pure"
            variant="sacred"
            icon={<Icon family="material-community" name="shield-check" size={12} color={colors.primary} />}
          />
          <View style={styles.ratingRow}>
            <Icon family="material" name="star" size={14} color={colors.goldAccent} />
            <Text style={styles.ratingText}>{item.rating || 5.0}</Text>
          </View>
        </View>

        <Text style={styles.productTitle}>{productTitle}</Text>
        <Text style={styles.productDesc} numberOfLines={2}>
          {productDesc}
        </Text>

        <View style={styles.productFooter}>
          <View>
            <Text style={styles.priceVal}>₹{price}</Text>
            {item.compareAtPriceMinor && (
              <Text style={styles.strikePrice}>₹{item.compareAtPriceMinor / 100}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              addItem(item, 1);
              Alert.alert('Sacred Basket', `Added ${productTitle} to your Sacred Basket.`);
            }}
          >
            <Icon family="material" name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header
        title="Consecrated Samagri Store"
        showBack={false}
        rightAction={
          <TouchableOpacity style={styles.cartBtn} onPress={() => {}}>
            <Icon family="material-community" name="shopping-outline" size={24} color={colors.primary} />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <ProductCardSkeleton style={styles.skeletonMargin} />
          <ProductCardSkeleton style={styles.skeletonMargin} />
          <ProductCardSkeleton style={styles.skeletonMargin} />
        </View>
      ) : (
        <FlatList
          data={products || []}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          ListHeaderComponent={
            <Card variant="warm" style={styles.storeBanner}>
              <Text style={styles.bannerTitle}>100% Certified Vedic Purity</Text>
              <Text style={styles.bannerSubtitle}>
                Hand-churned A2 Gir Cow Bilona Ghee, lab-tested natural herbs, and consecrated brass vigrahas. Free delivery over ₹499.
              </Text>
            </Card>
          }
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Icon family="material-community" name="package-variant" size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptySubtext}>
                Our consecrated store inventory is being updated. Pull down to refresh.
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
  skeletonContainer: {
    padding: spacing.screenPadding,
  },
  skeletonMargin: {
    marginBottom: spacing.md,
  },
  cartBtn: {
    padding: spacing.xs,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  storeBanner: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  bannerTitle: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: 4,
  },
  bannerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  productCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  productTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  productDesc: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderWarm,
    paddingTop: spacing.sm,
  },
  priceVal: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: '700',
  },
  strikePrice: {
    ...typography.captionSmall,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
  },
  addBtnText: {
    ...typography.caption,
    color: '#FFFFFF',
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
