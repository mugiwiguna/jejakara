# JEJAKARA — Commit Sheet (auteur, register: system)

Referensi: aoiofficial.com (AOI, Shopify luxury maison). Recon: screenshot + computed styles diambil 2026-10-12.

## 1. Peak (satu signature)
Hero split 50/50: void hitam murni di kiri (tanpa headline), foto atelier full-bleed di kanan, dengan
pill toggle glass di bottom-center ("EDISI BARU / ATELIER") yang meng-crossfade slide + label ghost
kiri-bawah. Keganjangan yang diingat: brand cukup percaya diri tidak menjual di paint pertama.

## 2. Color — tier: restrained (achromatic)
- Base gelap `#0B0B0B` (L≈0.05) untuk hero, footer, band atelier.
- Section editorial `#F4F3F0` — off-white benar, chroma ~0 (bukan cream hangat #10 ai-allow tidak dipakai).
- Teks `#FAFAF8` di gelap, `#0B0B0B` di terang, muted `#8F8F8C`.
- Nol warna aksen. Satu-satunya chroma = hangat foto kulit/kayu. Bukan lavender, bukan cream "warmth",
  bukan kategori-reflex "sepatu = oranye sport". Alasan: referensi (AOI) menyatakan luxury lewat absennya aksen.
- Target mean L halaman ≈ 0.45 (hero/footer 0.05, section editorial 0.95 — dua bidang, bukan gradasi).

## 3. Type
- Display/teks: **Bodoni Moda** (didone) — padanan gratis Saol Display milik AOI (juga didone).
- Label/UI: **Archivo** — AOI sendiri memuat Archivo; padanan gratis Trio Grotesk.
- Bukan Inter/Space Grotesk: keduanya justru muncul sebagai label micro AOI? Tidak — AOI pakai grotesk
  khusus label 10–11px uppercase ls .14em; kita tiru spesifikasinya, bukan keluarganya yang default AI.
- Skala: label 10–11px/0.14em uppercase; body serif 18–20px/1.6; display clamp max 5rem (hero ghost label
  20px/0.3em uppercase, exempt: wordmark/ghost texture).

## 4. Grid break
Hero hard 50/50 (void vs foto) + grid koleksi asimetris: kartu pertama lebar 1.5× (span 2 baris),
sisanya reguler — bukan grid kartu identik.

## 5. Motion budget (7 keluarga)
1. Reveal blok: IntersectionObserver, translateY 12px + opacity, stagger 60ms, ease-out 500ms.
2. Reveal teks: heading di-split per kata (`.w-line/.w`), translateY 115% → 0, stagger 45ms/kata,
   cubic-bezier(.16,1,.3,1) 950ms — mask-line khas maison.
3. Reveal foto: kartu `.card.in .frame img` scale 1.12→1 + opacity 0→1; hover zoom lanjut ke 1.05.
4. Loader: layar hitam + wordmark breathe + bar progress, lift setelah `load` (min 750ms, safety 3.5s),
   `html.is-loading` kunci scroll; reveal mulai hanya setelah lift.
5. Transisi halaman: veil hitam `.pt-veil` naik dari bawah 550ms saat klik link internal → navigasi;
   halaman baru terbuka lewat loader. Hash-link/tabsheet/batal-ctrl dikecualikan.
6. Count-up statistik: `.stat .n` 0→target, 1100ms ease-out-cubic, format id-ID, sekali jalan.
7. Marquee editorial (index) + crossfade thumb PDP 350ms + header bg 300ms + hero slide 600ms.
Semua hanya transform/opacity. `prefers-reduced-motion`: reveal langsung tampil, loader/veil disembunyikan,
marquee berhenti.

## 6. Reflex check
- (a) Generic AI untuk "toko sepatu online": hero gradient ungu/oranye + headline tengah + 2 tombol
  "Belanja Sekarang", grid kartu seragam rounded-2xl, badge diskon.
- (b) Generic AI menghindarinya: dark mode neon/terminal, mono service label, aksen acid.
- (c) Deviasi kita: monochrome editorial maison — foto jadi satu-satunya warna, label mikro 10–11px,
  nol aksen, nol rounded card (radius 0 kecuali pill toggle 999px).

## 7. House tells yang sengaja dipatahkan
1. Wordmark-as-hero → hero berisi foto + void + toggle; wordmark hanya 14px di header.
2. Near-black + amber/acid accent → hitam + nol aksen (dibolehkan: hitam = keputusan referensi,
   dibuktikan reference-diff terhadap AOI, bukan default "dark = premium").
3. Eyebrow kicker di tiap section → maksimal 1 kicker di seluruh halaman; pembuka section berganti-ganti
   (angka, kutipan serif, langsung gambar).
