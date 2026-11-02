import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
import { useProduct } from '../../api/shop';
import { useCartStore } from '../../store/useCartStore';
import { resolveLocalizedText } from '../../utils/localization';
import { getProductImageUrl } from '../../constants/images';

type ParamList = {
  ProductDetail: { productId: string };
};

export const ProductDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, 'ProductDetail'>>();
  const navigation = useNavigation<any>();
  const productId = route.params?.productId;

  const { data: product, isLoading } = useProduct(productId);
  const { addItem, getTotalCount } = useCartStore();
  const cartCount = getTotalCount();

  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  if (isLoading || !product) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Header title="Sacred Samagri Item" />
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching Consecrated Item Details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const title = resolveLocalizedText(product.title, 'Consecrated Samagri');
  const description = resolveLocalizedText(
    product.description || product.shortDescription,
    'Certified pure Vedic samagri consecrated according to Vedic traditions.'
  );
  const category = resolveLocalizedText(product.category, 'Puja Samagri');

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const priceMinor = selectedVariant ? selectedVariant.priceMinor : product.priceMinor;
  const price = priceMinor / 100;
  const compareAtPrice = product.compareAtPriceMinor
    ? product.compareAtPriceMinor / 100
    : undefined;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.imageUrl || getProductImageUrl(product)];

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariantId);
    Alert.alert('Added to Sacred Basket', `${title} (${quantity}x) has been added to your basket.`);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, selectedVariantId);
    navigation.navigate('CartScreen');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header
        title={title}
        rightAction={
          <TouchableOpacity
            style={styles.cartIconBtn}
            onPress={() => navigation.navigate('CartScreen')}
          >
            <Icon
              family="material-community"
              name="shopping-outline"
              size={24}
              color={colors.primary}
            />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Product Image Carousel/Preview */}
        <View style={styles.imageGallery}>
          <Image
            source={{ uri: images[activeImageIndex] || images[0] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <View style={styles.purityTag}>
            <Icon family="material-community" name="shield-check" size={14} color="#FFFFFF" />
            <Text style={styles.purityTagText}>100% Vedic Certified Purity</Text>
          </View>
        </View>

        {/* Thumbnail Selector (if multiple images) */}
        {images.length > 1 && (
          <View style={styles.thumbnailRow}>
            {images.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.thumbWrapper,
                  activeImageIndex === idx && styles.thumbWrapperActive,
                ]}
                onPress={() => setActiveImageIndex(idx)}
              >
                <Image source={{ uri: img }} style={styles.thumbImage} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Title, Category & Pricing */}
        <Card style={styles.infoCard}>
          <View style={styles.metaRow}>
            <Badge label={category} variant="sacred" />
            <View style={styles.ratingBadge}>
              <Icon family="material" name="star" size={16} color={colors.goldAccent} />
              <Text style={styles.ratingVal}>{product.rating || 5.0}</Text>
              <Text style={styles.reviewsCount}>({product.reviewCount || 42} reviews)</Text>
            </View>
          </View>

          <Text style={styles.productTitle}>{title}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceVal}>₹{price}</Text>
            {compareAtPrice && <Text style={styles.strikePrice}>₹{compareAtPrice}</Text>}
            <Badge label="Free Delivery > ₹499" variant="success" />
          </View>
        </Card>

        {/* Variants Selector (if available) */}
        {product.variants && product.variants.length > 0 && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Select Size / Weight</Text>
            <View style={styles.variantList}>
              {product.variants.map((v) => {
                const isSelected = selectedVariantId === v.id;
                return (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.variantChip, isSelected && styles.variantChipSelected]}
                    onPress={() => setSelectedVariantId(v.id)}
                  >
                    <Text
                      style={[
                        styles.variantChipTitle,
                        isSelected && styles.variantChipTitleSelected,
                      ]}
                    >
                      {v.title}
                    </Text>
                    <Text
                      style={[
                        styles.variantChipPrice,
                        isSelected && styles.variantChipPriceSelected,
                      ]}
                    >
                      ₹{v.priceMinor / 100}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        )}

        {/* Quantity Controls */}
        <Card style={styles.sectionCard}>
          <View style={styles.qtyRow}>
            <View>
              <Text style={styles.qtyTitle}>Quantity</Text>
              <Text style={styles.qtySubtitle}>Consecrated units for your puja</Text>
            </View>
            <View style={styles.qtyControlBox}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Icon family="material" name="remove" size={18} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.qtyCount}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Icon family="material" name="add" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Certified Vedic Purity Details */}
        <Card variant="warm" style={styles.sectionCard}>
          <View style={styles.purityHeader}>
            <Icon family="material-community" name="certificate" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Consecration & Vedic Authenticity</Text>
          </View>
          <Text style={styles.purityDesc}>
            {product.isPurityCertified
              ? 'Every batch is prepared according to Shastric injunctions, using pure Gir cow milk, whole natural herbs, and certified lead-free brass. Tested in certified Vedic testing laboratories.'
              : 'Authentic items collected from traditional heritage artisan communities.'}
          </Text>
          {product.labCertificateBatch && (
            <View style={styles.batchRow}>
              <Icon family="material" name="verified" size={16} color={colors.success} />
              <Text style={styles.batchText}>Lab Batch: {product.labCertificateBatch}</Text>
            </View>
          )}
        </Card>

        {/* Shastric Description & Usage Guide */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Shastric Description & Vidhi</Text>
          <Text style={styles.descText}>{description}</Text>
          {product.vedicUsageGuide && (
            <View style={styles.usageBox}>
              <Text style={styles.usageTitle}>Ritual Usage Guide:</Text>
              <Text style={styles.usageText}>{product.vedicUsageGuide}</Text>
            </View>
          )}
        </Card>

        {/* Bottom CTA Actions */}
        <View style={styles.actionButtons}>
          <Button
            title="Add to Sacred Basket"
            variant="outline"
            style={styles.actionBtnHalf}
            onPress={handleAddToCart}
            leftIcon={<Icon family="material-community" name="cart-plus" size={18} color={colors.primary} />}
          />
          <Button
            title="Buy Now"
            variant="primary"
            style={styles.actionBtnHalf}
            onPress={handleBuyNow}
            leftIcon={<Icon family="material-community" name="flash" size={18} color="#FFFFFF" />}
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
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  imageGallery: {
    position: 'relative',
    height: 240,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.bgCream,
    marginBottom: spacing.sm,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  purityTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(180, 83, 9, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  purityTagText: {
    ...typography.captionSmall,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  thumbnailRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  thumbWrapper: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbWrapperActive: {
    borderColor: colors.primary,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingVal: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reviewsCount: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },
  productTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceVal: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '800',
  },
  strikePrice: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  sectionCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  variantList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  variantChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  variantChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.bgCream,
  },
  variantChipTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  variantChipTitleSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  variantChipPrice: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  variantChipPriceSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  qtySubtitle: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },
  qtyControlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCream,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  qtyBtn: {
    padding: 8,
  },
  qtyCount: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primary,
    paddingHorizontal: 12,
  },
  purityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  purityDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  batchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  batchText: {
    ...typography.captionSmall,
    color: colors.success,
    fontWeight: '600',
  },
  descText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  usageBox: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.bgCream,
    borderRadius: borderRadius.sm,
  },
  usageTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  usageText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  actionBtnHalf: {
    flex: 1,
  },
});
