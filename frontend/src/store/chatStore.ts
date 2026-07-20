import { create } from "zustand";

import { chatApi, errorMessage, isLimitReached, limitsApi } from "@/api";
import type { ChatMode, LimitStatus, MessageDto } from "@/api";

/** Serverin təsdiqinə qədər yalnız klientdə mövcud olan mesajı işarələyir. */
export const PENDING_ID_PREFIX = "pending:";

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
  /** Personanın açılış mesajı gətirilərkən true. */
  opening: boolean;
  error: string | null;
  /** Gündəlik limit tükənib — chat paywall-a yönləndirməlidir. */
  limitReached: boolean;

  setMode: (mode: ChatMode) => void;
  loadLimit: () => Promise<void>;
  openConversation: () => Promise<void>;
  send: (content: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  mode: "CHAT",
  conversationId: null,
  messages: [],
  limit: null,
  sending: false,
  opening: false,
  error: null,
  limitReached: false,

  // Mod dəyişmək yeni sap başladır — chat və qeybət server tərəfdə ayrı söhbətlərdir.
  setMode: (mode) =>
    set({ mode, conversationId: null, messages: [], error: null }),

  loadLimit: async () => {
    try {
      set({ limit: await limitsApi.getLimitStatus() });
    } catch (error) {
      set({ error: errorMessage(error) });
    }
  },

  /** Personanı özü başlayır — istifadəçi mesajı tələb olunmur və limitdən yemir. */
  openConversation: async () => {
    if (get().conversationId || get().opening) return;

    set({ opening: true, error: null });
    try {
      const response = await chatApi.startConversation(get().mode);
      set({
        conversationId: response.conversationId,
        messages: response.botMessages,
      });
    } catch (error) {
      set({ error: errorMessage(error) });
    } finally {
      set({ opening: false });
    }
  },

  send: async (content) => {
    const trimmed = content.trim();
    if (!trimmed || get().sending) return;

    // Mesajı dərhal göstər. Cavab bir neçə saniyə çəkə bilər; gediş-gəlişi gözləmək chat-ı
    // indicə yazdığını udmuş kimi göstərirdi.
    const optimistic: MessageDto = {
      id: nextPendingId(),
      sender: "USER",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      sending: true,
      error: null,
      messages: [...state.messages, optimistic],
    }));

    try {
      const { mode, conversationId } = get();
      const response = await chatApi.sendMessage(
        mode,
        trimmed,
        conversationId ?? undefined,
      );
      set((state) => ({
        conversationId: response.conversationId,
        // Placeholder-i serverin sətri ilə əvəzlə ki, id-lər real, key-lər sabit qalsın.
        messages: [
          ...state.messages.filter((m) => m.id !== optimistic.id),
          response.userMessage,
          ...response.botMessages,
        ],
        limit: state.limit
          ? { ...state.limit, remaining: response.remainingMessages }
          : state.limit,
      }));
    } catch (error) {
      // Placeholder-i at: onu saxlamaq mesajın çatdığını iddia etmək olardı — çatmayıb.
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== optimistic.id),
        error: errorMessage(error),
        limitReached: isLimitReached(error),
      }));
    } finally {
      set({ sending: false });
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      conversationId: null,
      messages: [],
      error: null,
      limitReached: false,
    }),
}));
