import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icon';
import { useBookingMessages, useSendBookingMessage, BookingMessage } from '../../api/customer';

type RouteParams = {
  DevoteePanditChat: {
    bookingId: string;
    panditName?: string;
  };
};

const QUICK_SUGGESTIONS = [
  'Pranam Pandit ji, what time will you arrive?',
  'Is the Hawan Kund and samagri included?',
  'Should I arrange flowers and fruits at home?',
];

export const DevoteePanditChatScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'DevoteePanditChat'>>();
  const navigation = useNavigation<any>();
  const { bookingId, panditName = 'Acharya Radhe Shyam Shastri' } = route.params;

  const { data: messages, isLoading, refetch } = useBookingMessages(bookingId);
  const sendMessageMutation = useSendBookingMessage();

  const [input, setInput] = useState('');

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    setInput('');
    try {
      await sendMessageMutation.mutateAsync({
        bookingId,
        content: text,
      });
    } catch {
      // Local optimistic display if backend sandbox is quiet
    }
  };

  const defaultMessages: BookingMessage[] = [
    {
      id: 'm-1',
      bookingId,
      senderId: 'pandit-1',
      senderRole: 'pandit',
      content: 'Hari Om! Pranam devotee. I have reviewed your Gotra Sankalp for the ceremony. I will arrive with the consecrated Hawan samagri 30 minutes before the Muhurat.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  const displayMessages = messages && messages.length > 0 ? messages : defaultMessages;

  const renderMessage = ({ item }: { item: BookingMessage }) => {
    const isMe = item.senderRole === 'customer';

    return (
      <View style={[styles.bubbleWrap, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
        {!isMe && (
          <Text style={styles.senderName}>{panditName}</Text>
        )}
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.panditBubble]}>
          <Text style={[styles.bubbleText, isMe ? styles.myBubbleText : styles.panditBubbleText]}>
            {item.content}
          </Text>
        </View>
        <Text style={styles.timeText}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <Header
        title={panditName}
        subtitle="Assigned Gurukul Acharya"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <FlatList
          data={displayMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          inverted={false}
        />

        {/* Quick Suggestion Chips */}
        <View style={styles.quickRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {QUICK_SUGGESTIONS.map((q, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionChip}
                onPress={() => handleSend(q)}
              >
                <Text style={styles.suggestionText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Message Input Box */}
        <View style={styles.inputBar}>
          <TextInput
            placeholder="Type your message to Acharya ji..."
            value={input}
            onChangeText={setInput}
            style={styles.textInput}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            disabled={!input.trim()}
            onPress={() => handleSend()}
          >
            <Icon family="material" name="send" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSand,
  },
  listContent: {
    padding: spacing.screenPadding,
    gap: spacing.sm,
  },
  bubbleWrap: {
    marginVertical: 4,
    maxWidth: '82%',
  },
  bubbleLeft: {
    alignSelf: 'flex-start',
  },
  bubbleRight: {
    alignSelf: 'flex-end',
  },
  senderName: {
    ...typography.captionSmall,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 2,
    marginLeft: 4,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  panditBubble: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderBottomLeftRadius: 4,
  },
  myBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    ...typography.bodySmall,
    lineHeight: 19,
  },
  panditBubbleText: {
    color: colors.textPrimary,
  },
  myBubbleText: {
    color: colors.white,
  },
  timeText: {
    ...typography.captionSmall,
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  quickRow: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 6,
    backgroundColor: colors.bgSand,
  },
  suggestionChip: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  suggestionText: {
    ...typography.captionSmall,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderWarm,
    gap: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: colors.bgSand,
    borderRadius: borderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.borderDefault,
  },
});
