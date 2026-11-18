import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Icon } from '../../components/common/Icon';
import { CommonAppBackgroundScreen } from '../../components/common/CommonAppBackgroundScreen';
import { Skeleton } from '../../components/common/Skeleton';
import { useCatalog, useCategories } from '../../api/shop';
import { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { resolveLocalizedText } from '../../utils/localization';
import {
  localImages,
  siteImages,
  getProductImageUrl,
} from '../../constants/images';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

export const StoreHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { addItem, getTotalCount } = useCartStore();
  const cartItemCount = getTotalCount();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [addedAnimation, setAddedAnimation] = useState<Record<string, boolean>>(
    {},
  );

  // Real API hooks
  const { data: products, isLoading, refetch } = useCatalog();
  const { data: categories } = useCategories();

  const categoryOptions = useMemo(() => {
    const list = [{ id: 'all', name: 'All Samagri' }];
    if (categories && categories.length > 0) {
      categories.forEach(c => list.push({ id: c.slug || c.id, name: c.name }));
    } else if (products && products.length > 0) {
      const set = new Set<string>();
      products.forEach(p => {
        const cat = resolveLocalizedText(p.category, '');
        if (cat && !set.has(cat)) {
          set.add(cat);
          list.push({ id: cat.toLowerCase(), name: cat });
        }
      });
    } else {
      list.push(
        { id: 'kits', name: 'Consecrated Kits' },
        { id: 'ghee', name: 'A2 Cow Ghee & Oils' },
        { id: 'havan', name: 'Havan Dravya' },
        { id: 'puja', name: 'Puja Items' },
      );
    }
    return list;
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(item => {
      const title = resolveLocalizedText(item.title, '').toLowerCase();
      const desc = resolveLocalizedText(item.description, '').toLowerCase();
      const cat = resolveLocalizedText(item.category, '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch =
        !query ||
        title.includes(query) ||
        desc.includes(query) ||
        cat.includes(query);

      const matchesCategory =
        selectedCategory === 'all' ||
        cat.includes(selectedCategory.toLowerCase()) ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (item: Product) => {
    addItem(item, 1);
    setAddedAnimation(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedAnimation(prev => ({ ...prev, [item.id]: false }));
    }, 1200);
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => {
    const productTitle = resolveLocalizedText(item.title, 'Sacred Samagri');
    const categoryName = resolveLocalizedText(item.category, 'Puja Samagri');
    const price = item.priceMinor ? item.priceMinor / 100 : 499;
    const imageUrl = item.imageUrl || getProductImageUrl(item);
    const isWishlisted = Boolean(wishlist[item.id]);
    const isAdded = Boolean(addedAnimation[item.id]);

    const ratingVal = item.rating ? item.rating.toFixed(2) : '4.98';
    const reviewFormatted = item.reviewCount
      ? item.reviewCount > 999
        ? `${(item.reviewCount / 1000).toFixed(1)}k`
        : String(item.reviewCount)
      : '1.2k';

    const isBestseller = index % 3 === 2;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() =>
          navigation.navigate('ProductDetail', { productId: item.id })
        }
        activeOpacity={0.88}
      >
        {/* Top Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />

          {/* Top-Left Purity or Bestseller Badge */}
          <View
            style={[
              styles.productBadge,
              isBestseller ? styles.badgeBestseller : styles.badgePure,
            ]}
          >
            <Icon
              family="material-community"
              name={isBestseller ? 'crown' : 'check'}
              size={10}
              color="#FFFFFF"
            />
            <Text style={styles.productBadgeText}>
              {isBestseller ? 'Bestseller' : '100% Pure'}
            </Text>
          </View>

          {/* Top-Right Wishlist Heart Button */}
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={() => toggleWishlist(item.id)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            activeOpacity={0.7}
          >
            <Icon
              family="material-community"
              name={isWishlisted ? 'cards-heart' : 'cards-heart-outline'}
              size={16}
              color={isWishlisted ? '#C5221F' : '#8C3B32'}
            />
          </TouchableOpacity>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          {/* Category & Rating Row */}
          <View style={styles.categoryRatingRow}>
            <Text style={styles.categoryText} numberOfLines={1}>
              {categoryName}
            </Text>
            <View style={styles.ratingWrap}>
              <Icon family="material" name="star" size={12} color="#D97706" />
              <Text style={styles.ratingText}>
                {ratingVal} ({reviewFormatted})
              </Text>
            </View>
          </View>

          {/* Product Title */}
          <Text style={styles.productTitle} numberOfLines={2}>
            {productTitle}
          </Text>

          {/* Price & Add to Cart Button */}
          <View style={styles.priceAddRow}>
            <Text style={styles.priceText}>₹{price}</Text>
            <TouchableOpacity
              style={[styles.addBtn, isAdded && styles.addBtnSuccess]}
              onPress={() => handleAddToCart(item)}
              activeOpacity={0.8}
            >
              <Icon
                family="material-community"
                name={isAdded ? 'check' : 'cart-outline'}
                size={13}
                color="#FFFFFF"
              />
              <Text style={styles.addBtnText}>{isAdded ? 'Added' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <CommonAppBackgroundScreen
      safeAreaEdges={['top', 'left', 'right']}
      resizeMode="stretch"
    >
      {/* Top Custom Nav Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('HomeTab');
              }
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Icon
              family="material"
              name="arrow-back"
              size={22}
              color="#6B0E1E"
            />
          </TouchableOpacity>

          <View style={styles.titleColumn}>
            <Text style={styles.screenTitle}>Consecrated Samagri Store</Text>
            <Text style={styles.screenSubtitle}>Pure • Authentic • Vedic</Text>
          </View>
        </View>

        {/* Cart Icon with Item Counter Badge */}
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('CartScreen')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Icon
            family="material-community"
            name="shopping-outline"
            size={24}
            color="#6B0E1E"
          />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Product Grid / Content */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isLoading}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Search Input Bar */}
            <View style={styles.searchBar}>
              <Icon family="material" name="search" size={20} color="#7A6E63" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search A2 Ghee, Brass Diya, Havan Kit..."
                placeholderTextColor="#9E948A"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon
                    family="material"
                    name="close"
                    size={18}
                    color="#7A6E63"
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity activeOpacity={0.7}>
                  <Icon
                    family="material"
                    name="mic-none"
                    size={20}
                    color="#7A6E63"
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Horizontal Category Chips */}
            <View style={styles.categoriesContainer}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categoryOptions}
                keyExtractor={cat => cat.id}
                contentContainerStyle={styles.categoriesScroll}
                renderItem={({ item }) => {
                  const isSelected = selectedCategory === item.id;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.categoryChip,
                        isSelected && styles.categoryChipActive,
                      ]}
                      onPress={() => setSelectedCategory(item.id)}
                      activeOpacity={0.75}
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

            {/* 100% Certified Vedic Purity Hero Banner */}
            <View style={styles.heroBanner}>
              <View style={styles.bannerLeftCol}>
                <Text style={styles.bannerHeading}>
                  100% Certified{'\n'}Vedic Purity
                </Text>
                <Text style={styles.bannerDescription}>
                  A2 Gir Cow Bilona Ghee, lab-tested{'\n'}herbs, and consecrated
                  brass vigrahas.
                </Text>

                <View style={styles.shippingBadge}>
                  <Icon
                    family="material-community"
                    name="truck-delivery-outline"
                    size={14}
                    color="#8F4218"
                  />
                  <Text style={styles.shippingBadgeText}>
                    Free shipping over ₹499
                  </Text>
                </View>
              </View>

              <View style={styles.bannerRightCol}>
                <Image
                  source={{ uri: siteImages.homeAssetsPujaSamagri1Ghee }}
                  style={styles.bannerImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Quick Feature Cards (Best Sellers & Sacred Gifts) */}
            <View style={styles.quickFeaturesRow}>
              <TouchableOpacity
                style={styles.featureCard}
                onPress={() => navigation.navigate('BestSeller')}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.featureIconCircle,
                    { backgroundColor: '#FDE8E8' },
                  ]}
                >
                  <Icon
                    family="material-community"
                    name="fire"
                    size={18}
                    color="#C5221F"
                  />
                </View>
                <View style={styles.featureTextWrap}>
                  <Text style={styles.featureTitle}>Best Sellers</Text>
                  <Text style={styles.featureSubtitle}>
                    Top rated & most loved
                  </Text>
                </View>
                <Icon
                  family="material"
                  name="chevron-right"
                  size={18}
                  color="#A89481"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.featureCard}
                onPress={() => navigation.navigate('SacredGifts')}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.featureIconCircle,
                    { backgroundColor: '#FEF3C7' },
                  ]}
                >
                  <Icon
                    family="material-community"
                    name="gift-outline"
                    size={18}
                    color="#D97706"
                  />
                </View>
                <View style={styles.featureTextWrap}>
                  <Text style={styles.featureTitle}>Sacred Gifts</Text>
                  <Text style={styles.featureSubtitle}>
                    Personalized hampers
                  </Text>
                </View>
                <Icon
                  family="material"
                  name="chevron-right"
                  size={18}
                  color="#A89481"
                />
              </TouchableOpacity>
            </View>

            {/* Section Header: Popular Samagri */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Popular Samagri</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View All →</Text>
              </TouchableOpacity>
            </View>

            {/* Loading Skeletons for Grid */}
            {isLoading && (
              <View style={styles.skeletonGrid}>
                {[1, 2, 3, 4].map(k => (
                  <View
                    key={k}
                    style={[styles.skeletonCard, { width: CARD_WIDTH }]}
                  >
                    <Skeleton width="100%" height={135} borderRadius={16} />
                    <View style={{ padding: 10, gap: 6 }}>
                      <Skeleton width="60%" height={12} />
                      <Skeleton width="90%" height={14} />
                      <Skeleton width="40%" height={16} />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Icon
                family="material-community"
                name="package-variant"
                size={38}
                color={colors.textMuted}
              />
              <Text style={styles.emptyTitle}>No Samagri Found</Text>
              <Text style={styles.emptySubtitle}>
                No items match your selected filters. Try searching for other
                Vedic essentials or reset categories.
              </Text>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.resetBtnText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          ) : undefined
        }
      />
    </CommonAppBackgroundScreen>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  titleColumn: {
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
  },
  screenSubtitle: {
    fontSize: 11,
    color: '#7A6E63',
    fontWeight: '500',
    marginTop: 1,
  },
  cartButton: {
    padding: 6,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#C5221F',
    minWidth: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 36,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  headerContainer: {
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    paddingHorizontal: 14,
    height: 44,
    marginTop: 6,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#241F1A',
    paddingVertical: 0,
  },
  categoriesContainer: {
    marginVertical: 12,
  },
  categoriesScroll: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE4D6',
  },
  categoryChipActive: {
    backgroundColor: '#7E1528',
    borderColor: '#7E1528',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#241F1A',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  heroBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFFBF3',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  bannerLeftCol: {
    flex: 1.25,
  },
  bannerHeading: {
    fontSize: 19,
    fontWeight: '800',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
    lineHeight: 23,
    marginBottom: 4,
  },
  bannerDescription: {
    fontSize: 11,
    color: '#665E56',
    lineHeight: 15,
    marginBottom: 4,
  },
  bannerLotusDivider: {
    width: 75,
    height: 14,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  shippingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF1E5',
    borderWidth: 1,
    borderColor: '#FCDBC5',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  shippingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8F4218',
  },
  bannerRightCol: {
    flex: 0.95,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerImage: {
    width: 95,
    height: 95,
    borderRadius: 12,
    marginLeft: 25,
  },
  quickFeaturesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  featureCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    padding: 10,
    gap: 8,
  },
  featureIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#241F1A',
  },
  featureSubtitle: {
    fontSize: 10,
    color: '#786F66',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#6B0E1E',
    fontFamily: typography.fontFamilySerif,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7E1528',
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#3A1505',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#FAF5EE',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgePure: {
    backgroundColor: '#B45309',
  },
  badgeBestseller: {
    backgroundColor: '#821427',
  },
  productBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardBody: {
    padding: 10,
  },
  categoryRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8C3B32',
    flex: 1,
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#241F1A',
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#241F1A',
    lineHeight: 16,
    minHeight: 32,
    marginBottom: 6,
  },
  priceAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#7E1528',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7E1528',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addBtnSuccess: {
    backgroundColor: '#16A34A',
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    marginTop: 6,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    overflow: 'hidden',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    padding: 24,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#241F1A',
    marginTop: 8,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#736B63',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
  },
  resetBtn: {
    backgroundColor: '#7E1528',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
