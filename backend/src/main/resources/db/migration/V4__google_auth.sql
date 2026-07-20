-- Google sign-in.
--
-- password_hash becomes nullable: a Google account has no password here, and storing a fake one
-- would mean a credential that looks real to every future reader of this table.
ALTER TABLE users
    ALTER COLUMN password_hash DROP NOT NULL;

-- Google's subject id. Stable per user per client, and unlike the e-mail it never changes, so it
-- is the identity we match on. The e-mail is stored for display and for linking an existing
-- password account to Google on first sign-in.
ALTER TABLE users
    ADD COLUMN google_sub varchar(190),
    ADD COLUMN email      varchar(190);

CREATE UNIQUE INDEX idx_users_google_sub ON users (google_sub) WHERE google_sub IS NOT NULL;
CREATE UNIQUE INDEX idx_users_email      ON users (email)      WHERE email IS NOT NULL;
