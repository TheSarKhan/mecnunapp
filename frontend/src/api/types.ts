// Backend DTO-larının (com.mecnun.*.dto) güzgüsü. /swagger-ui.html ilə sinxron saxla.
// `mobile/src/api/types.ts` ilə eyni olmalıdır — hər iki klient eyni API-ni danışır.

export type Gender = "MALE" | "FEMALE" | "UNSPECIFIED";
export type Persona = "LEYLI" | "MECNUN";
export type RelationshipStatus =
  | "SINGLE"
  | "IN_RELATIONSHIP"
  | "COMPLICATED"
  | "BROKEN_UP"
  | "MARRIED"
  | "UNSPECIFIED";

export type ChatMode = "CHAT" | "QEYBET";
export type Sender = "USER" | "BOT";

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface Me {
  id: string;
  identifier: string;
  gender: Gender;
  displayName: string | null;
  persona: Persona;
  relationshipStatus: RelationshipStatus;
  profanityEnabled: boolean;
  premium: boolean;
  createdAt: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  gender: Gender;
  persona: Persona;
  relationshipStatus: RelationshipStatus;
}

export interface MessageDto {
  id: string;
  sender: Sender;
  content: string;
  createdAt: string;
}

export interface SendMessageResponse {
  conversationId: string;
  userMessage: MessageDto;
  /** Persona 2–3 ardıcıl qısa bubble ilə cavab verə bilər; ən azı bir element olur. */
  botMessages: MessageDto[];
  remainingMessages: number;
}

export interface StartConversationResponse {
  conversationId: string;
  botMessages: MessageDto[];
}

export interface ConversationDto {
  id: string;
  mode: ChatMode;
  createdAt: string;
  lastMessageAt: string | null;
}

export interface MemoryFactDto {
  id: string;
  factText: string;
  createdAt: string;
}

export interface LimitStatus {
  remaining: number;
  total: number;
  used: number;
  bonus: number;
  premium: boolean;
  rewardsRemaining: number;
  resetAt: string;
}
