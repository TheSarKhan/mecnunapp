package com.mecnun.ai;

import java.util.List;

/**
 * Bot cavabını istehsal edən nöqtə.
 *
 * Returns a LIST because the persona is meant to answer in 2–3 short consecutive bubbles
 * (brief v2 §6.2), the way a person actually texts. Callers must handle any size ≥ 1.
 */
public interface BotReplyGenerator {

    /** Reply to a user message. */
    List<String> reply(ChatContext context, String userMessage);

    /** First message of a brand-new conversation — the persona speaks first (brief §5.1.6). */
    List<String> opener(ChatContext context);
}
