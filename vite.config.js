import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import path from 'path';

export default defineConfig({
  // JSX Runtime を classic (React.createElement) に設定して、軽量化を図る
  plugins: [react({
    jsxRuntime: 'classic',
  }), cssInjectedByJsPlugin()],
  publicDir: false,
  build: {
    lib: {
      // Entry point を .js に変更（中身は App の export のみ）
      entry: path.resolve(__dirname, 'src/entry.github.js'),
      name: 'Maghribal',
      formats: ['es'],
      fileName: 'main'
    },
    rollupOptions: {
      // React 関連はすべて外部化し、バンドルに含めない
      external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    // ミニファイを無効化して中身を見やすくする（ユーザーが軽量化・可読性を重視しているため）
    minify: false,
  },
});
