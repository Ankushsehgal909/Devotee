import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonAppBackgroundScreen } from '../../components/common/CommonAppBackgroundScreen';
import { colors } from '../../theme/colors';
import { Icon } from '../../components/common/Icon';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import { useCatalog } from '../../api/shop';
import { SacredShimmer } from '../../components/common/SacredShimmer';
import { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { resolveLocalizedText } from '../../utils/localization';
import { getProductImageUrl } from '../../constants/images';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

type SortOption = 'top_rated' | 'popular' | 'price_asc' | 'price_desc';
type PriceBracket = 'all' | 'under500' | '500to1500' | 'above1500';

export const BestSellerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { addItem, getTotalCount } = useCartStore();
  const cartCount = getTotalCount();

  const { data: products, isLoading, refetch } = useCatalog();

  const [sortBy, setSortBy] = useState<SortOption>('top_rated');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [priceBracket, setPriceBracket] = useState<PriceBracket>('all');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const sortedAndFiltered = useMemo(() => {
    if (!products) return [];

    let list = [...products];

    // Filter in-stock
    if (onlyInStock) {
      list = list.filter((p) => p.inStock);
    }

    // Filter price brackets
    if (priceBracket === 'under500') {
      list = list.filter((p) => p.priceMinor / 100 < 500);
    } else if (priceBracket === '500to1500') {
      list = list.filter(
        (p) => p.priceMinor / 100 >= 500 && p.priceMinor / 100 <= 1500
      );
    } else if (priceBracket === 'above1500') {
      list = list.filter((p) => p.priceMinor / 100 > 1500);
    }

    // Sort options
    if (sortBy === 'top_rated') {
      list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else if (sortBy === 'popular') {
      list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (sortBy === 'price_asc') {
      list.sort((a, b) => a.priceMinor - b.priceMinor);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.priceMinor - a.priceMinor);
    }

    return list;
  }, [products, sortBy, onlyInStock, priceBracket]);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (item: Product) => {
    addItem(item, 1);
    setAddedMap((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [item.id]: false }));
    }, 1400);
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => {
    const title = resolveLocalizedText(item.title, 'Vedic Samagri');
    const categoryName = resolveLocalizedText(item.category, 'Samagri');
    const price = item.priceMinor ? Math.round(item.priceMinor / 100) : 499;
    const originalPrice = Math.round(price * 1.3);
    const imageUrl = item.imageUrl || getProductImageUrl(item);
    const isWishlisted = Boolean(wishlist[item.id]);
    const isAdded = Boolean(addedMap[item.id]);

    const ratingVal = item.rating ? item.rating.toFixed(1) : '4.9';
    const reviewFormatted = item.reviewCount
      ? item.reviewCount > 999
        ? `${(item.reviewCount / 1000).toFixed(1)}k`
        : String(item.reviewCount)
      : '1.2k';

    const rankLabel =
      index === 0
        ? '#1 Bestseller'
        : index === 1
        ? '#2 Bestseller'
        : index === 2
        ? '#3 Bestseller'
        : 'Top Choice';

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        activeOpacity={0.88}
      >
        {/* Top Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />

          {/* Top-Left Rank or Bestseller Badge with Gold Shimmer */}
          <SacredShimmer
            style={[
              styles.productBadge,
              index < 3 ? styles.badgeTopRank : styles.badgeNormal,
            ]}
            borderRadius={10}
            duration={index === 0 ? 1800 : 2500}
          >
            <View style={styles.badgeInnerRow}>
              <Icon
                family="material-community"
                name={index < 3 ? 'crown' : 'fire'}
                size={11}
                color="#FFFFFF"
              />
              <Text style={styles.productBadgeText}>{rankLabel}</Text>
            </View>
          </SacredShimmer>

          {/* Top-Right Wishlist Heart Button */}
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={() => toggleWishlist(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Icon
              family="material-community"
              name={isWishlisted ? 'cards-heart' : 'cards-heart-outline'}
              size={17}
              color={isWishlisted ? '#C5221F' : '#7A4843'}
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
            {title}
          </Text>

          {/* Price & Add to Cart Action Row */}
          <View style={styles.priceAddRow}>
            <View style={styles.priceCol}>
              <Text style={styles.priceText}>₹{price}</Text>
              <Text style={styles.originalPriceText}>₹{originalPrice}</Text>
            </View>

            <TouchableOpacity
              style={[styles.addBtn, isAdded && styles.addBtnSuccess]}
              onPress={() => handleAddToCart(item)}
              activeOpacity={0.8}
            >
              <Icon
                family="material-community"
                name={isAdded ? 'check' : 'cart-plus'}
                size={14}
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
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon family="material" name="arrow-back" size={22} color="#6B0E1E" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Best Sellers</Text>
          <Text style={styles.headerSubtitle}>
            Most Revered Consecrated Samagri
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cartIconBtn}
          onPress={() => navigation.navigate('CartScreen')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.75}
        >
          <Icon
            family="material-community"
            name="shopping-outline"
            size={23}
            color="#6B0E1E"
          />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Sorting Tabs Bar */}
      <View style={styles.sortBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          <TouchableOpacity
            style={[
              styles.sortChip,
              sortBy === 'top_rated' && styles.sortChipActive,
            ]}
            onPress={() => setSortBy('top_rated')}
            activeOpacity={0.8}
          >
            <Icon
              family="material"
              name="star"
              size={13}
              color={sortBy === 'top_rated' ? '#FFFFFF' : '#8A4F1D'}
            />
            <Text
              style={[
                styles.sortChipText,
                sortBy === 'top_rated' && styles.sortChipTextActive,
              ]}
            >
              Top Rated
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'popular' && styles.sortChipActive]}
            onPress={() => setSortBy('popular')}
            activeOpacity={0.8}
          >
            <Icon
              family="material-community"
              name="fire"
              size={14}
              color={sortBy === 'popular' ? '#FFFFFF' : '#8A4F1D'}
            />
            <Text
              style={[
                styles.sortChipText,
                sortBy === 'popular' && styles.sortChipTextActive,
              ]}
            >
              Most Popular
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortChip,
              sortBy === 'price_asc' && styles.sortChipActive,
            ]}
            onPress={() => setSortBy('price_asc')}
            activeOpacity={0.8}
          >
            <Icon
              family="material-community"
              name="arrow-up"
              size={13}
              color={sortBy === 'price_asc' ? '#FFFFFF' : '#8A4F1D'}
            />
            <Text
              style={[
                styles.sortChipText,
                sortBy === 'price_asc' && styles.sortChipTextActive,
              ]}
            >
              Price: Low to High
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortChip,
              sortBy === 'price_desc' && styles.sortChipActive,
            ]}
            onPress={() => setSortBy('price_desc')}
            activeOpacity={0.8}
          >
            <Icon
              family="material-community"
              name="arrow-down"
              size={13}
              color={sortBy === 'price_desc' ? '#FFFFFF' : '#8A4F1D'}
            />
            <Text
              style={[
                styles.sortChipText,
                sortBy === 'price_desc' && styles.sortChipTextActive,
              ]}
            >
              Price: High to Low
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Filter Chips Bar (Price brackets & Stock) */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              priceBracket === 'all' && styles.filterChipActive,
            ]}
            onPress={() => setPriceBracket('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                priceBracket === 'all' && styles.filterChipTextActive,
              ]}
            >
              All Prices
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              priceBracket === 'under500' && styles.filterChipActive,
            ]}
            onPress={() => setPriceBracket('under500')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                priceBracket === 'under500' && styles.filterChipTextActive,
              ]}
            >
              Under ₹500
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              priceBracket === '500to1500' && styles.filterChipActive,
            ]}
            onPress={() => setPriceBracket('500to1500')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                priceBracket === '500to1500' && styles.filterChipTextActive,
              ]}
            >
              ₹500 - ₹1500
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              priceBracket === 'above1500' && styles.filterChipActive,
            ]}
            onPress={() => setPriceBracket('above1500')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                priceBracket === 'above1500' && styles.filterChipTextActive,
              ]}
            >
              ₹1500+
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              onlyInStock && styles.filterChipActiveStock,
            ]}
            onPress={() => setOnlyInStock(!onlyInStock)}
            activeOpacity={0.8}
          >
            <Icon
              family="material-community"
              name={onlyInStock ? 'check-circle' : 'circle-outline'}
              size={13}
              color={onlyInStock ? '#FFFFFF' : '#6A564A'}
            />
            <Text
              style={[
                styles.filterChipText,
                onlyInStock && styles.filterChipTextActive,
              ]}
            >
              In Stock Only
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main List / Grid */}
      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <ProductCardSkeleton style={{ marginBottom: 14 }} />
          <ProductCardSkeleton style={{ marginBottom: 14 }} />
        </View>
      ) : (
        <FlatList
          data={sortedAndFiltered}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            /* Divine Sanctum Hero Card */
            <View style={styles.heroBanner}>
              <View style={styles.heroGlowOverlay} />
              <View style={styles.heroRow}>
                <View style={styles.heroTextCol}>
                  <View style={styles.heroBadgeRow}>
                    <Icon
                      family="material-community"
                      name="seal-variant"
                      size={14}
                      color="#B3802B"
                    />
                    <Text style={styles.heroBadgeText}>
                      VEDIC PURITY GUARANTEE
                    </Text>
                  </View>
                  <Text style={styles.heroTitle}>
                    Top Loved Sanatan Samagri
                  </Text>
                  <Text style={styles.heroSubtitle}>
                    Consecrated with sacred Vedic mantras & authenticated for
                    100% Shastric purity. Trusted by 10,000+ devotee homes.
                  </Text>
                </View>

                <View style={styles.heroIconBox}>
                  <Icon
                    family="material-community"
                    name="crown"
                    size={28}
                    color="#B3802B"
                  />
                </View>
              </View>

              {/* Trust Pillars */}
              <View style={styles.trustPillarsRow}>
                <View style={styles.trustPillar}>
                  <Icon
                    family="material-community"
                    name="shield-check"
                    size={13}
                    color="#166534"
                  />
                  <Text style={styles.trustPillarText}>100% Shastric Pure</Text>
                </View>
                <View style={styles.trustPillarDivider} />
                <View style={styles.trustPillar}>
                  <Icon
                    family="material-community"
                    name="candle"
                    size={13}
                    color="#854D0E"
                  />
                  <Text style={styles.trustPillarText}>Mantra Consecrated</Text>
                </View>
                <View style={styles.trustPillarDivider} />
                <View style={styles.trustPillar}>
                  <Icon
                    family="material-community"
                    name="truck-fast-outline"
                    size={13}
                    color="#1E40AF"
                  />
                  <Text style={styles.trustPillarText}>Express Delivery</Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Icon
                  family="material-community"
                  name="package-variant-closed"
                  size={36}
                  color="#A68D79"
                />
              </View>
              <Text style={styles.emptyTitle}>No Samagri Found</Text>
              <Text style={styles.emptySubtitle}>
                No consecrated best seller matches your current filter criteria.
              </Text>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setPriceBracket('all');
                  setOnlyInStock(false);
                  setSortBy('top_rated');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.resetBtnText}>Reset All Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </CommonAppBackgroundScreen>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: '#F2E4D5',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FBF4EC',
    borderWidth: 1,
    borderColor: '#EBD8C3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#6B0E1E',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#8A5843',
    fontWeight: '500',
    marginTop: 1,
  },
  cartIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FBF4EC',
    borderWidth: 1,
    borderColor: '#EBD8C3',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: colors.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  sortBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: '#F5EAE0',
    paddingVertical: 7,
  },
  filterBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderBottomWidth: 1,
    borderBottomColor: '#F2E4D5',
    paddingVertical: 6,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F7EDE2',
    borderWidth: 1,
    borderColor: '#ECD4BC',
  },
  sortChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  sortChipText: {
    fontSize: 11.5,
    color: '#684534',
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8D7C6',
  },
  filterChipActive: {
    backgroundColor: '#D97706',
    borderColor: '#B45309',
  },
  filterChipActiveStock: {
    backgroundColor: '#15803D',
    borderColor: '#166534',
  },
  filterChipText: {
    fontSize: 11,
    color: '#5C4A3E',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  heroBanner: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFBF2',
    borderWidth: 1.5,
    borderColor: '#F0DCB8',
    padding: 14,
    shadowColor: '#6B0E1E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  heroGlowOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  heroTextCol: {
    flex: 1,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#925C15',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6B0E1E',
    marginBottom: 3,
  },
  heroSubtitle: {
    fontSize: 11.5,
    color: '#6A5547',
    lineHeight: 16.5,
  },
  heroIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustPillarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5E4C8',
  },
  trustPillar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustPillarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#554238',
  },
  trustPillarDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#EBD5BA',
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F2E4D5',
    overflow: 'hidden',
    shadowColor: '#5C1D24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 135,
    backgroundColor: '#FBF5EC',
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
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeTopRank: {
    backgroundColor: '#B42318',
  },
  badgeNormal: {
    backgroundColor: '#B54708',
  },
  badgeInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  productBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0E2D2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
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
    fontWeight: '700',
    color: '#936136',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    flex: 1,
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#3B332E',
  },
  productTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#241D1A',
    lineHeight: 16.5,
    minHeight: 33,
    marginBottom: 8,
  },
  priceAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  priceCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#7E1528',
  },
  originalPriceText: {
    fontSize: 11,
    color: '#9C8879',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  addBtnSuccess: {
    backgroundColor: '#166534',
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skeletonContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F5ECE3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6B0E1E',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#7A675B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  resetBtn: {
    backgroundColor: '#6B0E1E',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
