import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Header } from '../../components/common/Header';
import { useMalaStore } from '../../store/useMalaStore';
import { DEFAULT_MANTRAS } from '../../constants/vedic';
import { RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react-native';

export const JapamMalaScreen: React.FC = () => {
  const {
    currentMantraId,
    beadCount,
    currentRound,
    targetRounds,
    totalChantsLifetime,
    soundEnabled,
    setMantra,
    incrementBead,
    resetCurrentRound,
    toggleSound,
    loadStoredMala,
  } = useMalaStore();

  useEffect(() => {
    loadStoredMala();
  }, []);

  const activeMantra =
    DEFAULT_MANTRAS.find((m) => m.id === currentMantraId) || DEFAULT_MANTRAS[0];

  const handleBeadTap = () => {
    const res = incrementBead();
    if (res.isMalaCompleted) {
      Alert.alert(
        'Mala Complete',
        `Har Har Mahadev! You have completed Round ${res.round} (108 Chants)! May the Divine bless you.`
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Japam Mala (108 Beads)"
        showBack={false}
        rightAction={
          <TouchableOpacity onPress={toggleSound} style={styles.iconBtn}>
            {soundEnabled ? (
              <Volume2 size={20} color={colors.textPrimary} />
            ) : (
              <VolumeX size={20} color={colors.textMuted} />
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Mantra Selector Carousel Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mantraPillsRow}
        >
          {DEFAULT_MANTRAS.map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => setMantra(m.id)}
              style={[
                styles.mantraChip,
                m.id === currentMantraId && styles.mantraChipActive,
              ]}
            >
              <Text
                style={[
                  styles.mantraChipText,
                  m.id === currentMantraId && styles.mantraChipTextActive,
                ]}
              >
                {m.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sacred Sanskrit Mantra Card */}
        <Card variant="warm" style={styles.mantraCard}>
          <View style={styles.deityRow}>
            <Sparkles size={16} color={colors.goldAccent} />
            <Text style={styles.deityName}>{activeMantra.deity}</Text>
          </View>
          <Text style={styles.sanskritText}>{activeMantra.sanskrit}</Text>
          <Text style={styles.meaningText}>{activeMantra.meaning}</Text>
        </Card>

        {/* Central 108 Beads Interactive Chanting Ring */}
        <View style={styles.beadCircleContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleBeadTap}
            style={styles.sacredCircleButton}
          >
            <View style={styles.innerBeadGlow}>
              <Text style={styles.beadNumber}>{beadCount}</Text>
              <Text style={styles.beadMaxText}>/ 108 BEADS</Text>
              <Text style={styles.tapInstruction}>Tap anywhere to chant</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Chanting Stats Strip */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statVal}>{currentRound}</Text>
            <Text style={styles.statLabel}>Current Round</Text>
            <Text style={styles.statTarget}>Target: {targetRounds}</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statVal}>{totalChantsLifetime}</Text>
            <Text style={styles.statLabel}>Lifetime Chants</Text>
            <Text style={styles.statTarget}>Punya Sanchaya</Text>
          </Card>
        </View>

        {/* Reset Current Round Button */}
        <TouchableOpacity onPress={resetCurrentRound} style={styles.resetBtn}>
          <RotateCcw size={16} color={colors.textMuted} />
          <Text style={styles.resetText}>Reset Current Mala</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSand,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.screenPadding,
    alignItems: 'center',
    paddingBottom: spacing.xxxl,
  },
  mantraPillsRow: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  mantraChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    backgroundColor: '#FFFFFF',
  },
  mantraChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  mantraChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  mantraChipTextActive: {
    color: '#FFFFFF',
  },
  mantraCard: {
    width: '100%',
    marginVertical: spacing.md,
    alignItems: 'center',
    padding: spacing.lg,
  },
  deityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  deityName: {
    ...typography.caption,
    color: colors.goldAccent,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sanskritText: {
    ...typography.mantraText,
    color: colors.primaryDark,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  meaningText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  beadCircleContainer: {
    marginVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sacredCircleButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primary,
    borderWidth: 6,
    borderColor: colors.goldAccent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  innerBeadGlow: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beadNumber: {
    fontSize: 54,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  beadMaxText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#FDE68A',
    letterSpacing: 1.5,
  },
  tapInstruction: {
    ...typography.captionSmall,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    marginTop: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  statVal: {
    ...typography.h2,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statTarget: {
    ...typography.captionSmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xl,
    padding: spacing.sm,
  },
  resetText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
