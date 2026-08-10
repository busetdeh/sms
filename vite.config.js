import { resolve } from 'node:path';

export default {
  root: '.',
  server: {
    port: 5180,
    open: true,
  },
  preview: {
    port: 5180,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        about: resolve(process.cwd(), 'pages/tentang-kami.html'),
        articles: resolve(process.cwd(), 'pages/artikel.html'),
        gallery: resolve(process.cwd(), 'pages/galeri.html'),
        spots: resolve(process.cwd(), 'pages/spot-terbang.html'),
        contact: resolve(process.cwd(), 'pages/kontak.html'),
      },
    },
  },
};
