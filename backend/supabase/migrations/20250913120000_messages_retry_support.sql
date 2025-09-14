-- Messages retry / idempotency support (Xera)
-- Adds retry_of, attempt, idempotency_key columns and supporting indexes
-- Idempotent and safe to re-run
BEGIN;

-- Add columns if not existing
ALTER TABLE messages ADD COLUMN IF NOT EXISTS retry_of UUID NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attempt INT NOT NULL DEFAULT 1;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS idempotency_key TEXT NULL;

-- Basic check constraint: attempt must be >=1
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_attempt_min_check'
  ) THEN
    ALTER TABLE messages ADD CONSTRAINT messages_attempt_min_check CHECK (attempt >= 1);
  END IF;
END;$$;

-- Index on retry_of for chain lookups
CREATE INDEX IF NOT EXISTS idx_messages_retry_of ON messages(retry_of);

-- Unique partial index to enforce idempotency per thread
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_thread_id_idem ON messages(thread_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

COMMIT;