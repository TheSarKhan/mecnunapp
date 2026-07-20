-- RevenueCat webhook state.
--
-- last_event_at is the guard against out-of-order delivery. RevenueCat retries on failure and
-- does not guarantee ordering, so a delayed CANCELLATION can arrive after the RENEWAL that
-- superseded it. Without this, that retry would silently downgrade a paying user.
ALTER TABLE subscriptions
    ADD COLUMN last_event_at   timestamptz,
    ADD COLUMN store           varchar(30),
    ADD COLUMN product_id      varchar(190);

-- The webhook looks a subscription up by user; every other access already goes through the
-- unique user_id index, so only the RevenueCat customer lookup needs help here.
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions (user_id);
