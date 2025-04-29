// vite.config.js
import { defineConfig } from 'vite';

// GitHub Actions でビルドするときは GITHUB_REPOSITORY が
// "ユーザ名/リポジトリ名" で渡ってくるので、後ろだけ抜き出して base に設定
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';

export default defineConfig({
  // 例: https://ユーザ名.github.io/リポジトリ名/ で公開されるよう base を自動セット
  base: repoName ? `/${repoName}/` : '/'
});
