-- 遊ばれた数: 1日1回、端末ごとのランダムな番号（ハッシュ化）を記録する。名前・場所などは無い
CREATE TABLE IF NOT EXISTS plays (
  day TEXT NOT NULL,
  dev TEXT NOT NULL,
  PRIMARY KEY (day, dev)
);
-- 端末ごとの はじめて遊んだ日（新しく遊び始めた人数を数える）
CREATE TABLE IF NOT EXISTS devices (
  dev TEXT PRIMARY KEY,
  first_day TEXT NOT NULL
);
