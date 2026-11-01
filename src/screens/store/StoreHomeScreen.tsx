import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Header } from '../../components/common/Header';
import { MOCK_PRODUCTS } from '../../api/mockData';
import { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { ShoppingBag, Star, ShieldCheck, Plus } from 'lucide-react-native';

export const StoreHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { addItem, getTotalCount } = useCartStore();
  const cartItemCount = getTotalCount();

  const renderProduct = ({ item }: { item: Product }) => (
    <Card style={styles.productCard}>
      <View style={styles.cardHeader}>
        <Badge
          label="100% Pure"
          variant="sacred"
          icon={<ShieldCheck size={12} color={colors.primary} />}
        />
        <View style={styles.ratingRow}>
          <Star size={12} color={colors.goldAccent} fill={colors.goldAccent} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>

      <Text style={styles.productTitle}>{item.title}</Text>
      <Text style={styles.productDesc} numberOfLines={2}>
        {item.shortDescription}
      </Text>

      <View style={styles.productFooter}>
        <View>
          <Text style={styles.priceVal}>₹{item.priceMinor / 100}</Text>
          {item.compareAtPriceMinor && (
            <Text style={styles.strikePrice}>₹{item.compareAtPriceMinor / 100}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            addItem(item, 1);
            Alert.alert('Sacred Basket', `Added ${item.title} to your Sacred Basket!`);
          }}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Consecrated Samagri Store"
        showBack={false}
        rightAction={
          <TouchableOpacity style={styles.cartBtn} onPress={() => {}}>
            <ShoppingBag size={22} color={colors.primary} />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      <FlatList
        data={MOCK_PRODUCTS}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Card variant="warm" style={styles.storeBanner}>
            <Text style={styles.bannerTitle}>100% Certified Vedic Purity</Text>
            <Text style={styles.bannerSubtitle}>
              Hand-churned A2 Gir Cow Bilona Ghee, lab-tested natural herbs, and consecrated brass vigrahas. Free delivery over ₹499.
            </Text>
          </Card>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSand,
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
});
