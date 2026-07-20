import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontFamily } from './tokens';

interface Props {
  text: string;
  from: 'user' | 'bot';
  grouped?: boolean; // true if previous message was same sender (tighter gap)
}

export function ChatBubble({ text, from, grouped }: Props) {
  const isUser = from === 'user';
  return (
    <View
      style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.botBubble,
        { marginTop: grouped ? 6 : 14 },
      ]}
    >
      <Text style={isUser ? styles.userText : styles.botText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '82%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.white, borderBottomRightRadius: 6 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: colors.bubbleBot, borderBottomLeftRadius: 6 },
  userText: { fontSize: 15, lineHeight: 20, fontFamily: fontFamily.regular, color: colors.black },
  botText: { fontSize: 15, lineHeight: 20, fontFamily: fontFamily.regular, color: colors.white },
});
