# doodle-arena（らくがきアリーナ）

手描きのキャラが動いて戦う、スマホ向けの非同期対戦ゲーム。仕様は [docs/SPEC.md](docs/SPEC.md)。

## 試作1：手足の自動検知

描いた絵の突起から手・足を自動検知し、紙人形のように動かす画面。

```sh
npm install
npm run dev          # 開発サーバー（同じ Wi-Fi のスマホからも開ける）
npm test             # 検知のテスト
npm run build:single # dist/index.html に全部入りの1ファイルを出力
```

- 検知ロジック: `src/detect.ts`（DOM 非依存・決定的）
- 画面: `index.html` / `src/main.ts`
- サンプル絵: `src/samples.ts`
