package com.mecnun.memory;

import java.util.UUID;

/**
 * Published when a conversation gains messages.
 *
 * An event rather than a direct call so ChatService stays unaware of memory entirely, and so the
 * listener can run after the transaction commits — extraction reads those same messages back, and
 * would find nothing if it ran inside the still-open transaction.
 */
public record MessagesAppendedEvent(UUID conversationId) {
}
