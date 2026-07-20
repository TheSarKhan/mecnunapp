import { create } from 'zustand';
import { chatApi, errorMessage, limitsApi } from '../api';
import type { ChatMode, LimitStatus, MessageDto } from '../api';

interface ChatState {
  mode: ChatMode;
  conversationId: string | null;
  messages: MessageDto[];
  limit: LimitStatus | null;
  sending: boolean;
  error: string | null;

  setMode: (mode: ChatMode) => void;
  loadLimit: () => Promise<void>;
  send: (content: string) => Promise<void>;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  mode: 'CHAT',
  conversationId: null,
  messages: [],
  limit: null,
  sending: false,
  error: null,

  // Switching mode starts a fresh thread — chat and qeybət are separate conversations server-side.
  setMode: (mode) => set({ mode, conversationId: null, messages: [], error: null }),

  loadLimit: async () => {
    try {
      set({ limit: await limitsApi.getLimitStatus() });
    } catch (error) {
      set({ error: errorMessage(error) });
    }
  },

  send: async (content) => {
    const trimmed = content.trim();
    if (!trimmed || get().sending) return;

    set({ sending: true, error: null });
    try {
      const { mode, conversationId } = get();
      const response = await chatApi.sendMessage(mode, trimmed, conversationId ?? undefined);
      set((state) => ({
        conversationId: response.conversationId,
        messages: [...state.messages, response.userMessage, response.botMessage],
        limit: state.limit ? { ...state.limit, remaining: response.remainingMessages } : state.limit,
      }));
    } catch (error) {
      set({ error: errorMessage(error) });
    } finally {
      set({ sending: false });
    }
  },

  reset: () => set({ conversationId: null, messages: [], error: null }),
}));
