// JEJAKARA — app. State: localStorage. ponytail: tanpa framework; kalau butuh SSR/SEO ketat, pindah ke Astro/Next.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- header: solid setelah hero (IntersectionObserver, bukan scroll listener) ---------- */
function initHeader() {
  const head = $(".site-header");
  const sentinel = $("#head-sentinel");
  if (head && sentinel) {
    new IntersectionObserver(
      ([e]) => head.classList.toggle("solid", !e.isIntersecting),
      { rootMargin: "-70px 0px 0px 0px" }
    ).observe(sentinel);
  }
  const menu = $("#mobile-menu");
  $("#burger")?.addEventListener("click", () => menu.classList.add("open"));
  $("#menu-close")?.addEventListener("click", () => menu.classList.remove("open"));
  $$("#mobile-menu a").forEach((a) => a.addEventListener("click", () => menu.classList.remove("open")));
}

/* ---------- reveal ---------- */
function initReveal() {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("in")); return; }
  const io = new IntersectionObserver(
    (es) => es.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add("in"), i * 60);
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.15 }
  );
  els.forEach((el) => {
    if (/^H[123]$/.test(el.tagName) && el.children.length === 0) {
      el.innerHTML = el.textContent.trim().split(/\s+/)
        .map((w, i) => `<span class="w-line"><span class="w" style="transition-delay:${i * 45}ms">${w}</span></span>`)
        .join(" ");
    }
    io.observe(el);
  });
}

/* ---------- angka statistik: count-up ---------- */
function initCounters() {
  const ns = $$(".stat .n");
  if (!ns.length || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const el = e.target, target = parseInt(el.textContent.replace(/\D/g, ""), 10);
    if (isNaN(target)) return;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, Math.max(0, (t - t0) / 1100)), ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * ease).toLocaleString("id-ID");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  ns.forEach((n) => io.observe(n));
}

/* ---------- loader & transisi halaman ---------- */
function initLoader(after) {
  const l = $("#loader"), root = document.documentElement;
  const t0 = performance.now();
  let fired = false;
  const done = () => {
    if (fired) return; fired = true;
    setTimeout(() => {
      l?.classList.add("lift");
      root.classList.remove("is-loading");
      setTimeout(() => { l?.remove(); after && after(); }, 850);
    }, Math.max(0, 750 - (performance.now() - t0)));
  };
  if (document.readyState === "complete") done();
  else { window.addEventListener("load", done); setTimeout(done, 3500); } // safety: aset nyangkut
}

function initTransition() {
  const v = $("#pt-veil");
  if (!v) return;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (e.target.closest(".fav")) return; // tombol favorit ada di dalam kartu <a>
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // hash-only: biarkan default
    e.preventDefault();
    v.classList.add("up");
    setTimeout(() => (location.href = url.href), 520);
  });
}

/* ---------- keranjang ---------- */
const CART_KEY = "jejakara-cart";
const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || "[]");
const setCart = (c) => { localStorage.setItem(CART_KEY, JSON.stringify(c)); renderCartCount(); };

function renderCartCount() {
  const n = getCart().reduce((s, l) => s + l.qty, 0);
  $$(".cart-count").forEach((el) => (el.textContent = n));
}

/* ---------- favorit (wishlist, localStorage) ---------- */
const FAV_KEY = "jejakara-fav";
const getFav = () => JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
const setFav = (f) => { localStorage.setItem(FAV_KEY, JSON.stringify(f)); renderFavCount(); };

function renderFavCount() {
  const n = getFav().length;
  $$("#fav-n").forEach((el) => (el.textContent = n));
}

function toggleFav(slug, btn) {
  const f = getFav(), i = f.indexOf(slug);
  i < 0 ? f.push(slug) : f.splice(i, 1);
  setFav(f);
  const on = i < 0;
  if (btn) {
    btn.classList.toggle("on", on);
    btn.textContent = on ? "♥" : "♡";
    btn.setAttribute("aria-pressed", String(on));
  }
  document.dispatchEvent(new CustomEvent("fav-changed"));
}

document.addEventListener("click", (e) => {
  const b = e.target.closest(".fav");
  if (!b) return;
  e.preventDefault();
  e.stopPropagation();
  toggleFav(b.dataset.slug, b);
});

function addToCart(slug, size, qty = 1) {
  const c = getCart();
  const hit = c.find((l) => l.slug === slug && l.size === size);
  if (hit) hit.qty += qty; else c.push({ slug, size, qty });
  setCart(c);
  renderCart();
  openDrawer(true);
}

function changeQty(i, d) {
  const c = getCart();
  c[i].qty += d;
  if (c[i].qty <= 0) c.splice(i, 1);
  setCart(c);
  renderCart();
}

function renderCart() {
  const body = $("#cart-body"), foot = $("#cart-foot");
  if (!body) return;
  const c = getCart();
  if (!c.length) {
    body.innerHTML = `<p class="cart-empty">Keranjang masih kosong.</p>`;
    foot.hidden = true;
    return;
  }
  foot.hidden = false;
  body.innerHTML = c.map((l, i) => {
    const p = PRODUCTS.find((x) => x.slug === l.slug);
    return `<div class="cart-line">
      <img src="${p.images[0]}" alt="${p.name}">
      <div>
        <div class="nm">${p.name}</div>
        <div class="lbl mute" style="margin-top:6px">Ukuran ${l.size} · ${rp(p.price)}</div>
        <span class="qty">
          <button aria-label="kurangi" onclick="changeQty(${i},-1)">−</button>
          <span class="lbl">${l.qty}</span>
          <button aria-label="tambah" onclick="changeQty(${i},1)">+</button>
        </span><br>
        <a class="rm lbl" href="#" onclick="event.preventDefault();changeQty(${i},-${l.qty})">Hapus</a>
      </div>
      <div class="lbl">${rp(p.price * l.qty)}</div>
    </div>`;
  }).join("");
  const total = c.reduce((s, l) => s + PRODUCTS.find((x) => x.slug === l.slug).price * l.qty, 0);
  $("#cart-total").textContent = rp(total);
  $("#checkout").onclick = () => {
    const lines = c.map((l) => {
      const p = PRODUCTS.find((x) => x.slug === l.slug);
      return `• ${p.name} (UK ${l.size}) x${l.qty} — ${rp(p.price * l.qty)}`;
    }).join("%0A");
    const msg = `Halo JEJAKARA, saya mau pesan:%0A${lines}%0A%0ATotal: ${rp(total)}`;
    window.open(`https://wa.me/${SITE.whatsapp}?text=${msg}`, "_blank");
  };
}

function openDrawer(open) {
  $("#drawer")?.classList.toggle("open", open);
  $("#veil")?.classList.toggle("open", open);
}

function initCart() {
  renderCartCount();
  renderCart();
  $$(".cart-open").forEach((b) => b.addEventListener("click", () => openDrawer(true)));
  $("#drawer-close")?.addEventListener("click", () => openDrawer(false));
  $("#veil")?.addEventListener("click", () => openDrawer(false));
  document.addEventListener("keydown", (e) => e.key === "Escape" && openDrawer(false));
}

/* ---------- kartu produk ---------- */
function cardHTML(p, cls = "") {
  const favOn = getFav().includes(p.slug);
  return `<a class="card reveal ${cls}" href="produk.html?id=${p.slug}">
    <span class="frame"><button class="fav${favOn ? " on" : ""}" type="button" data-slug="${p.slug}" aria-label="Simpan ${p.name} ke favorit" aria-pressed="${favOn}">${favOn ? "♥" : "♡"}</button><img src="${p.images[0]}" alt="${p.name}" loading="lazy"></span>
    <span class="meta">
      <span><span class="name">${p.name}</span><br><span class="lbl mute">Edisi ${p.edition} · ${p.category}</span></span>
      <span class="lbl see">Lihat →</span>
      <span class="lbl">${rp(p.price)}</span>
    </span>
  </a>`;
}

/* ---------- beranda ---------- */
function initHome() {
  const grid = $("#kurasi");
  if (grid) {
    const pick = [PRODUCTS[0], PRODUCTS[2], PRODUCTS[1]];
    grid.innerHTML = pick.map((p, i) => cardHTML(p, i === 0 ? "large" : "")).join("");
  }
  const band = $("#craft-band");
  if (band) band.style.backgroundImage = "url(assets/img/craft-1.webp)";

  // hero toggle
  const toggle = $("#hero-toggle");
  if (toggle) {
    const imgs = $$("#hero-media img"), ghost = $("#hero-ghost");
    const labels = ["Edisi Baru", "Atelier"];
    $$("button", toggle).forEach((b, i) => b.addEventListener("click", () => {
      $$("button", toggle).forEach((x, j) => x.classList.toggle("on", i === j));
      imgs.forEach((im, j) => im.classList.toggle("active", i === j));
      ghost.textContent = i === 0 ? "Koleksi I" : "Atelier";
    }));
  }

  $("#drop-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.outerHTML = `<p class="done lbl">Terima kasih — kami kabari sebelum edisi berikutnya.</p>`;
  });
}

/* ---------- koleksi ---------- */
function initKoleksi() {
  const grid = $("#grid-products");
  if (!grid) return;
  const state = { sizes: new Set(), colors: new Set(), cats: new Set(), sort: "default", q: "", fav: false };

  const colors = [...new Set(PRODUCTS.flatMap((p) => p.colors))];
  const cats = [...new Set(PRODUCTS.map((p) => p.category))];

  const group = (id, label, items, key) =>
    `<div class="fgroup" data-key="${key}"><span class="lbl">${label}</span>` +
    items.map((v) => `<button class="chip" data-v="${v}">${v}</button>`).join("") + `</div>`;

  $("#filters").innerHTML =
    group("size", "Ukuran", SITE.sizes, "sizes") +
    group("color", "Warna", colors, "colors") +
    group("cat", "Jenis", cats, "cats");

  function apply() {
    const favs = getFav();
    let list = PRODUCTS.filter((p) =>
      (!state.cats.size || state.cats.has(p.category)) &&
      (!state.colors.size || p.colors.some((c) => state.colors.has(c))) &&
      (!state.sizes.size || SITE.sizes.some((s) => state.sizes.has(s) && !p.soldout.includes(s))) &&
      (!state.fav || favs.includes(p.slug)) &&
      (!state.q || (p.name + " " + p.code + " " + p.category + " " + p.materials.join(" ")).toLowerCase().includes(state.q))
    );
    if (state.sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (state.sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    $("#count").textContent = `${list.length} pasang`;
    grid.innerHTML = list.length
      ? list.map((p) => cardHTML(p)).join("")
      : "";
    $("#empty").hidden = !!list.length;
    if (!document.documentElement.classList.contains("is-loading")) initReveal();
  }

  $("#filters").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const key = chip.closest(".fgroup").dataset.key;
    const v = key === "sizes" ? Number(chip.dataset.v) : chip.dataset.v;
    state[key].has(v) ? state[key].delete(v) : state[key].add(v);
    chip.classList.toggle("on");
    apply();
  });
  $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; apply(); });
  $("#q").addEventListener("input", (e) => { state.q = e.target.value.trim().toLowerCase(); apply(); });
  const favBtn = $("#fav-toggle");
  favBtn.addEventListener("click", () => {
    state.fav = !state.fav;
    favBtn.classList.toggle("on", state.fav);
    favBtn.setAttribute("aria-pressed", String(state.fav));
    apply();
  });
  document.addEventListener("fav-changed", () => { if (state.fav) apply(); });
  apply();
}

/* ---------- halaman produk ---------- */
function initPDP() {
  const root = $("#pdp");
  if (!root) return;
  const slug = new URLSearchParams(location.search).get("id");
  const p = PRODUCTS.find((x) => x.slug === slug) || PRODUCTS[0];
  let size = null;

  $("#crumb").textContent = p.category;
  $("#p-name").textContent = p.name;
  $("#p-code").textContent = `${p.code} · Edisi ${p.edition}`;
  $("#p-price").textContent = rp(p.price);
  $("#p-desc").textContent = p.desc;
  $("#stage-img").src = p.images[0];
  $("#stage-img").alt = p.name;
  $("#thumbs").innerHTML = p.images
    .map((src, i) => `<img src="${src}" alt="${p.name} ${i + 1}" class="${i === 0 ? "on" : ""}">`)
    .join("");
  $$("#thumbs img").forEach((t) => t.addEventListener("click", () => {
    $$("#thumbs img").forEach((x) => x.classList.remove("on"));
    t.classList.add("on");
    const stage = $("#stage-img");
    stage.style.opacity = 0;
    setTimeout(() => { stage.src = t.src; stage.style.opacity = 1; }, 180);
  }));

  $("#p-stats").innerHTML = p.stats
    .map((s) => `<div class="stat"><div class="n">${s.n}</div><div class="l lbl">${s.l}</div></div>`)
    .join("");
  $("#p-mats").innerHTML = p.materials.map((m) => `<li>${m}</li>`).join("");

  $("#sizes").innerHTML = SITE.sizes.map((s) =>
    `<button class="size ${p.soldout.includes(s) ? "out" : ""}" data-s="${s}" ${p.soldout.includes(s) ? "disabled" : ""}>${s}</button>`
  ).join("");
  $("#sizes").addEventListener("click", (e) => {
    const b = e.target.closest(".size");
    if (!b || b.disabled) return;
    $$("#sizes .size").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    size = Number(b.dataset.s);
    $("#p-err").textContent = "";
  });
  $("#add-btn").addEventListener("click", () => {
    if (!size) { $("#p-err").textContent = "Pilih ukuran dulu."; return; }
    addToCart(p.slug, size);
  });

  const rel = PRODUCTS.filter((x) => x.slug !== p.slug).slice(0, 3);
  $("#related-grid").innerHTML = rel.map((x) => cardHTML(x)).join("");
}

/* ---------- buka <details> sesuai hash (FAQ) + tautan WA ---------- */
function initHash() {
  if (!location.hash) return;
  const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (el && el.tagName === "DETAILS") { el.open = true; el.scrollIntoView(); }
}

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initCart();
  renderFavCount();
  initHome();
  initKoleksi();
  initPDP();
  initTransition();
  initHash();
  const wa = $("#wa-link");
  if (wa) wa.href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Halo Jejakara, saya mau bertanya...")}`;
  initLoader(() => { initReveal(); initCounters(); }); // reveal mulai setelah loader terangkat
});
