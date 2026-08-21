import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

function cleanUrlsPlugin() {
  const handleRequest = (req) => {
    if (!req.url) return;
    const urlObj = new URL(req.url, 'http://localhost');
    const pathname = urlObj.pathname;
    
    if (!pathname.includes('.') && !pathname.endsWith('/')) {
      const pageMap = {
        '/admin': '/admin.html',
        '/reporting': '/reporting.html',
        '/pages/admin': '/pages/admin.html',
        '/tentang-kami': '/pages/tentang-kami.html',
        '/galeri': '/pages/galeri.html',
        '/spot-terbang': '/pages/spot-terbang.html',
        '/kontak': '/pages/kontak.html',
        '/artikel': '/pages/artikel.html',
        '/sms-fly-through-history': '/benteng-speelwijk.html',
        '/pages/sms-fly-through-history': '/pages/benteng-speelwijk.html',
        '/benteng-speelwijk': '/benteng-speelwijk.html',
        '/pages/benteng-speelwijk': '/pages/benteng-speelwijk.html',
        '/pages/tentang-kami': '/pages/tentang-kami.html',
        '/pages/galeri': '/pages/galeri.html',
        '/pages/spot-terbang': '/pages/spot-terbang.html',
        '/pages/kontak': '/pages/kontak.html',
        '/pages/artikel': '/pages/artikel.html',
      };
      
      if (pageMap[pathname]) {
        req.url = pageMap[pathname] + urlObj.search;
      } else {
        // Dynamic fallback check
        const directFile = resolve(process.cwd(), pathname.slice(1) + '.html');
        const pagesFile = resolve(process.cwd(), 'pages' + pathname + '.html');
        if (existsSync(directFile)) {
          req.url = pathname + '.html' + urlObj.search;
        } else if (existsSync(pagesFile)) {
          req.url = '/pages' + pathname + '.html' + urlObj.search;
        } else {
          // Dynamic speelwijk slug fallback (e.g. custom slug)
          if (pathname.startsWith('/pages/')) {
            req.url = '/pages/benteng-speelwijk.html' + urlObj.search;
          } else {
            req.url = '/benteng-speelwijk.html' + urlObj.search;
          }
        }
      }
    }
  };

  return {
    name: 'vite-plugin-clean-urls',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        handleRequest(req);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        handleRequest(req);
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
        admin: resolve(process.cwd(), 'admin.html'),
        reporting: resolve(process.cwd(), 'reporting.html'),
        adminPage: resolve(process.cwd(), 'pages/admin.html'),
        about: resolve(process.cwd(), 'pages/tentang-kami.html'),
        articles: resolve(process.cwd(), 'pages/artikel.html'),
        gallery: resolve(process.cwd(), 'pages/galeri.html'),
        spots: resolve(process.cwd(), 'pages/spot-terbang.html'),
        contact: resolve(process.cwd(), 'pages/kontak.html'),
        speelwijk: resolve(process.cwd(), 'benteng-speelwijk.html'),
        speelwijkPage: resolve(process.cwd(), 'pages/benteng-speelwijk.html'),
      },
    },
  },
};
