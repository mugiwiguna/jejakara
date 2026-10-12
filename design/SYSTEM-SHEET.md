# JEJAKARA — System Sheet

## Routes (static, no build step)
| Route | File | Isi |
|---|---|---|
| `/` | `index.html` | Hero split + toggle, intro editorial, pilihan kurasi (asimetris), band angka craft, band atelier full-bleed, drop notice, footer |
| `/koleksi.html` | `koleksi.html` | Header halaman + counter, filter (ukuran/warna/jenis) + sort, grid produk, empty-state |
| `/produk.html?id=slug` | `produk.html` | Gallery kiri (sticky) + detail kanan: nama, edisi, harga, angka craft, deskripsi, material, size selector, add-to-cart; band full-bleed; produk terkait |
| `/cerita.html` | `cerita.html` | About: hero image + judul, teks filosofi serif, angka, band gambar |

Cart = drawer (localStorage), bukan route. Checkout = WhatsApp deep link (lihat `js/data.js`).

## Component inventory + states
- **Header**: state `top` (transparent, teks putih) / `scrolled` (solid #0B0B0B); mobile: overlay menu open/closed.
- **Hero**: slide `edisi` | `atelier`; toggle active/inactive.
- **Product card**: default / hover (zoom foto 1.04 + label "LIHAT").
- **Filter bar**: checkbox active/inactive; hasil kosong → empty-state "Tidak ada yang cocok".
- **Size selector**: tersedia / habis (coret, disabled) / terpilih.
- **Cart drawer**: terbuka/tertutup; kosong ("Keranjang masih kosong") / berisi (qty stepper, hapus, subtotal).
- **Drop notice**: idle / sukses ("Terima kasih").
- **Footer**: kolom tautan + mikro-tipografi, tetap.

## Data
6 produk (lihat `js/data.js`): Sono Clog, Laras Sandal, Derap Boot, Nadi Loafer, Alur Runner, Tandur Heel.
Harga Rp, edisi terbatas, ukuran 36–42, 5 warna. Gambar: 3 per produk (a/b/c) + 2 hero + 2 craft.

## States yang tidak boleh lupa
empty cart, sold-out size, no filter result, mobile nav, mobile hero (stack: foto atas, void kecil), reduced motion.
