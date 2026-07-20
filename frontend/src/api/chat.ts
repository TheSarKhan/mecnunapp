import { api } from "./client";
import type {
  ChatMode,
  ConversationDto,
  MessageDto,
  SendMessageResponse,
  StartConversationResponse,
} from "./types";

/** Yeni söhbət açır — ilk mesajı persona özü atır və gündəlik limitdən yemir. */
export async function startConversation(
  mode: ChatMode,
): Promise<StartConversationResponse> {
  const { data } = await api.post<StartConversationResponse>(
    "/chat/conversations",
    { mode },
  );
  return data;
}

export async function sendMessage(
  mode: ChatMode,
  content: string,
  conversationId?: string,
): Promise<SendMessageResponse> {
  const { data } = await api.post<SendMessageResponse>("/chat/messages", {
    mode,
    content,
    conversationId,
  });
  return data;
}

export async function getConversations(): Promise<ConversationDto[]> {
  const { data } = await api.get<ConversationDto[]>("/chat/conversations");
  return data;
}

export async function getMessages(
  conversationId: string,
): Promise<MessageDto[]> {
  const { data } = await api.get<MessageDto[]>(
    `/chat/conversations/${conversationId}/messages`,
  );
  return data;
}
