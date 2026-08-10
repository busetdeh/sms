# Sky Multirotor Squad (SMS) - Official Community Website

Website resmi komunitas **Sky Multirotor Squad** yang responsif, *ultra-lightweight*, dan bernuansa futuristik *Aero-HUD*.

---

## 🛠️ Tech Stack
- **Engine:** Vanilla Semantic HTML5 & Modern ES6+ JavaScript
- **Styling:** Tailwind CSS (Play CDN & Config) + Custom Aero-HUD CSS System
- **Fonts:** Space Grotesk, JetBrains Mono, Hanken Grotesk, Material Symbols
- **Build Tool:** Vite (Dev server & Optimized Multi-Page production bundling)

---

## 📂 Struktur Proyek
```
SMS/
├── index.html              # Homepage utama (Hero, Keahlian, Pilot Calculator, Berita, Kontak, Footer)
├── pages/
│   ├── tentang-kami.html   # Sejarah 4 pendiri, filosofi, visi misi, & pilar komunitas
│   ├── artikel.html        # Liputan event, pencapaian, dan panduan teknis (ELRS & KKOP)
│   ├── galeri.html         # Showcase foto aerial & video FPV beresolusi tinggi
│   ├── spot-terbang.html   # Direktori spot terbang resmi Banten (Citra Garden BMW, Anyer, dll.)
│   └── kontak.html         # Form konsultasi rakit/servis drone & link direct WhatsApp/Instagram
├── src/
│   ├── styles/
│   │   └── main.css        # Glassmorphism, animations, custom scrollbar, HUD scanline
│   └── js/
│       └── main.js         # Mobile drawer menu, parallax scroll, live telemetry, LiPo calculator
├── package.json            # Vite scripts
├── vite.config.js          # Multi-page configuration
└── README.md
```

---

## 🚀 Cara Menjalankan Secara Lokal

1. **Jalankan Development Server:**
   ```bash
   npx vite
   ```
   Buka URL lokal yang muncul di browser: `http://localhost:5180` (sudah disetting otomatis membuka port 5180 agar tidak bentrok dengan ARCI POS).

2. **Build untuk Produksi:**
   ```bash
   npx vite build
   ```
   File hasil build akan berada di direktori `dist/` siap untuk di-deploy ke GitHub Pages, Vercel, Netlify, atau Cloudflare Pages.

3. **Preview Hasil Build:**
   ```bash
   npx vite preview
   ```
