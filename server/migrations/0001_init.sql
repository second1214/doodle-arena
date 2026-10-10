-- 公開キャラ。snap は戦闘を再現するための「計算し終えた数値のスナップショット」（JSON）、thumb は一覧用の間引いた線
CREATE TABLE IF NOT EXISTS chars (
  id TEXT PRIMARY KEY,
  owner_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  snap TEXT NOT NULL,
  thumb TEXT NOT NULL,
  tier INTEGER NOT NULL,
  growth INTEGER NOT NULL,
  sim_ver INTEGER NOT NULL,
  rating REAL NOT NULL DEFAULT 1000,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  bad INTEGER NOT NULL DEFAULT 0,
  hidden INTEGER NOT NULL DEFAULT 0,
  rnd REAL NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS chars_rank ON chars (tier, hidden, rating DESC);
CREATE INDEX IF NOT EXISTS chars_rnd ON chars (tier, hidden, rnd);
CREATE INDEX IF NOT EXISTS chars_owner ON chars (owner_hash);

-- バッド評価（同じ端末から1回、同じ日の同じ回線から1回）
CREATE TABLE IF NOT EXISTS bads (
  char_id TEXT NOT NULL,
  voter TEXT NOT NULL,
  PRIMARY KEY (char_id, voter)
);

-- 1日あたりの回数制限（荒らし対策）。k = 日付:操作名:回線のハッシュ
CREATE TABLE IF NOT EXISTS quota (
  k TEXT PRIMARY KEY,
  n INTEGER NOT NULL
);

-- 設定: salt（回線を伏せるための乱数。初回に自動で作る）/ stop（'1' で緊急停止＝他の人のキャラを配らない）
CREATE TABLE IF NOT EXISTS meta (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL
);
