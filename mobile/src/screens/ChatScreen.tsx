import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ChatBubble, Composer, LimitCounter, ModePill, Screen } from '../components';
import { colors, spacing, type } from '../theme';
import { useChatStore } from '../store';
import type { MessageDto } from '../api';
import { t } from '../i18n';

export default function ChatScreen() {
  const navigation = useNavigation();
  const listRef = useRef<FlatList<MessageDto>>(null);
  const [draft, setDraft] = useState('');

  const { mode, messages, limit, sending, error, setMode, send, loadLimit } = useChatStore();

  useEffect(() => {
    void loadLimit();
  }, [loadLimit]);

  useEffect(() => {
    if (messages.length) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const onSend = useCallback(async () => {
    const content = draft;
    setDraft('');
    await send(content);
  }, [draft, send]);

  const limitReached = limit != null && limit.remaining <= 0;

  return (
    <Screen padded={false} edges={['top', 'bottom']}>
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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <FlatList
          ref={listRef}
          style={styles.flex}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <ChatBubble
              text={item.content}
              from={item.sender === 'USER' ? 'user' : 'bot'}
              grouped={index > 0 && messages[index - 1].sender === item.sender}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {mode === 'QEYBET' ? t('chat.emptyQeybet') : t('chat.emptyChat')}
            </Text>
          }
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {limitReached ? (
          <Pressable style={styles.limitBanner} onPress={() => navigation.navigate('Paywall')}>
            <Text style={styles.limitText}>{t('chat.limitReached')}</Text>
            <Text style={styles.limitCta}>{t('chat.goPremium')}</Text>
          </Pressable>
        ) : null}

        <View style={styles.composer}>
          <Composer
            value={draft}
            onChangeText={setDraft}
            onSend={onSend}
            disabled={sending || limitReached}
            placeholder={t('chat.placeholder')}
          />
        </View>
      </KeyboardAvoidingView>
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
  error: { ...type.secondary, color: colors.ink, textAlign: 'center', paddingHorizontal: spacing.xl },
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
  composer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
});
