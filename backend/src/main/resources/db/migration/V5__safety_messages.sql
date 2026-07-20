-- Marks messages produced by the safety layer rather than by the persona.
--
-- They are shown to the user like any other bot message, but they must never be fed back to the
-- model as conversation history: observed in testing, the persona read an earlier safety reply
-- out of the transcript and started repeating helpline numbers at someone who had moved on to
-- an ordinary complaint. The safety response is a system intervention, not something the persona
-- said, so it does not belong in its memory of the conversation.
ALTER TABLE messages
    ADD COLUMN is_safety boolean NOT NULL DEFAULT false;
