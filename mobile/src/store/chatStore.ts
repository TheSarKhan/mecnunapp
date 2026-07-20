import { create } from 'zustand';
import { chatApi, errorMessage, limitsApi } from '../api';
import type { ChatMode, LimitStatus, MessageDto } from '../api';

/** Marks a message that exists only on the client until the server confirms it. */
export const PENDING_ID_PREFIX = 'pending:';

let pendingCounter = 0;

function nextPendingId(): string {
  pendingCounter += 1;
  return `${PENDING_ID_PREFIX}${pendingCounter}`;
}

export function isPending(message: MessageDto): boolean {
  return message.id.startsWith(PENDING_ID_PREFIX);
}

interface ChatState {
  mode: ChatMode;
  conversationId: string | null;
  messages: MessageDto[];
  limit: LimitStatus | null;
  sending: boolean;
  /** True while the persona's opening message is being fetched. */
  opening: boolean;
  error: string | null;

  setMode: (mode: ChatMode) => void;
  loadLimit: () => Promise<void>;
  openConversation: () => Promise<void>;
  send: (content: string) => Promise<void>;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  mode: 'CHAT',
  conversationId: null,
  messages: [],
  limit: null,
  sending: false,
  opening: false,
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

  /** The persona speaks first — no user message required, and it costs nothing from the limit. */
  openConversation: async () => {
    if (get().conversationId || get().opening) return;

    set({ opening: true, error: null });
    try {
      const response = await chatApi.startConversation(get().mode);
      set({ conversationId: response.conversationId, messages: response.botMessages });
    } catch (error) {
      set({ error: errorMessage(error) });
    } finally {
      set({ opening: false });
    }
  },

  send: async (content) => {
    const trimmed = content.trim();
    if (!trimmed || get().sending) return;

    // Show the message immediately. A reply can take several seconds, and waiting for the round
    // trip made the chat look like it had swallowed what you just typed.
    const optimistic: MessageDto = {
      id: nextPendingId(),
      sender: 'USER',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ sending: true, error: null, messages: [...state.messages, optimistic] }));

    try {
      const { mode, conversationId } = get();
      const response = await chatApi.sendMessage(mode, trimmed, conversationId ?? undefined);
      set((state) => ({
        conversationId: response.conversationId,
        // Swap the placeholder for the server's row so ids stay real and keys stay stable.
        messages: [
          ...state.messages.filter((m) => m.id !== optimistic.id),
          response.userMessage,
          ...response.botMessages,
        ],
        limit: state.limit ? { ...state.limit, remaining: response.remainingMessages } : state.limit,
      }));
    } catch (error) {
      // Drop the placeholder: leaving it would claim the message was delivered when it was not.
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== optimistic.id),
        error: errorMessage(error),
      }));
    } finally {
      set({ sending: false });
    }
  },

  reset: () => set({ conversationId: null, messages: [], error: null }),
}));
