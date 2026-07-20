-- Memory extraction needs to know where it left off in each conversation.
--
-- Extraction runs in the background (every N messages, plus a sweep once a conversation goes
-- quiet), so it must be resumable and must never re-read messages it already turned into facts.
-- Anything created after last_extracted_at is pending; NULL means nothing has been extracted yet.
ALTER TABLE conversations
    ADD COLUMN last_extracted_at timestamptz;

-- The sweep looks for conversations that have gone quiet with work still pending.
CREATE INDEX idx_conversations_extraction_due
    ON conversations (last_message_at)
    WHERE last_message_at IS NOT NULL;
