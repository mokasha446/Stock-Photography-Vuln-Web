# Stock Photography — Web Performance & Core Web Vitals Optimization Guide

**Scope:** Frontend only. No PHP logic, dynamic structures, backend processing, or
SQL/DB queries were touched. All changes are in HTML, CSS, JS delivery, `.htaccess`,
and asset optimization.

**Baseline findings (why the site is slow):**
- **85 MB of images** → 31 source photos (largest 8.1 MB) are ~3000–6700 px but displayed at
  280–800 px. This is your **dominant bottleneck**: it ruins LCP, TTFB-ish rendering, bandwidth, and INP.
- **No caching headers / no compression** → no `.htaccess`, so every return visit re-downloads everything.
- **Render-blocking stylesheet & font** in `<head>` (acceptable, but not optimized).
- **No `width`/`height`/aspect ratio** on many images → layout shift (CLS) risk.
- JS was loaded at the end of `<body>` (good) but without explicit `defer`.

---

## What was changed (already applied to files)

### 1. New file: `.htaccess`
Adds, safely behind `<IfModule>` guards (a missing module won't 500 the site):
- **Browser caching** — 1-year cache for static assets, no-cache for HTML/PHP.
- **Compression** — Brotli (with Gzip fallback) for HTML/CSS/JS/JSON/SVG.
- **Security headers** — `nosniff`, `SAMEORIGIN`, referrer policy.
- **Optional WebP auto-serving** block (commented out — activate in Step 4).

### 2. HTML (all 9 pages)
- `defer` added to every `<script src="...main.js">` — non-blocking, still runs after DOM parse.
- `theme-color` meta added.
- **index.html / detail.html** (your LCP pages):
  - `fetchpriority="high"` on the hero / detail image.
  - `<link rel="preload" as="image">` for the LCP image.
  - `width`/`height` attributes on hero images (reserves space → less CLS).
  - `loading="lazy"` retained on below-fold images (already correct).

### 3. CSS (`css/style.css`)
- `content-visibility: auto` on below-the-fold sections (featured, gallery, dashboards,
  admin, footer) → browser skips layout/paint until scrolled, **cuts INP and first-paint cost**.
- `aspect-ratio` on hero/detail/sketch images → **prevents CLS** while images decode.
- `prefers-reduced-motion` block → disables heavy animations for users who request it.

### 4. New file: `optimize-images.ps1` (REQUIRED — the biggest win)
Downscales + re-encodes all photos to max 1600px @ quality 80, backing up originals to
`images\PHOTOGRAPHY-ORIGINAL-BACKUP\` and overwriting the same filenames (so **no**
HTML/JS/PHP references change). Also emits `.webp` if `cwebp` is installed.

---

## Step-by-step implementation

### Step 1 — Enable compression & caching (hosting)
The `.htaccess` is written, but confirm these **modules are enabled** on your Apache
(or they are silently ignored / may warn):
- `mod_headers`, `mod_expires`, `mod_deflate`, `mod_rewrite`, `mod_setenvif`
- **Brotli** (`mod_brotli`) for best compression — if unsupported, Gzip fallback still applies.

How to check: run `phpinfo()` or ask host support to confirm `Loaded Modules`.
**If a directive causes a 500 error** on the live server: comment out that section and retest —
never leave the site down.

### Step 2 — Optimize the images (do this next, highest ROI)
```powershell
# From the project root:
powershell -ExecutionPolicy Bypass -File optimize-images.ps1
```
Then re-test. Optionally raise quality: `-MaxDimension 1200 -JpegQuality 75` for more savings,
or `-MaxDimension 2000 -JpegQuality 85` if you need full-detail crops.

### Step 3 — Verify the files look right
- Open each HTML page in a browser and confirm layout/navigation/forms work as before.
- In DevTools → Network, confirm assets now send `Cache-Control` and `Content-Encoding: br` or `gzip`.

### Step 4 — (Optional, higher savings) WebP + auto-serving
1. Install [libwebp](https://developers.google.com/speed/webp/download) (get `cwebp.exe`) and
   drop it in the project folder or on your PATH, then rerun `optimize-images.ps1` — it will emit `.webp` twins.
2. In `.htaccess`, **uncomment** the "WEBP AUTO-SERVING" block. Browsers that support WebP get the
   `.webp` file automatically; others keep the `.jpg`. No HTML changes needed.

### Step 5 — Defer/async & remove render-blocking (optional deeper pass)
- Your entire JS is already in one small file (~24 KB) loaded with `defer` — good. If you later add
  analytics or widgets, load them with `defer`/`async` and never above the fold.
- The Google Fonts stylesheet is render-blocking. To make it non-blocking:
  ```html
  <link rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"></noscript>
  ```
  `display=swap` is already present → text never blocked (FOUT instead of FOIT).
- Minify + group assets in a build step (recommend `terser` + `clean-css` or a CDN like Cloudflare
  which can auto-minify). Delaying this is fine — it's a small file.

---

## Server / hosting configuration you MUST verify with your provider

1. **HTTP/2** — enable it. Multiplexes many image requests over one connection (huge for a photo site).
2. **Brotli / Gzip** — confirm output compression is on (`mod_brotli` preferred).
3. **Browser caching** — `.htaccess` handles it; ensure `mod_expires` + `mod_headers` are on.
4. **CDN (strongly recommended)** — put the site (or at least `/images/`) behind Cloudflare, which
   adds edge caching, automatic Brotli, and HTTP/3. This alone can cut image delivery latency dramatically.
5. **Image serving at request time** — many hosts (Cloudflare Polish, or a small PHP image
   resizer) can auto-downscale. Since you must not change PHP logic, **run the PowerShell script once**
   instead — it bakes the smaller files into place with zero runtime overhead.

---

## Before / After expectations
| Metric | Before | After (script + .htaccess) |
|--------|--------|---------------------------|
| Page asset weight | ~85 MB | ~6–10 MB (image) + gzip HTML/CSS/JS |
| LCP (hero image) | downloads 0.8–8 MB | preloaded, ~1200px, compressed |
| CLS | shifts while images load | fixed aspect-ratio, reserved space |
| INP / main thread | full layout+paint of 30 cards on load | `content-visibility` skips below-fold work |
| Return visits | re-download everything | cached 1 year, compressed |
