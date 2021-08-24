import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import package_json from './package.json';


const packageName = package_json.name;

const allowedCeTags = [
  'ui-view',
];

// https://vitejs.dev/config/
export default ({ command, mode }) => defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement(tag) {
            return allowedCeTags.includes(tag);
          },
        },
      },
    }),
  ],
  server: {
    port: 1234,
  },
  resolve: {
    alias: {
      [packageName]: path.resolve(__dirname, 'lib/index.js'),
    },
  },
  build: {
    sourcemap: mode === 'development',
    lib: {
      entry: path.resolve(__dirname, 'lib/index.js'),
      name: packageName,
      formats: [
        'es',
      ],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [
        'vue',
        'angular',
      ],
    },
  },
});
