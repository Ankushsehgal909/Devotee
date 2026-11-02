import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
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
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import { useCatalog } from '../../api/shop';
import { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { resolveLocalizedText } from '../../utils/localization';
import { getProductImageUrl } from '../../constants/images';

type SortOption = 'top_rated' | 'price_asc' | 'price_desc' | 'popular';

export const BestSellerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { addItem, getTotalCount } = useCartStore();
  const cartCount = getTotalCount();

  const { data: products, isLoading, refetch } = useCatalog();

  const [sortBy, setSortBy] = useState<SortOption>('top_rated');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [priceBracket, setPriceBracket] = useState<'all' | 'under500' | '500to1500' | 'above1500'>('all');

  const sortedAndFiltered = useMemo(() => {
    if (!products) return [];

    let list = [...products];

    // Filter in-stock
    if (onlyInStock) {
      list = list.filter((p) => p.inStock);
    }

    // Filter price brackets
    if (priceBracket === 'under500') {
      list = list.filter((p) => (p.priceMinor / 100) < 500);
    } else if (priceBracket === '500to1500') {
      list = list.filter((p) => (p.priceMinor / 100) >= 500 && (p.priceMinor / 100) <= 1500);
    } else if (priceBracket === 'above1500') {
      list = list.filter((p) => (p.priceMinor / 100) > 1500);
    }

    // Sort options
    if (sortBy === 'top_rated') {
      list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else if (sortBy === 'price_asc') {
      list.sort((a, b) => a.priceMinor - b.priceMinor);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.priceMinor - a.priceMinor);
    } else if (sortBy === 'popular') {
      list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    return list;
  }, [products, sortBy, onlyInStock, priceBracket]);

  const renderProduct = ({ item }: { item: Product }) => {
    const title = resolveLocalizedText(item.title, 'Best Seller Samagri');
    const desc = resolveLocalizedText(
      item.shortDescription || item.description,
      'Consecrated pure Vedic samagri item.'
    );
    const price = (item.priceMinor / 100).toFixed(0);
    const imageUrl = item.imageUrl || getProductImageUrl(item);

    return (
      <Card
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <View style={styles.imageBox}>
          <Image source={{ uri: imageUrl }} style={styles.productImg} resizeMode="cover" />
          <View style={styles.bestSellerTag}>
            <Icon family="material" name="local-fire-department" size={12} color="#FFFFFF" />
            <Text style={styles.bestSellerTagText}>Best Seller</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.metaRow}>
            <Badge label={resolveLocalizedText(item.category, 'Samagri')} variant="neutral" />
            <View style={styles.ratingRow}>
              <Icon family="material" name="star" size={14} color={colors.goldAccent} />
              <Text style={styles.ratingText}>{item.rating || 5.0}</Text>
              <Text style={styles.reviewCount}>({item.reviewCount || 42})</Text>
            </View>
          </View>

          <Text style={styles.productTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.productDesc} numberOfLines={2}>
            {desc}
          </Text>

          <View style={styles.footerRow}>
            <Text style={styles.priceVal}>₹{price}</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addItem(item, 1)}
            >
              <Icon family="material" name="add" size={16} color="#FFFFFF" />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header
        title="Best Sellers"
        rightAction={
          <TouchableOpacity
            style={styles.cartIconBtn}
            onPress={() => navigation.navigate('CartScreen')}
          >
            <Icon family="material-community" name="shopping-outline" size={24} color={colors.primary} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      {/* Sorting Tabs Bar */}
      <View style={styles.sortBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'top_rated' && styles.sortChipActive]}
            onPress={() => setSortBy('top_rated')}
          >
            <Text style={[styles.sortChipText, sortBy === 'top_rated' && styles.sortChipTextActive]}>
              Top Rated
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'popular' && styles.sortChipActive]}
            onPress={() => setSortBy('popular')}
          >
            <Text style={[styles.sortChipText, sortBy === 'popular' && styles.sortChipTextActive]}>
              Most Popular
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'price_asc' && styles.sortChipActive]}
            onPress={() => setSortBy('price_asc')}
          >
            <Text style={[styles.sortChipText, sortBy === 'price_asc' && styles.sortChipTextActive]}>
              Price: Low to High
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'price_desc' && styles.sortChipActive]}
            onPress={() => setSortBy('price_desc')}
          >
            <Text style={[styles.sortChipText, sortBy === 'price_desc' && styles.sortChipTextActive]}>
              Price: High to Low
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Filter Chips Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
          <TouchableOpacity
            style={[styles.filterChip, priceBracket === 'all' && styles.filterChipActive]}
            onPress={() => setPriceBracket('all')}
          >
            <Text style={[styles.filterChipText, priceBracket === 'all' && styles.filterChipTextActive]}>
              All Prices
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, priceBracket === 'under500' && styles.filterChipActive]}
            onPress={() => setPriceBracket('under500')}
          >
            <Text style={[styles.filterChipText, priceBracket === 'under500' && styles.filterChipTextActive]}>
              Under ₹500
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, priceBracket === '500to1500' && styles.filterChipActive]}
            onPress={() => setPriceBracket('500to1500')}
          >
            <Text style={[styles.filterChipText, priceBracket === '500to1500' && styles.filterChipTextActive]}>
              ₹500 - ₹1500
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, priceBracket === 'above1500' && styles.filterChipActive]}
            onPress={() => setPriceBracket('above1500')}
          >
            <Text style={[styles.filterChipText, priceBracket === 'above1500' && styles.filterChipTextActive]}>
              ₹1500+
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, onlyInStock && styles.filterChipActive]}
            onPress={() => setOnlyInStock(!onlyInStock)}
          >
            <Text style={[styles.filterChipText, onlyInStock && styles.filterChipTextActive]}>
              In Stock Only
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={{ padding: spacing.screenPadding }}>
          <ProductCardSkeleton style={{ marginBottom: spacing.md }} />
          <ProductCardSkeleton style={{ marginBottom: spacing.md }} />
        </View>
      ) : (
        <FlatList
          data={sortedAndFiltered}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          ListHeaderComponent={
            <Card variant="warm" style={styles.bannerCard}>
              <View style={styles.bannerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerTitle}>Most Loved Sanatan Samagri</Text>
                  <Text style={styles.bannerSubtitle}>
                    Verified by over 10,000+ Sanatan families. Consecrated with Shastric purity, tested in Vedic labs.
                  </Text>
                </View>
                <Icon family="material" name="verified" size={28} color={colors.primary} />
              </View>
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
  cartIconBtn: {
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
  sortBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderWarm,
    paddingVertical: spacing.xs,
  },
  sortScroll: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.xs,
  },
  sortChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.bgSand,
  },
  sortChipActive: {
    backgroundColor: colors.primary,
  },
  sortChipText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: '#FFFFFF',
  },
  filterBar: {
    paddingVertical: spacing.xs,
  },
  filterChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: colors.goldAccent,
    borderColor: colors.goldAccent,
  },
  filterChipText: {
    ...typography.captionSmall,
    fontSize: 11,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  bannerCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  productCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  imageBox: {
    position: 'relative',
    height: 160,
    width: '100%',
    backgroundColor: colors.bgCream,
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  bestSellerTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  bestSellerTagText: {
    ...typography.captionSmall,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
  },
  cardBody: {
    padding: spacing.md,
  },
  metaRow: {
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
  reviewCount: {
    ...typography.captionSmall,
    color: colors.textMuted,
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
  footerRow: {
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
    fontWeight: '800',
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
});
