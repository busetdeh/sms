import { resolve } from 'node:path';

function cleanUrlsPlugin() {
  return {
    name: 'vite-plugin-clean-urls',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url) {
          const urlObj = new URL(req.url, 'http://localhost');
          const pathname = urlObj.pathname;
          
          if (!pathname.includes('.') && !pathname.endsWith('/')) {
            const pageMap = {
              '/admin': '/pages/admin.html',
              '/pages/admin': '/pages/admin.html',
              '/tentang-kami': '/pages/tentang-kami.html',
              '/galeri': '/pages/galeri.html',
              '/spot-terbang': '/pages/spot-terbang.html',
              '/kontak': '/pages/kontak.html',
              '/artikel': '/pages/artikel.html',
              '/pages/tentang-kami': '/pages/tentang-kami.html',
              '/pages/galeri': '/pages/galeri.html',
              '/pages/spot-terbang': '/pages/spot-terbang.html',
              '/pages/kontak': '/pages/kontak.html',
              '/pages/artikel': '/pages/artikel.html',
            };
            
            if (pageMap[pathname]) {
              req.url = pageMap[pathname] + urlObj.search;
            }
          }
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url) {
          const urlObj = new URL(req.url, 'http://localhost');
          const pathname = urlObj.pathname;
          
          if (!pathname.includes('.') && !pathname.endsWith('/')) {
            const pageMap = {
              '/admin': '/pages/admin.html',
              '/pages/admin': '/pages/admin.html',
              '/tentang-kami': '/pages/tentang-kami.html',
              '/galeri': '/pages/galeri.html',
              '/spot-terbang': '/pages/spot-terbang.html',
              '/kontak': '/pages/kontak.html',
              '/artikel': '/pages/artikel.html',
              '/pages/tentang-kami': '/pages/tentang-kami.html',
              '/pages/galeri': '/pages/galeri.html',
              '/pages/spot-terbang': '/pages/spot-terbang.html',
              '/pages/kontak': '/pages/kontak.html',
              '/pages/artikel': '/pages/artikel.html',
            };
            
            if (pageMap[pathname]) {
              req.url = pageMap[pathname] + urlObj.search;
            }
          }
        }
        next();
      });
    },
  };
}

export default {
  root: '.',
  plugins: [cleanUrlsPlugin()],
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
        admin: resolve(process.cwd(), 'pages/admin.html'),
        about: resolve(process.cwd(), 'pages/tentang-kami.html'),
        articles: resolve(process.cwd(), 'pages/artikel.html'),
        gallery: resolve(process.cwd(), 'pages/galeri.html'),
        spots: resolve(process.cwd(), 'pages/spot-terbang.html'),
        contact: resolve(process.cwd(), 'pages/kontak.html'),
      },
    },
  },
};
