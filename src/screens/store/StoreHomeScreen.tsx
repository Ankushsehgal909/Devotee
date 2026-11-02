import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
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
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import { useCatalog, useCategories } from '../../api/shop';
import { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { resolveLocalizedText } from '../../utils/localization';
import { siteImages, getProductImageUrl } from '../../constants/images';

export const StoreHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { addItem, getTotalCount } = useCartStore();
  const cartItemCount = getTotalCount();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Real API hooks
  const { data: products, isLoading, refetch } = useCatalog();
  const { data: categories } = useCategories();

  const categoryOptions = useMemo(() => {
    const list = [{ id: 'all', name: 'All Samagri' }];
    if (categories && categories.length > 0) {
      categories.forEach((c) => list.push({ id: c.slug || c.id, name: c.name }));
    } else {
      list.push(
        { id: 'kits', name: 'Puja Kits' },
        { id: 'ghee', name: 'A2 Vedic Ghee' },
        { id: 'dhoop', name: 'Dhoop & Agarbatti' },
        { id: 'brass', name: 'Brass & Copper' },
        { id: 'malas', name: 'Japa Malas' }
      );
    }
    return list;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((item) => {
      const title = resolveLocalizedText(item.title, '').toLowerCase();
      const desc = resolveLocalizedText(item.description, '').toLowerCase();
      const cat = resolveLocalizedText(item.category, '').toLowerCase();
      const matchesSearch =
        !searchQuery ||
        title.includes(searchQuery.toLowerCase()) ||
        desc.includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' ||
        cat.includes(selectedCategory.toLowerCase()) ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const renderProduct = ({ item }: { item: Product }) => {
    const productTitle = resolveLocalizedText(item.title, 'Sacred Samagri');
    const productDesc = resolveLocalizedText(
      item.shortDescription || item.description,
      'Consecrated pure Vedic samagri item.'
    );
    const price = item.priceMinor ? item.priceMinor / 100 : 499;
    const imageUrl = item.imageUrl || getProductImageUrl(item);

    return (
      <Card
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.purityBadge}>
            <Icon family="material-community" name="shield-check" size={12} color="#FFFFFF" />
            <Text style={styles.purityText}>100% Pure</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Badge
              label={resolveLocalizedText(item.category, 'Samagri')}
              variant="neutral"
            />
            <View style={styles.ratingRow}>
              <Icon family="material" name="star" size={14} color={colors.goldAccent} />
              <Text style={styles.ratingText}>{item.rating || 5.0}</Text>
            </View>
          </View>

          <Text style={styles.productTitle} numberOfLines={1}>
            {productTitle}
          </Text>
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
        title="Consecrated Samagri Store"
        showBack={false}
        rightAction={
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => navigation.navigate('CartScreen')}
          >
            <Icon
              family="material-community"
              name="shopping-outline"
              size={24}
              color={colors.primary}
            />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Icon family="material" name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search A2 Ghee, Brass Diya, Havan Kit..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon family="material" name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Pills */}
      <View style={styles.categoryBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categoryOptions}
          keyExtractor={(cat) => cat.id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <TouchableOpacity
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(item.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <ProductCardSkeleton style={styles.skeletonMargin} />
          <ProductCardSkeleton style={styles.skeletonMargin} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          ListHeaderComponent={
            <View>
              <Card variant="warm" style={styles.storeBanner}>
                <View style={styles.bannerRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bannerTitle}>100% Certified Vedic Purity</Text>
                    <Text style={styles.bannerSubtitle}>
                      A2 Gir Cow Bilona Ghee, lab-tested natural herbs, and consecrated brass vigrahas. Free shipping over ₹499.
                    </Text>
                  </View>
                  <Image
                    source={{ uri: siteImages.homeAssetsPujaSamagri1Ghee }}
                    style={styles.bannerThumb}
                  />
                </View>
              </Card>

              {/* Quick Feature Cards (Best Sellers & Sacred Gifting) */}
              <View style={styles.featuresRow}>
                <TouchableOpacity
                  style={styles.featureBox}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('BestSeller')}
                >
                  <View style={styles.featureIconWrap}>
                    <Icon family="material" name="local-fire-department" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.featureTitle}>Best Sellers</Text>
                    <Text style={styles.featureSub}>Top rated & most loved</Text>
                  </View>
                  <Icon family="material" name="chevron-right" size={16} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.featureBox}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('SacredGifts')}
                >
                  <View style={[styles.featureIconWrap, { backgroundColor: '#FEF3C7' }]}>
                    <Icon family="material-community" name="gift" size={20} color={colors.goldAccent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.featureTitle}>Sacred Gifts</Text>
                    <Text style={styles.featureSub}>Personalized hampers</Text>
                  </View>
                  <Icon family="material" name="chevron-right" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          }
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Icon
                family="material-community"
                name="package-variant"
                size={36}
                color={colors.textMuted}
              />
              <Text style={styles.emptyTitle}>No Samagri Found</Text>
              <Text style={styles.emptySubtext}>
                No items match your selected filters. Try another search or reset category.
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.screenPadding,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 42,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  categoryBar: {
    marginVertical: spacing.sm,
  },
  categoryList: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.xs,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
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
    padding: spacing.md,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bannerThumb: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
  },
  bannerTitle: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: 4,
  },
  bannerSubtitle: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  featureBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    gap: 8,
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgSand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  featureSub: {
    ...typography.captionSmall,
    fontSize: 10,
    color: colors.textMuted,
  },
  productCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 160,
    width: '100%',
    backgroundColor: colors.bgCream,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  purityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(180, 83, 9, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  purityText: {
    ...typography.captionSmall,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
  },
  cardBody: {
    padding: spacing.md,
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
