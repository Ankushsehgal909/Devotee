import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { PujaStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { MOCK_SERVICES } from '../../api/mockData';
import {
  Clock,
  Star,
  CheckCircle2,
  Package,
  Calendar,
  Sparkles,
  MapPin,
  Video,
} from 'lucide-react-native';

type PujaDetailRouteProp = RouteProp<PujaStackParamList, 'PujaDetail'>;

export const PujaDetailScreen: React.FC = () => {
  const route = useRoute<PujaDetailRouteProp>();
  const navigation = useNavigation<any>();
  const { serviceId } = route.params;

  const service = MOCK_SERVICES.find((s) => s.id === serviceId) || MOCK_SERVICES[0];
  const [selectedMode, setSelectedMode] = useState<string>(service.availableModes[0]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title={service.title} showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Divine Hero Header Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroBadgeRow}>
            <Badge label={service.category} variant="gold" />
            <View style={styles.ratingBadge}>
              <Star size={12} color={colors.goldAccent} fill={colors.goldAccent} />
              <Text style={styles.ratingText}>{service.rating} ({service.reviewCount} reviews)</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{service.title}</Text>
          <Text style={styles.heroSubtitle}>{service.subtitle}</Text>
          <View style={styles.durationRow}>
            <Clock size={14} color="#FDE68A" />
            <Text style={styles.durationText}>Duration: ~{service.durationMinutes} Minutes (Complete Vidhi)</Text>
          </View>
        </View>

        {/* Ceremony Mode Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Select Ceremony Mode</Text>
          <View style={styles.modeGrid}>
            {service.availableModes.map((mode) => {
              const isSelected = selectedMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setSelectedMode(mode)}
                  style={[styles.modeCard, isSelected && styles.modeCardSelected]}
                >
                  {mode === 'home_visit' ? (
                    <MapPin size={20} color={isSelected ? colors.primary : colors.textMuted} />
                  ) : (
                    <Video size={20} color={isSelected ? colors.primary : colors.textMuted} />
                  )}
                  <Text style={[styles.modeTitle, isSelected && styles.modeTitleSelected]}>
                    {mode === 'home_visit' ? 'Doorstep Visit' : 'Live Online'}
                  </Text>
                  <Text style={styles.modeDesc}>
                    {mode === 'home_visit' ? 'Acharya comes to home' : 'Interactive 1:1 HD'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Significance & Purana Reference */}
        {service.significance && (
          <Card variant="warm" style={styles.section}>
            <View style={styles.significanceHeader}>
              <Sparkles size={18} color={colors.goldAccent} />
              <Text style={styles.significanceTitle}>Vedic Significance & Benefits</Text>
            </View>
            <Text style={styles.significanceBody}>{service.significance}</Text>
          </Card>
        )}

        {/* Rituals Included Checklist */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Sacred Rituals Included ({service.ritualsIncluded.length})</Text>
          <Card style={styles.checklistCard}>
            {service.ritualsIncluded.map((ritual, idx) => (
              <View key={idx} style={styles.checklistItem}>
                <CheckCircle2 size={16} color={colors.success} style={styles.checkIcon} />
                <Text style={styles.checklistText}>{ritual}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Samagri Responsibilities Split */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Samagri & Preparations</Text>
          <Card style={styles.samagriCard}>
            <View style={styles.samagriCol}>
              <View style={styles.samagriHeader}>
                <Package size={16} color={colors.primary} />
                <Text style={styles.samagriColTitle}>What VedSarthi Brings</Text>
              </View>
              {service.samagriProvidedByUs.map((item, i) => (
                <Text key={i} style={styles.samagriItem}>• {item}</Text>
              ))}
            </View>

            <View style={styles.samagriDivider} />

            <View style={styles.samagriCol}>
              <View style={styles.samagriHeader}>
                <Clock size={16} color={colors.goldAccent} />
                <Text style={styles.samagriColTitle}>Devotee Arranges at Home</Text>
              </View>
              {service.samagriDevoteeArranges.map((item, i) => (
                <Text key={i} style={styles.samagriItem}>• {item}</Text>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceTag}>Total Dakshina</Text>
          <Text style={styles.priceVal}>₹{service.priceMinor / 100}</Text>
          <Text style={styles.advanceNote}>Advance: 25% (₹{(service.priceMinor * 0.25) / 100})</Text>
        </View>
        <Button
          title="Select Shubh Muhurat"
          onPress={() => {
            Alert.alert('Shubh Muhurat', `Ready to book slot for ${service.title}! In Module 3, this opens the Muhurat & Gotra Sankalp flow.`);
          }}
          rightIcon={<Calendar size={18} color="#FFFFFF" />}
          size="lg"
          style={styles.bookActionBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSand,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroBanner: {
    backgroundColor: colors.primary,
    padding: spacing.screenPadding,
    paddingVertical: spacing.xl,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
  },
  ratingText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  heroTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    ...typography.bodyMedium,
    color: '#FDE68A',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: spacing.screenPadding,
    marginTop: spacing.lg,
  },
  sectionHeading: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modeGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  modeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  modeTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 6,
  },
  modeTitleSelected: {
    color: colors.primary,
  },
  modeDesc: {
    ...typography.captionSmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  significanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  significanceTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  significanceBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  checklistCard: {
    paddingVertical: spacing.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderWarm,
  },
  checkIcon: {
    marginRight: 8,
  },
  checklistText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
  samagriCard: {
    padding: spacing.md,
  },
  samagriCol: {
    marginBottom: spacing.sm,
  },
  samagriHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  samagriColTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  samagriItem: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    marginLeft: 6,
  },
  samagriDivider: {
    height: 1,
    backgroundColor: colors.borderWarm,
    marginVertical: spacing.sm,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.borderWarm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
  priceTag: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },
  priceVal: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '800',
  },
  advanceNote: {
    ...typography.captionSmall,
    color: colors.success,
    fontWeight: '600',
  },
  bookActionBtn: {
    flex: 1,
    marginLeft: spacing.lg,
  },
});
