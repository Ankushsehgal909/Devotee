import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonAppBackgroundScreen } from '../../components/common/CommonAppBackgroundScreen';
import { colors } from '../../theme/colors';
import { Icon } from '../../components/common/Icon';
import { useMalaStore } from '../../store/useMalaStore';
import { DEFAULT_MANTRAS } from '../../constants/vedic';
import { SacredAura } from '../../components/common/SacredAura';

export const JapamMalaScreen: React.FC = () => {
  const navigation = useNavigation<any>();
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

  const tapScaleAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadStoredMala();
  }, []);

  const activeMantra =
    DEFAULT_MANTRAS.find((m) => m.id === currentMantraId) || DEFAULT_MANTRAS[0];

  const handleBeadTap = () => {
    // Spring physics on bead tap
    Animated.sequence([
      Animated.timing(tapScaleAnim, {
        toValue: 0.94,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(tapScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse ripple
    rippleAnim.setValue(0);
    Animated.timing(rippleAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    const res = incrementBead();
    if (res.isMalaCompleted) {
      Alert.alert(
        '॥ माला पूर्णम् ॥',
        `Purna Sankalp! You have consecrated Round ${res.round} (108 Chants) of ${activeMantra.name}. May the Divine bless your family with peace and spiritual radiance.`
      );
    }
  };

  const progressPercent = Math.min(Math.round((beadCount / 108) * 100), 100);

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
          <Text style={styles.headerTitle}>Japam Mala</Text>
          <Text style={styles.headerSubtitle}>
            108 Sacred Beads Chanting Counter
          </Text>
        </View>

        <TouchableOpacity
          onPress={toggleSound}
          style={styles.soundBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.75}
        >
          <Icon
            family="material-community"
            name={soundEnabled ? 'volume-high' : 'volume-off'}
            size={22}
            color={soundEnabled ? '#6B0E1E' : '#9E8E81'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
              activeOpacity={0.8}
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
        <View style={styles.mantraCard}>
          <View style={styles.deityRow}>
            <Icon
              family="material-community"
              name="star-four-points"
              size={14}
              color="#B3802B"
            />
            <Text style={styles.deityName}>{activeMantra.deity}</Text>
          </View>
          <Text style={styles.sanskritText}>{activeMantra.sanskrit}</Text>
          <Text style={styles.meaningText}>"{activeMantra.meaning}"</Text>
        </View>

        {/* Central 108 Beads Interactive Chanting Disc */}
        <View style={styles.beadCircleContainer}>
          <SacredAura size={260} auraColor="rgba(217, 119, 6, 0.16)">
            <Animated.View
              style={{
                transform: [{ scale: tapScaleAnim }],
              }}
            >
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={handleBeadTap}
                style={styles.sacredCircleButton}
              >
                {/* Outer Ring with Golden Accents */}
                <View style={styles.outerRing}>
                  <View style={styles.innerBeadGlow}>
                    {/* Top Om Emblem */}
                    <Icon
                      family="material-community"
                      name="om"
                      size={28}
                      color="#FFEDB3"
                    />

                    {/* Live Counter Number */}
                    <Text style={styles.beadNumber}>{beadCount}</Text>

                    {/* Progress Bar & Subtext */}
                    <Text style={styles.beadMaxText}>/ 108 BEADS</Text>

                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${progressPercent}%` },
                        ]}
                      />
                    </View>

                    <Text style={styles.tapInstruction}>
                      Touch anywhere to chant
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </SacredAura>
        </View>

        {/* Chanting Stats Strip */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <Icon
                family="material-community"
                name="progress-clock"
                size={16}
                color="#6B0E1E"
              />
              <Text style={styles.statLabel}>Current Round</Text>
            </View>
            <Text style={styles.statVal}>{currentRound}</Text>
            <Text style={styles.statTarget}>Target: {targetRounds} Malas</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <Icon
                family="material-community"
                name="star-circle"
                size={16}
                color="#B3802B"
              />
              <Text style={styles.statLabel}>Lifetime Chants</Text>
            </View>
            <Text style={styles.statVal}>{totalChantsLifetime}</Text>
            <Text style={styles.statTarget}>Punya Sanchaya</Text>
          </View>
        </View>

        {/* Reset Current Round Button */}
        <TouchableOpacity
          onPress={resetCurrentRound}
          style={styles.resetBtn}
          activeOpacity={0.7}
        >
          <Icon
            family="material-community"
            name="refresh"
            size={16}
            color="#8A7669"
          />
          <Text style={styles.resetText}>Reset Current Mala</Text>
        </TouchableOpacity>
      </ScrollView>
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
  soundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FBF4EC',
    borderWidth: 1,
    borderColor: '#EBD8C3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: 'center',
    paddingBottom: 40,
  },
  mantraPillsRow: {
    gap: 8,
    paddingVertical: 6,
  },
  mantraChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECD4BC',
    backgroundColor: '#FFFFFF',
  },
  mantraChipActive: {
    backgroundColor: '#7E1528',
    borderColor: '#570E1B',
  },
  mantraChipText: {
    fontSize: 12,
    color: '#6A564A',
    fontWeight: '600',
  },
  mantraChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  mantraCard: {
    width: '100%',
    backgroundColor: '#FFFBF2',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F0DCB8',
    marginVertical: 12,
    alignItems: 'center',
    padding: 16,
    shadowColor: '#6B0E1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  deityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  deityName: {
    fontSize: 11,
    color: '#B3802B',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sanskritText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#570E1B',
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 6,
  },
  meaningText: {
    fontSize: 11.5,
    color: '#7A675B',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16.5,
  },
  beadCircleContainer: {
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sacredCircleButton: {
    width: 228,
    height: 228,
    borderRadius: 114,
    backgroundColor: '#7E1528',
    borderWidth: 5,
    borderColor: '#E5C378',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B0E1E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  outerRing: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 235, 175, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerBeadGlow: {
    width: 194,
    height: 194,
    borderRadius: 97,
    backgroundColor: '#680E1C',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  beadNumber: {
    fontSize: 52,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginTop: 2,
  },
  beadMaxText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FDE68A',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  progressTrack: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#E5C378',
    borderRadius: 2,
  },
  tapInstruction: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F2E4D5',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#5C1D24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6A564A',
  },
  statVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#7E1528',
    marginVertical: 2,
  },
  statTarget: {
    fontSize: 10,
    color: '#8A7669',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5ECE3',
  },
  resetText: {
    fontSize: 11.5,
    color: '#6A564A',
    fontWeight: '600',
  },
});
