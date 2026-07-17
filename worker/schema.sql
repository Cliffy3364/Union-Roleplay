CREATE TABLE IF NOT EXISTS submissions (
 id TEXT PRIMARY KEY,
 category TEXT NOT NULL,
 subtype TEXT NOT NULL,
 title TEXT NOT NULL,
 submitter TEXT,
 payload TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'new',
 created_at TEXT NOT NULL
);
