import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import {
  useSupportThreads,
  useCreateSupportThread,
  useSupportThread,
  useSendSupportMessage,
  SupportThread,
} from '../../api/customer';
import { resolveLocalizedText } from '../../utils/localization';

const SUPPORT_TOPICS = [
  { id: 'puja_booking', label: 'Puja Booking & Acharya', icon: 'fire' },
  { id: 'samagri_delivery', label: 'Samagri Order & Delivery', icon: 'package-variant' },
  { id: 'payouts_refunds', label: 'Dakshina & Refunds', icon: 'currency-inr' },
  { id: 'account', label: 'Account & Gotra Support', icon: 'account-circle' },
];

export const SupportDeskScreen: React.FC = () => {
  const { data: threads, isLoading, refetch } = useSupportThreads();
  const createThreadMutation = useCreateSupportThread();
  const sendMessageMutation = useSendSupportMessage();

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [newTicketModal, setNewTicketModal] = useState(false);

  // New ticket state
  const [topic, setTopic] = useState('puja_booking');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  // Chat message input state
  const [replyText, setReplyText] = useState('');

  // Active thread details
  const { data: activeThread, isLoading: isThreadLoading } = useSupportThread(
    selectedThreadId || ''
  );

  const handleCreateTicket = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Required', 'Please enter a ticket title and message description.');
      return;
    }

    try {
      const created = await createThreadMutation.mutateAsync({
        title: title.trim(),
        topic,
        message: message.trim(),
      });
      setNewTicketModal(false);
      setTitle('');
      setMessage('');
      if (created?.id) {
        setSelectedThreadId(created.id);
      }
      refetch();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not create support ticket.');
    }
  };

  const handleSendMessage = async () => {
    if (!replyText.trim() || !selectedThreadId) return;

    try {
      await sendMessageMutation.mutateAsync({
        threadId: selectedThreadId,
        content: replyText.trim(),
      });
      setReplyText('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not send message.');
    }
  };

  const renderThread = ({ item }: { item: SupportThread }) => {
    const topicObj = SUPPORT_TOPICS.find((t) => t.id === item.topic);
    const topicLabel = topicObj?.label || item.topic;

    return (
      <Card style={styles.threadCard} onPress={() => setSelectedThreadId(item.id)}>
        <View style={styles.threadHeader}>
          <Badge label={topicLabel} variant="sacred" />
          <Badge
            label={item.status.toUpperCase()}
            variant={item.status === 'open' ? 'success' : 'neutral'}
          />
        </View>

        <Text style={styles.threadTitle}>{item.title}</Text>

        <View style={styles.threadFooter}>
          <Text style={styles.threadDate}>
            Created on{' '}
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })
              : 'Recently'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Text style={styles.viewText}>Open Thread</Text>
            <Icon family="material" name="chevron-right" size={16} color={colors.primary} />
          </View>
        </View>
      </Card>
    );
  };

  // If a thread is selected, show threaded chat view
  if (selectedThreadId) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Header
          title={activeThread?.title || 'Support Chat'}
          onBackPress={() => setSelectedThreadId(null)}
        />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {isThreadLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Connecting to Shastric HelpDesk...</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
            >
              <Card variant="warm" style={styles.chatIntroCard}>
                <Icon family="material" name="headset-mic" size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.chatIntroTitle}>VedSarthi Support Desk</Text>
                  <Text style={styles.chatIntroText}>
                    A dedicated support representative or Shastric advisor will assist you here.
                  </Text>
                </View>
              </Card>

              {(activeThread?.messages || []).map((msg) => {
                const isCustomer = msg.senderType === 'customer';
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageBubble,
                      isCustomer ? styles.msgCustomer : styles.msgAdmin,
                    ]}
                  >
                    <Text style={styles.msgSender}>
                      {isCustomer ? 'You (Devotee)' : 'Support Executive'}
                    </Text>
                    <Text style={isCustomer ? styles.msgTextCustomer : styles.msgTextAdmin}>
                      {msg.content}
                    </Text>
                    <Text style={styles.msgTime}>
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          )}

          <View style={styles.inputBar}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type your message..."
              placeholderTextColor={colors.textMuted}
              value={replyText}
              onChangeText={setReplyText}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !replyText.trim() && styles.sendBtnDisabled]}
              onPress={handleSendMessage}
              disabled={!replyText.trim() || sendMessageMutation.isPending}
            >
              <Icon family="material" name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header
        title="Support Desk & Help"
        rightAction={
          <TouchableOpacity onPress={() => setNewTicketModal(true)}>
            <Text style={styles.newTicketHeaderBtn}>+ New Ticket</Text>
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching your support tickets...</Text>
        </View>
      ) : (
        <FlatList
          data={threads || []}
          keyExtractor={(item) => item.id}
          renderItem={renderThread}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          ListHeaderComponent={
            <Card variant="warm" style={styles.bannerCard}>
              <View style={styles.bannerRow}>
                <Icon family="material" name="support-agent" size={28} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerTitle}>VedSarthi Shastric & Puja Desk</Text>
                  <Text style={styles.bannerSubtitle}>
                    Have queries regarding your ceremony schedule, samagri delivery, or refunds? Raise a ticket and get direct assistance.
                  </Text>
                </View>
              </View>
            </Card>
          }
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Icon family="material" name="forum" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Active Support Tickets</Text>
              <Text style={styles.emptySubtext}>
                Need help with your puja booking, dakshina refunds, or consecrated orders? Create a ticket to chat with us.
              </Text>
              <Button
                title="Create Support Ticket"
                variant="primary"
                style={{ marginTop: spacing.md }}
                onPress={() => setNewTicketModal(true)}
                leftIcon={<Icon family="material" name="add" size={18} color="#FFFFFF" />}
              />
            </Card>
          }
        />
      )}

      {/* New Ticket Modal */}
      <Modal
        visible={newTicketModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNewTicketModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Support Ticket</Text>
              <TouchableOpacity onPress={() => setNewTicketModal(false)}>
                <Icon family="material" name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Select Topic</Text>
              <View style={styles.topicsGrid}>
                {SUPPORT_TOPICS.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.topicChip, topic === t.id && styles.topicChipActive]}
                    onPress={() => setTopic(t.id)}
                  >
                    <Text
                      style={[
                        styles.topicChipText,
                        topic === t.id && styles.topicChipTextActive,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Subject / Title</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Reschedule Rudrabhishek Ceremony"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.inputLabel}>Detailed Description</Text>
              <TextInput
                style={[styles.modalInput, { minHeight: 90, textAlignVertical: 'top' }]}
                placeholder="Please describe your query with any booking or order reference..."
                placeholderTextColor={colors.textMuted}
                value={message}
                onChangeText={setMessage}
                multiline
              />

              <Button
                title={createThreadMutation.isPending ? 'Submitting...' : 'Submit Support Ticket'}
                variant="primary"
                loading={createThreadMutation.isPending}
                onPress={handleCreateTicket}
                style={{ marginTop: spacing.md, marginBottom: spacing.md }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSand,
  },
  newTicketHeaderBtn: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '700',
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
  listContent: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  bannerCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  bannerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  bannerTitle: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: 4,
  },
  bannerSubtitle: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  threadCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  threadTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  threadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderWarm,
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
  },
  threadDate: {
    ...typography.captionSmall,
    color: colors.textMuted,
  },
  viewText: {
    ...typography.caption,
    color: colors.primary,
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
  messagesContainer: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.lg,
  },
  chatIntroCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    padding: spacing.sm,
  },
  chatIntroTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  chatIntroText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  msgCustomer: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  msgAdmin: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  msgSender: {
    ...typography.captionSmall,
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  msgTextCustomer: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  msgTextAdmin: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  msgTime: {
    ...typography.captionSmall,
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    padding: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.borderWarm,
    gap: spacing.xs,
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.bgSand,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    height: 42,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.borderWarm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  inputLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  topicChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    backgroundColor: colors.bgSand,
  },
  topicChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  topicChipText: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  topicChipTextActive: {
    color: '#FFFFFF',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
});
