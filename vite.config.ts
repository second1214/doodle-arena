import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// いつ作った版か（メイン画面の いちばん下に出す。古い版が のこっていないか 確かめる用。日本時間）
const jst = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 16).replace("T", " ");
const sha = (process.env.GITHUB_SHA ?? "").slice(0, 7);

// `--mode single` で全部入りの単一 HTML を出力する（スマホ確認用の配布に使う）。
export default defineConfig(({ mode }) => ({
  base: "./",
  define: { __BUILD__: JSON.stringify(`${jst}${sha ? ` ${sha}` : ""}`) },
  plugins: mode === "single" ? [viteSingleFile()] : [],
}));
