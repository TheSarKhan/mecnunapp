import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, fontFamily } from './tokens';

interface Props {
  text: string;
  from: 'user' | 'bot';
  grouped?: boolean; // true if previous message was same sender (tighter gap)
  /** Long-press handler, used for copy. Without it the bubble stays inert. */
  onLongPress?: () => void;
  /** Dims the bubble while the message is still in flight. */
  pending?: boolean;
}

// Diverges from docs/design/mecnun-ui-kit: View became Pressable so a bubble can be long-pressed
// to copy. Purely additive — with no onLongPress, rendering and behaviour are unchanged.
export function ChatBubble({ text, from, grouped, onLongPress, pending }: Props) {
  const isUser = from === 'user';
  return (
    <Pressable
      onLongPress={onLongPress}
      delayLongPress={300}
      style={({ pressed }) => [
        styles.bubble,
        isUser ? styles.userBubble : styles.botBubble,
        { marginTop: grouped ? 6 : 14 },
        pending && styles.pending,
        pressed && onLongPress ? styles.pressed : null,
      ]}
    >
      <Text style={isUser ? styles.userText : styles.botText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '82%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.white, borderBottomRightRadius: 6 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: colors.bubbleBot, borderBottomLeftRadius: 6 },
  userText: { fontSize: 15, lineHeight: 20, fontFamily: fontFamily.regular, color: colors.black },
  botText: { fontSize: 15, lineHeight: 20, fontFamily: fontFamily.regular, color: colors.white },
  pending: { opacity: 0.55 },
  pressed: { opacity: 0.75 },
});
