import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// `--mode single` で全部入りの単一 HTML を出力する（スマホ確認用の配布に使う）。
export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: mode === "single" ? [viteSingleFile()] : [],
}));
