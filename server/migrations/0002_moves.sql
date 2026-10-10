-- 引っこし（データの受けわたし）: 前の端末・アドレスで あずけた 引き継ぎコードを、8文字の番号で 1回だけ 受けとる。24時間で 消える
CREATE TABLE IF NOT EXISTS moves (
  key TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
