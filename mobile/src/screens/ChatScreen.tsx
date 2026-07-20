import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

import { ChatBubble, Composer, LimitCounter, ModePill, Screen, TypingBubble } from '../components';
import { colors, spacing, type } from '../theme';
import { isPending, useChatStore } from '../store';
import type { MessageDto } from '../api';
import { useKeyboardOffset } from '../lib/useKeyboardOffset';
import { t } from '../i18n';

/** Sentinel row that renders the typing indicator as the last item in the list. */
const TYPING_ROW: MessageDto = { id: 'typing', sender: 'BOT', content: '', createdAt: '' };

export default function ChatScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<MessageDto>>(null);
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const keyboardHeight = useKeyboardOffset();

  const { mode, messages, limit, sending, opening, error, setMode, send, loadLimit, openConversation } =
    useChatStore();

  useEffect(() => {
    void loadLimit();
  }, [loadLimit]);

  // The persona opens the conversation, so an empty thread is a state to resolve, not to display.
  // Re-runs on mode change because setMode clears conversationId.
  useEffect(() => {
    void openConversation();
  }, [mode, openConversation]);

  // Also tracks `sending`, so the typing bubble scrolls into view the moment it appears, and
  // `keyboardHeight`, because opening the keyboard shrinks the list and hides the newest message.
  useEffect(() => {
    if (messages.length || sending) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length, sending, keyboardHeight]);

  const onSend = useCallback(async () => {
    const content = draft;
    setDraft('');
    await send(content);
  }, [draft, send]);

  const copyMessage = useCallback(async (text: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
  }, []);

  // Auto-dismiss the confirmation; a toast that needs tapping away is worse than no toast.
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const limitReached = limit != null && limit.remaining <= 0;

  // Appended rather than kept in the store: the indicator is a view concern, and putting it in
  // `messages` would leak a fake row into anything else reading that list.
  const rows = sending ? [...messages, TYPING_ROW] : messages;

  // The keyboard covers the home-indicator area, so its inset is only needed while it is closed.
  const composerBottomPadding = keyboardHeight > 0 ? spacing.md : Math.max(insets.bottom, spacing.md);

  return (
    // Bottom edge is deliberately excluded — the composer owns the bottom inset itself, so that
    // the safe area is not applied on top of the keyboard offset.
    <Screen padded={false} edges={['top']}>
      <View style={styles.header}>
        <ModePill mode={mode === 'CHAT' ? 'chat' : 'qeybet'} onChange={(m) => setMode(m === 'chat' ? 'CHAT' : 'QEYBET')} />
        <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={12}>
          <Text style={styles.headerAction}>•••</Text>
        </Pressable>
      </View>

      {limit ? (
        <View style={styles.counterRow}>
          <LimitCounter current={limit.used} max={limit.total} />
        </View>
      ) : null}

      <View style={[styles.flex, { marginBottom: keyboardHeight }]}>
        <FlatList
          ref={listRef}
          style={styles.flex}
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item, index }) =>
            item.id === TYPING_ROW.id ? (
              <TypingBubble />
            ) : (
              <ChatBubble
                text={item.content}
                from={item.sender === 'USER' ? 'user' : 'bot'}
                grouped={index > 0 && rows[index - 1].sender === item.sender}
                pending={isPending(item)}
                onLongPress={() => copyMessage(item.content)}
              />
            )
          }
          ListEmptyComponent={
            opening ? (
              <ActivityIndicator style={styles.emptyLoader} color={colors.muted} />
            ) : (
              <Text style={styles.empty}>
                {mode === 'QEYBET' ? t('chat.emptyQeybet') : t('chat.emptyChat')}
              </Text>
            )
          }
        />

        {copied ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{t('chat.copied')}</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {limitReached ? (
          <Pressable style={styles.limitBanner} onPress={() => navigation.navigate('Paywall')}>
            <Text style={styles.limitText}>{t('chat.limitReached')}</Text>
            <Text style={styles.limitCta}>{t('chat.goPremium')}</Text>
          </Pressable>
        ) : null}

        <View style={[styles.composer, { paddingBottom: composerBottomPadding }]}>
          <Composer
            value={draft}
            onChangeText={setDraft}
            onSend={onSend}
            disabled={sending || limitReached}
            placeholder={t('chat.placeholder')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerAction: { ...type.headline, color: colors.muted },
  counterRow: { paddingBottom: spacing.sm },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, flexGrow: 1 },
  empty: { ...type.secondary, textAlign: 'center', marginTop: spacing.xxxl * 2 },
  emptyLoader: { marginTop: spacing.xxxl * 2 },
  error: { ...type.secondary, color: colors.ink, textAlign: 'center', paddingHorizontal: spacing.xl },
  toast: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginBottom: spacing.sm,
  },
  toastText: { ...type.secondary, color: colors.ink },
  limitBanner: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  limitText: { ...type.bodyMedium },
  limitCta: { ...type.secondary, color: colors.ink },
  composer: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
});
