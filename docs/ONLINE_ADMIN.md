# オンライン対戦の管理者向け手順（プログラムを知らなくてもできる）

サーバーは Cloudflare の **Workers**（名前: `doodle-arena-api`）、データは **D1**（名前: `doodle-arena`）にあります。
困ったときは、Cloudflare のダッシュボードで D1 のコンソールを開き、下の命令（SQL）を貼って実行します。

## コンソールの開き方
1. https://dash.cloudflare.com にログイン
2. 左のメニュー「ストレージとデータベース」→「D1 SQL Database」→ `doodle-arena` を開く（画面の名前は変わることがあります）
3. 「Console（コンソール）」タブを開き、下の命令を貼って「Execute」

> ⚠️ `UPDATE` と `DELETE` は必ず `WHERE id='…'` を付けてください。付け忘れると全部のキャラが変わります。

## よく使う命令
| やりたいこと | 命令 |
|:--|:--|
| 👎 の多い順に見る（見るだけ・安全） | `SELECT id, name, bad, hidden, tier, rating, created_at FROM chars ORDER BY bad DESC LIMIT 20;` |
| 名前で探す | `SELECT id, name, bad, hidden FROM chars WHERE name LIKE '%なまえの一部%';` |
| 新しい順に見る | `SELECT id, name, bad, hidden, datetime(created_at/1000,'unixepoch','+9 hours') AS 公開日時 FROM chars ORDER BY created_at DESC LIMIT 30;` |
| 隠す（元に戻せる） | `UPDATE chars SET hidden = 1 WHERE id = 'ここにID';` |
| 戻す | `UPDATE chars SET hidden = 0, bad = 0 WHERE id = 'ここにID';` |
| 本当に消す（戻せない） | `DELETE FROM chars WHERE id = 'ここにID';` |
| **緊急停止**（他の人のキャラを配らない。ゲームは CPU の門番だけで遊べる） | `INSERT INTO meta (k, v) VALUES ('stop', '1') ON CONFLICT(k) DO UPDATE SET v = '1';` |
| 緊急停止をやめる | `UPDATE meta SET v = '0' WHERE k = 'stop';` |
| 公開キャラの数を見る | `SELECT tier, COUNT(*) FROM chars WHERE hidden = 0 GROUP BY tier;` |

## 自動で行われること
- 別々の3人から 👎 が付くと、そのキャラは自動で隠れます（消えてはいません。上の「戻す」で戻せます）。
- 公開から24時間はランキングに出ません（その間に 👎 が付く機会を作るため）。
- 1つの回線から1日に公開できるのは5体、1つの端末が同時に公開できるのは3体、👎 は1日10回まで。

## 削除の依頼が来たら
- 問い合わせ先は GitHub の Issues（ゲームの「ルール」に書いてあります）。依頼には名前とおおよその公開日が書かれます。
- 上の「名前で探す」で見つけて「隠す」か「本当に消す」。終わったら Issue に「対応しました」と返信して閉じます（個人情報が書かれていたら、その Issue は削除します）。

## 名前の禁止語を足したいとき
`src/online/ngwords.ts` の `WORDS` に言葉を足して push すると、ゲームとサーバーの両方に反映されます（Claude に頼んでも大丈夫です）。

## 無料枠を見るとき
Cloudflare の「Workers & Pages」の画面に、今日のリクエスト数（無料は1日10万）が出ます。上限を超えた日はオンラインが「オフライン」表示になるだけで、お金はかかりません。
