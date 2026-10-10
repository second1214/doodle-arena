import { defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// いつ作った版か（メイン画面の いちばん下に出す。古い版が のこっていないか 確かめる用。日本時間）
const jst = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 16).replace("T", " ");
const sha = (process.env.GITHUB_SHA ?? "").slice(0, 7);
const BUILD = `${jst}${sha ? ` ${sha}` : ""}`;

// version.json も いっしょに出す（ゲームが 開いた時に 読んで、古い版なら 読みこみなおす）
const versionFile = (): Plugin => ({
  name: "version-json",
  generateBundle() { this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ build: BUILD }) }); },
});

// `--mode single` で全部入りの単一 HTML を出力する（スマホ確認用の配布に使う）。
export default defineConfig(({ mode }) => ({
  base: "./",
  define: { __BUILD__: JSON.stringify(BUILD) },
  plugins: mode === "single" ? [viteSingleFile(), versionFile()] : [versionFile()],
}));
