-- Məcnun — initial schema.
-- pgvector is required for the long-term memory (RAG) feature.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id            uuid PRIMARY KEY,
    identifier    varchar(190) NOT NULL UNIQUE,
    password_hash varchar(255) NOT NULL,
    gender        varchar(20)  NOT NULL DEFAULT 'UNSPECIFIED',
    created_at    timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE user_profiles (
    user_id             uuid PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    display_name        varchar(80),
    persona             varchar(20)  NOT NULL DEFAULT 'MECNUN',
    relationship_status varchar(30)  NOT NULL DEFAULT 'UNSPECIFIED',
    profanity_enabled   boolean      NOT NULL DEFAULT false,
    created_at          timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE conversations (
    id              uuid PRIMARY KEY,
    user_id         uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    mode            varchar(20) NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    last_message_at timestamptz
);

CREATE INDEX idx_conversations_user_created ON conversations (user_id, created_at DESC);

CREATE TABLE messages (
    id              uuid PRIMARY KEY,
    conversation_id uuid        NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    sender          varchar(10) NOT NULL,
    content         text        NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation_created ON messages (conversation_id, created_at);

-- Facts the bot has learned about the user. 768 dims matches Gemini text-embedding-004;
-- change the dimension here (and re-embed) if the embedding model changes.
CREATE TABLE memory_facts (
    id                     uuid PRIMARY KEY,
    user_id                uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    fact_text              text        NOT NULL,
    embedding              vector(768),
    source_conversation_id uuid REFERENCES conversations (id) ON DELETE SET NULL,
    created_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_memory_facts_user ON memory_facts (user_id, created_at DESC);

-- ANN index for similarity search. ivfflat needs data before it is useful; harmless while empty.
CREATE INDEX idx_memory_facts_embedding ON memory_facts
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE TABLE subscriptions (
    id                     uuid PRIMARY KEY,
    user_id                uuid        NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    plan                   varchar(20) NOT NULL DEFAULT 'FREE',
    status                 varchar(30) NOT NULL DEFAULT 'NONE',
    revenuecat_customer_id varchar(190),
    current_period_end     timestamptz,
    updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_rc_customer ON subscriptions (revenuecat_customer_id);

CREATE TABLE ad_reward_events (
    id             uuid PRIMARY KEY,
    user_id        uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    provider       varchar(40) NOT NULL DEFAULT 'ADMOB',
    transaction_id varchar(190) UNIQUE,
    reward_amount  integer     NOT NULL DEFAULT 0,
    verified_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ad_reward_events_user ON ad_reward_events (user_id, verified_at DESC);

-- NOTE: the daily message counter is NOT a table. It lives in Redis:
--   mecnun:limit:{userId}:{yyyy-MM-dd}   -> messages used today          (INCR, TTL 48h)
--   mecnun:bonus:{userId}:{yyyy-MM-dd}   -> extra messages earned via ads
--   mecnun:rewards:{userId}:{yyyy-MM-dd} -> rewarded ads watched today
