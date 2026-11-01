import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Header } from '../../components/common/Header';
import { MOCK_SERVICES } from '../../api/mockData';
import { PujaService } from '../../types';
import { Clock, Star, Flame, ChevronRight } from 'lucide-react-native';

const CATEGORIES = ['All', 'Prosperity & Vrat', 'Health & Dosha Nivaran', 'Vastu & Sanskar'];

export const PujaCatalogScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredServices =
    activeCategory === 'All'
      ? MOCK_SERVICES
      : MOCK_SERVICES.filter((s) => s.category === activeCategory);

  const renderServiceItem = ({ item }: { item: PujaService }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('PujaDetail', { serviceId: item.id })}
    >
      <View style={styles.cardTop}>
        <View style={styles.flameIcon}>
          <Flame size={20} color={colors.primary} />
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.serviceTitle}>{item.title}</Text>
          <View style={styles.ratingRow}>
            <Star size={12} color={colors.goldAccent} fill={colors.goldAccent} />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewText}>({item.reviewCount} reviews)</Text>
          </View>
        </View>
      </View>

      <Text style={styles.serviceSubtitle} numberOfLines={2}>
        {item.subtitle}
      </Text>

      <View style={styles.modeTagsRow}>
        {item.availableModes.map((mode) => (
          <Badge
            key={mode}
            label={mode === 'home_visit' ? 'Doorstep Visit' : mode === 'online' ? 'Live Online' : 'Temple'}
            variant="sacred"
            style={styles.modeBadge}
          />
        ))}
      </View>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.priceLabel}>Ritual Dakshina</Text>
          <Text style={styles.priceValue}>₹{item.priceMinor / 100}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('PujaDetail', { serviceId: item.id })}
        >
          <Text style={styles.bookBtnText}>Select Vidhi</Text>
          <ChevronRight size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Sacred Vedic Pujas" showBack={false} />

      {/* Category Filter Pills */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveCategory(item)}
              style={[
                styles.categoryChip,
                activeCategory === item ? styles.categoryActive : styles.categoryInactive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === item ? styles.categoryTextActive : styles.categoryTextInactive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        renderItem={renderServiceItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSand,
  },
  categoryContainer: {
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgSand,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderWarm,
  },
  categoryList: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.sm,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  categoryActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  categoryInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.borderWarm,
  },
  categoryText: {
    ...typography.caption,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  categoryTextInactive: {
    color: colors.textSecondary,
  },
  listContent: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 6,
  },
  flameIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderInfo: {
    flex: 1,
  },
  serviceTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    ...typography.captionSmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reviewText: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },
  serviceSubtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  modeTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  modeBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderWarm,
    paddingTop: spacing.sm,
  },
  priceLabel: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },
  priceValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.md,
  },
  bookBtnText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
