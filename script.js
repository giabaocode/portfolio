/* ===========================================
   THE WORKFLOW ENGINE — interactions
   =========================================== */

/* ---------- Project data: each project is a state machine ---------- */
const ICON_CHECK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

const PROJECTS = [
  {
    id: "lunfa",
    name: "Lunfa — AI Chinese writing tutor",
    tagline:
      "A chatbot that finds grammar mistakes in a learner's Chinese sentence, highlights them, and coaches the learner to fix it themselves — instead of handing over the answer.",
    tags: ["ai", "backend", "ba"],
    badge: "Freelance",
    badgeType: "badge-green",
    date: "Mar – Apr 2026",
    live: "lunfa.net",
    stack: [
      "React 19",
      "Express 5",
      "MongoDB",
      "Vertex AI · Gemini 2.5",
      "JWT",
    ],
    links: [
      { label: "Live site →", href: "https://lunfa.net" },
      { label: "Code", href: "https://github.com/giabaocode", ghost: true },
    ],
    flow: [
      {
        label: "USER INPUT",
        desc: "Learner types a sentence in Chinese (HSK 1–4 level).",
      },
      {
        label: "AI ANALYZE",
        desc: "Gemini 2.5 Flash evaluates the sentence against a grammar rulebook.",
        challenge:
          "The AI sometimes returns broken JSON — control characters inside string values crash the parser.",
        fix: "A ~3,000-word system prompt pins the grammar rules + a strict output schema, with responseMimeType=JSON. On top of that, a 3-layer guard: normal parse → sanitize + regex-extract the JSON → safe fallback message. The chat never dies.",
      },
      {
        label: "HIGHLIGHT",
        desc: "Wrong words are painted red inside the original sentence.",
        challenge:
          "Highlighting the exact wrong word without matching a shorter substring elsewhere.",
        fix: "Build a dynamic split regex with error words sorted by length (longest first), then render each segment separately so only the real mistakes light up.",
      },
      {
        label: "SELF-CORRECT",
        desc: "The learner gets reason + correct structure + a prompt, and rewrites it themselves.",
        challenge:
          "Vertex AI requires the chat history to start with a 'user' role, and long history blows the token limit.",
        fix: "shift() off any leading non-user message and keep only the last 10 turns — pedagogy stays intact (never give the answer) while staying inside limits.",
      },
      {
        label: "MASTERED",
        desc: "Correct sentence accepted. Conversation auto-titled by Gemini and saved to MongoDB.",
      },
    ],
  },
  {
    id: "unihub",
    name: "UniHub Workshop — event lifecycle platform",
    tagline:
      "Digitizes a university's 'skills & career week': student registers → pays by QR → gets an emailed QR ticket → staff scans it at the door, even with no WiFi. Built to survive a real traffic spike.",
    tags: ["backend", "ba"],
    badge: "Course",
    badgeType: "badge",
    date: "Apr – May 2026",
    note: "Load-tested with K6 at 12,000 virtual users · p95 < 2s · error < 1%.",
    stack: [
      "Java 21",
      "Spring Boot 3",
      "PostgreSQL",
      "Redis",
      "Resilience4j",
      "PWA",
    ],
    links: [{ label: "Code", href: "https://github.com/giabaocode" }],
    flow: [
      {
        label: "REGISTER",
        desc: "Student claims a seat for a workshop.",
        challenge: "12,000 people hit 'register' at once → seats get oversold.",
        fix: "Optimistic locking (@Version): when two transactions read version=1, only one commits — the other gets OptimisticLockException and is told the seat is gone. A unique (user_id, workshop_id) constraint blocks double-submits, and a 2-tier Redis rate limit (5 req/10s per IP) shields the endpoint.",
      },
      {
        label: "QR PAYMENT",
        desc: "Pays via the SePay QR gateway; a webhook confirms asynchronously.",
        challenge:
          "If the payment gateway hangs, it could exhaust the thread pool and take the whole system down.",
        fix: "A Resilience4j circuit breaker trips OPEN after repeated timeouts → fail-fast instead of piling up blocked threads.",
      },
      {
        label: "EMAIL TICKET",
        desc: "A QR-coded ticket is emailed asynchronously via Spring events + @Async, so the API responds instantly.",
      },
      {
        label: "OFFLINE CHECK-IN",
        desc: "Staff scan tickets at the venue through a PWA.",
        challenge: "The auditorium WiFi drops in the middle of the event.",
        fix: "A service worker caches the app shell; scans are stored in IndexedDB offline and batch-synced automatically when the connection returns.",
      },
      {
        label: "ATTENDED",
        desc: "Check-in recorded. SeatReleaseJob frees expired PENDING tickets back to the pool.",
      },
    ],
  },
  {
    id: "auction",
    name: "Online Auction Platform",
    tagline:
      "A full marketplace: bidders bid, sellers list, admins govern. Auto-bid, Buy Now, anti-sniping, a 4-step post-auction payment flow, buyer–seller chat and reputation — all kept correct under concurrent bids.",
    tags: ["backend", "ba"],
    badge: "Final project",
    badgeType: "badge",
    date: "Nov 2025 – Jan 2026",
    note: "17-table schema · 50+ documented endpoints · 6 route groups · 3 roles.",
    stack: ["TypeScript", "Express 5", "PostgreSQL", "Cloudinary", "node-cron"],
    links: [{ label: "Code", href: "https://github.com/giabaocode" }],
    flow: [
      {
        label: "LISTED",
        desc: "Seller posts a product with a WYSIWYG editor and multi-image upload to Cloudinary.",
      },
      {
        label: "BIDDING",
        desc: "Bidders place manual bids or set an auto-bid ceiling.",
        challenge:
          "Many people bid the same product at the same millisecond → price race condition.",
        fix: "SELECT ... FOR UPDATE takes a row-level lock inside a transaction, so only one bid is processed per product at a time. Auto-bid is its own 3-branch state machine (raise ceiling / lose to old ceiling / beat old bidder), all in one transaction.",
      },
      {
        label: "ANTI-SNIPE",
        desc: "Guards against last-second sniping.",
        challenge:
          "Snipers bid in the final seconds to deny others a counter-bid.",
        fix: "If time-remaining < 5 minutes when a bid lands, end_at is pushed +10 minutes — the snipe strategy stops working.",
      },
      {
        label: "WON",
        desc: "Auction closes. A node-cron job runs every minute to detect ended auctions and fire 6 kinds of notification email.",
      },
      {
        label: "PAID → SHIPPED",
        desc: "Buyer uploads payment proof, seller confirms shipping, buyer confirms receipt.",
        challenge: "Sending email must never block the API response.",
        fix: "Every sendEmail() is called with .catch() and without await — the request returns immediately while mail goes out in the background.",
      },
      {
        label: "RATED",
        desc: "Both sides leave +/- reputation. Denormalized current_price & bid_count keep listing queries fast.",
      },
    ],
  },
  {
    id: "coffee",
    name: "Coffee Shop POS & Management",
    tagline:
      "A role-based system for a real coffee shop (GUTA): staff take orders on a POS, managers watch revenue analytics, HR runs shift scheduling. Admin / Manager / Staff each get their own surface.",
    tags: ["ba", "backend"],
    badge: "Running in a real shop",
    badgeType: "badge-amber",
    date: "Jun – Aug 2025",
    live: "in production",
    stack: ["React 19", "Express 5", "PostgreSQL", "Docker"],
    links: [
      { label: "Code", href: "https://github.com/tdthien106/Coffee_shop" },
    ],
    flow: [
      {
        label: "BROWSE",
        desc: "Staff browse drinks by category — the POS module I built end-to-end.",
      },
      {
        label: "CART",
        desc: "Real-time cart with per-item notes (preset tags + free text).",
      },
      {
        label: "CHECKOUT",
        desc: "A 3-step checkout: Summary → Transfer → Success.",
        challenge:
          "Circular foreign keys: orders.payment_id → payment and payment.order_id → orders.",
        fix: "DEFERRABLE INITIALLY DEFERRED constraints let both rows be inserted inside the same transaction without a chicken-and-egg failure.",
      },
      {
        label: "SUCCESS",
        desc: "Order completed and persisted; receipt issued.",
      },
      {
        label: "DASHBOARD",
        desc: "Managers see revenue-by-hour, peak hours and period-over-period comparisons.",
        challenge:
          "Heavy analytics queries on the manager dashboard, plus keeping staff out of it.",
        fix: "CTEs build the revenue aggregates, Promise.all() runs 9 analytics queries in parallel, and values are cast ::int/::bigint in SQL to avoid string/number bugs in JS. RBAC: a RequireAuth guard on the client + an authorize(...roles) middleware factory on the server.",
      },
    ],
  },
  {
    id: "homestay",
    name: "HomestayDorm — rental operations",
    tagline:
      "Runs a dorm/rental business down to the individual bed: intake → consult → viewing → deposit → contract → move-out & reconciliation. Multi-branch, 3 roles, built fullstack on Next.js Server Actions (no separate REST API).",
    tags: ["backend", "ba"],
    badge: "Team of 4",
    badgeType: "badge",
    date: "Mar – Apr 2026",
    stack: ["Next.js 16", "Prisma 7", "PostgreSQL", "TypeScript", "Zod"],
    links: [{ label: "Code", href: "https://github.com/giabaocode" }],
    flow: [
      {
        label: "DRAFT → CONSULT",
        desc: "The registration ticket I owned: a 6-state machine (DRAFT → CONSULTING → WAITING_VIEW → WAITLIST → COMPLETED / CANCELLED).",
        challenge: "Manage availability at bed granularity, not just per room.",
        fix: "Modeled Room → Bed (1-to-N), each bed with its own status (AVAILABLE / OCCUPIED / DEPOSITED / MAINTENANCE) and price — so a room can be rented whole or shared.",
      },
      {
        label: "VIEWING",
        desc: "A viewing appointment is scheduled off the registration ticket.",
      },
      {
        label: "DEPOSIT → CONTRACT",
        desc: "Deposit taken, then a contract is signed per bed.",
        challenge:
          "If admin changes a bed's price later, old contracts must not change.",
        fix: "Price-snapshot pattern: ContractBedDetail stores priceAtSigning at signing time, fully decoupled from future price edits.",
      },
      {
        label: "RETURN",
        desc: "Move-out and reconciliation.",
        challenge: "Return-room has 10+ possible states.",
        fix: "A clearly-defined ReturnRoomTicketStatus enum, with every transition validated at the Server Action layer.",
      },
    ],
  },
  {
    id: "petcare",
    name: "PetCareX — vet clinic management",
    tagline:
      "A multi-branch veterinary clinic system — booking, examination, prescriptions, billing, subscription packages and loyalty points. I was the sole developer (frontend + backend) in a 4-person team.",
    tags: ["backend", "ba"],
    badge: "Sole implementer",
    badgeType: "badge",
    date: "Nov 2025 – Jan 2026",
    note: "5 roles · 9 route groups · dual layout (customer vs staff) · raw SQL, no ORM.",
    stack: ["React 18", "TypeScript", "Express", "PostgreSQL", "React Query"],
    links: [{ label: "Code", href: "https://github.com/giabaocode" }],
    flow: [
      {
        label: "BOOK",
        desc: "Customer books an exam / vaccination / spa slot.",
        challenge: "Two customers book the same doctor for the same time slot.",
        fix: "A conflict-detection query checks the doctor's existing appointments before inserting; a clash returns 400 instead of a double-booking.",
      },
      { label: "CONFIRM", desc: "Front desk confirms (PENDING → WAITING)." },
      {
        label: "EXAM",
        desc: "Doctor examines the pet and records a diagnosis.",
      },
      {
        label: "PRESCRIBE → INVOICE",
        desc: "Prescription written, invoice generated automatically.",
        challenge:
          "Finishing an exam must atomically update status, write the prescription and create a correct invoice.",
        fix: "One PostgreSQL transaction (BEGIN/COMMIT/ROLLBACK) updates the visit, inserts the prescription and creates the invoice (exam fee + drug fee), then moves it to WAITING_PAYMENT. Parameterized $1,$2 queries keep raw SQL injection-safe.",
      },
      {
        label: "PAID",
        desc: "Payment recorded → loyalty points added, active service packages decremented per use.",
      },
    ],
  },
  {
    id: "melodix",
    name: "Melodix — Android music streaming",
    tagline:
      "A Spotify-style Android app with 3 roles (User / Artist / Admin): background playback, offline download, synced lyrics, Supabase backend. MVVM with 12 repositories, 14 API services, 10+ ViewModels.",
    tags: ["mobile", "backend", "ba"],
    badge: "Mobile",
    badgeType: "badge-blue",
    date: "Mar – Apr 2026",
    stack: ["Java", "Android", "MVVM", "Supabase", "Room", "ExoPlayer"],
    links: [{ label: "Code", href: "https://github.com/giabaocode" }],
    flow: [
      {
        label: "PLAY",
        desc: "User taps a song; playback starts through ExoPlayer.",
        challenge: "The JWT can expire mid-session while the user is browsing.",
        fix: "An OkHttp Authenticator catches 401s, silently refreshes the token and retries the original request — transparent to the UI layer. A play only counts after 15 continuous seconds, so the play-count can't be spammed.",
      },
      {
        label: "BACKGROUND",
        desc: "Music keeps playing when the app is backgrounded, with a media notification.",
        challenge: "Android can kill the process and stop playback.",
        fix: "A Foreground Service + MediaSession + START_STICKY keeps the notification alive and stops the OS from killing the player.",
      },
      {
        label: "DOWNLOAD",
        desc: "Songs are downloaded for offline listening via WorkManager.",
        challenge:
          "Scoped Storage changed how files are written on Android 10+.",
        fix: "Branch by SDK version — Android 10+ uses the MediaStore API (ContentResolver), 9- uses the file system directly. Either way, metadata lands in Room DB.",
      },
      {
        label: "OFFLINE",
        desc: "Tracks play from the local Room library with no network.",
      },
    ],
  },
];

/* ---------- Render project cards ---------- */
const grid = document.getElementById("project-grid");

function nodeMarkup(node, i, pid) {
  const hasNote = !!(node.challenge || node.fix);
  return `
    <button class="node${i === 0 ? " active" : ""}${hasNote ? " has-note" : ""}"
            data-project="${pid}" data-i="${i}" aria-pressed="${i === 0}">
      <span class="node-dot"><span class="node-num">${i + 1}</span></span>
      <span class="node-label">${node.label}</span>
    </button>`;
}

function detailMarkup(node) {
  const isNote = !!(node.challenge || node.fix);
  let html = `<p class="fd-stage">${node.label}</p><p class="fd-desc">${node.desc}</p>`;
  if (node.challenge) {
    html += `<div class="fd-block challenge"><span class="fd-tag">⚠ Hard problem</span><p>${node.challenge}</p></div>`;
  }
  if (node.fix) {
    html += `<div class="fd-block fix"><span class="fd-tag">✓ How I solved it</span><p>${node.fix}</p></div>`;
  }
  return { html, isNote };
}

function projectMarkup(p) {
  const nodes = p.flow
    .map(
      (n, i) =>
        nodeMarkup(n, i, p.id) +
        (i < p.flow.length - 1
          ? '<span class="wire" aria-hidden="true"></span>'
          : ""),
    )
    .join("");

  const first = detailMarkup(p.flow[0]);
  const stack = p.stack.map((s) => `<span>${s}</span>`).join("");
  const links = p.links
    .map(
      (l) =>
        `<a href="${l.href}" target="_blank" rel="noopener"${l.ghost ? ' class="ghost"' : ""}>${l.label}</a>`,
    )
    .join("");
  const livePill = p.live
    ? `<span class="live-pill"><span class="sys-dot"></span>${p.live === "in production" ? "IN PRODUCTION" : "LIVE · " + p.live}</span>`
    : "";
  const noteRow = p.note
    ? `<p class="project-tagline" style="margin-top:10px;color:var(--text-3);font-family:var(--mono);font-size:12.5px">${p.note}</p>`
    : "";

  return `
    <article class="project" data-tags="${p.tags.join(" ")}">
      <span class="spotlight" aria-hidden="true"></span>
      <div class="project-top">
        <div class="project-head">
          <div class="project-meta">
            <span class="badge ${p.badgeType}">${p.badge}</span>
            <time>${p.date}</time>
          </div>
          <h3>${p.name}</h3>
          <p class="project-tagline">${p.tagline}</p>
          ${noteRow}
        </div>
        ${livePill}
      </div>

      <div class="flow-wrap">
        <div class="flow" role="group" aria-label="${p.name} workflow">${nodes}</div>
      </div>
      <div class="flow-detail${first.isNote ? " is-note" : ""}" id="detail-${p.id}" aria-live="polite">${first.html}</div>

      <div class="project-foot">
        <div class="project-stack">${stack}</div>
        <div class="project-actions">${links}</div>
      </div>
    </article>`;
}

grid.innerHTML = PROJECTS.map(projectMarkup).join("");

/* ---------- Node interactions (event delegation) ---------- */
grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".node");
  if (!btn) return;
  const pid = btn.dataset.project;
  const i = parseInt(btn.dataset.i, 10);
  const project = PROJECTS.find((p) => p.id === pid);
  if (!project) return;

  // toggle active state within this project
  btn.parentElement.querySelectorAll(".node").forEach((n) => {
    const on = n === btn;
    n.classList.toggle("active", on);
    n.setAttribute("aria-pressed", on);
  });

  const { html, isNote } = detailMarkup(project.flow[i]);
  const panel = document.getElementById(`detail-${pid}`);
  panel.innerHTML = html;
  panel.classList.toggle("is-note", isNote);
});

/* ---------- Theme ---------- */
const root = document.documentElement;
const savedTheme = localStorage.getItem("theme");
if (savedTheme) root.dataset.theme = savedTheme;
document.getElementById("theme-btn")?.addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  localStorage.setItem("theme", next);
});

/* ---------- Year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Hamburger ---------- */
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");
hamburger?.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  mobileMenu.classList.toggle("open");
  document.body.style.overflow = mobileMenu.classList.contains("open")
    ? "hidden"
    : "";
});
document.querySelectorAll(".mobile-menu a").forEach((a) => {
  a.addEventListener("click", () => {
    hamburger.classList.remove("open");
    mobileMenu.classList.remove("open");
    document.body.style.overflow = "";
  });
});

/* ---------- Project filters ---------- */
const filters = document.querySelectorAll(".filter");
filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    filters.forEach((b) => b.classList.toggle("active", b === btn));
    document.querySelectorAll(".project").forEach((p) => {
      const tags = p.dataset.tags?.split(" ") || [];
      p.hidden = f !== "all" && !tags.includes(f);
    });
  });
});

/* ---------- Active nav on scroll ---------- */
const navLinks = document.querySelectorAll(".nav-links a");
const sections = [...navLinks]
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);
const secObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) =>
        a.classList.toggle(
          "active",
          a.getAttribute("href") === `#${e.target.id}`,
        ),
      );
    });
  },
  { rootMargin: "-40% 0px -55% 0px" },
);
sections.forEach((s) => secObs.observe(s));

/* ---------- Scroll reveal ---------- */
const reveals = document.querySelectorAll(
  ".numbers, .number-item, .project, .skill-card, .tl-item, .edu-card, .contact-grid, .contact-intro, .copy-btn",
);
const prefersReduced = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
if (prefersReduced) {
  reveals.forEach((el) => el.classList.add("visible"));
} else {
  reveals.forEach((el) => el.classList.add("reveal"));
  const revealObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
  );
  reveals.forEach((el) => revealObs.observe(el));
}

/* ---------- Counters ---------- */
const counters = document.querySelectorAll("[data-count]");
const counterObs = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const plus = el.dataset.plus === "1";
      const duration = 1200;
      const start = performance.now();
      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = Math.round(eased * target);
        el.textContent = val >= 1000 ? val.toLocaleString() : val;
        if (plus && t === 1) el.textContent += "+";
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  },
  { threshold: 0.3 },
);
counters.forEach((el) => counterObs.observe(el));

/* ---------- Copy email ---------- */
const copyBtn = document.getElementById("copy-email");
copyBtn?.addEventListener("click", async () => {
  const email = copyBtn.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = email;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  copyBtn.textContent = "Copied ✓";
  setTimeout(() => {
    copyBtn.textContent = "Copy email address";
  }, 2000);
});

/* ===========================================
   HERO ENGINE — a live "running system" diagram
   ===========================================
   A request packet flows through backend nodes (CLIENT → API → AUTH →
   SERVICE → LOCK → DB → CACHE → QUEUE → EMAIL); nodes light up as packets
   arrive. Pure canvas, no assets/deps. Pauses off-screen, reads theme
   colors live, and renders a single static frame for reduced-motion.        */
(function heroEngine() {
  const canvas = document.getElementById("engine-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Graph (normalized 0..1 coordinates)
  const NODES = {
    client: { x: 0.1, y: 0.5, label: "CLIENT" },
    api: { x: 0.34, y: 0.5, label: "API" },
    auth: { x: 0.34, y: 0.16, label: "AUTH" },
    svc: { x: 0.6, y: 0.5, label: "SERVICE" },
    queue: { x: 0.6, y: 0.16, label: "QUEUE" },
    lock: { x: 0.6, y: 0.86, label: "LOCK" },
    db: { x: 0.87, y: 0.5, label: "DB" },
    cache: { x: 0.87, y: 0.16, label: "CACHE" },
    email: { x: 0.87, y: 0.86, label: "EMAIL" },
  };
  const PATHS = [
    ["client", "api", "svc", "db", "cache"],
    ["client", "api", "auth"],
    ["svc", "queue", "email"],
    ["api", "svc", "lock"],
  ];

  // Distinct edges to draw
  const seen = new Set();
  const EDGES = [];
  PATHS.forEach((p) => {
    for (let i = 0; i < p.length - 1; i++) {
      const k = p[i] + ">" + p[i + 1];
      if (!seen.has(k)) {
        seen.add(k);
        EDGES.push([p[i], p[i + 1]]);
      }
    }
  });

  // index-based pseudo-random so reload looks varied without Math.random reliance
  Object.values(NODES).forEach((n, i) => {
    n.glow = 0;
    n.phase = i * 1.7;
  });

  const packets = [];
  PATHS.forEach((p, i) => {
    for (let j = 0; j < 2; j++)
      packets.push({
        path: p,
        seg: 0,
        t: 0,
        speed: 0.46 + (i * 0.07 + j * 0.05),
        wait: j * 1.5 + i * 0.45,
      });
  });

  // Colors pulled live from CSS variables (so dark/light both look right)
  const COL = {};
  // Glow sprite, pre-rendered once per theme — avoids per-frame radial gradients
  const glow = document.createElement("canvas");
  glow.width = glow.height = 36;
  const gctx = glow.getContext("2d");
  function buildGlow() {
    gctx.clearRect(0, 0, 36, 36);
    const g = gctx.createRadialGradient(18, 18, 0, 18, 18, 18);
    g.addColorStop(0, sigA(1));
    g.addColorStop(0.5, sigA(0.5));
    g.addColorStop(1, sigA(0));
    gctx.fillStyle = g;
    gctx.beginPath();
    gctx.arc(18, 18, 18, 0, Math.PI * 2);
    gctx.fill();
  }
  function refreshColors() {
    const cs = getComputedStyle(document.documentElement);
    const get = (v, d) => cs.getPropertyValue(v).trim() || d;
    COL.signal = get("--signal", "#43e08b");
    COL.wire = get("--wire", "#2c3a4d");
    COL.node = get("--bg-card", "#11161f");
    COL.text = get("--text-2", "#8a95a8");
    COL.text3 = get("--text-3", "#5d6a7e");
    buildGlow();
  }
  refreshColors();
  document
    .getElementById("theme-btn")
    ?.addEventListener("click", () => setTimeout(refreshColors, 0));

  function sigA(a) {
    let h = COL.signal.replace("#", "");
    if (h.length === 3)
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    const r = parseInt(h.slice(0, 2), 16),
      g = parseInt(h.slice(2, 4), 16),
      b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  let W = 0,
    H = 0;
  function resize() {
    const r = canvas.getBoundingClientRect();
    W = r.width;
    H = r.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
  resize();

  const pad = 28;
  const px = (n) => pad + n.x * (W - 2 * pad);
  const py = (n) => pad + n.y * (H - 2 * pad);

  // Cursor parallax (desktop only)
  let mx = 0,
    my = 0;
  if (window.matchMedia("(pointer:fine)").matches && !reduce) {
    const host = canvas.parentElement;
    host.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
    });
    host.addEventListener("pointerleave", () => {
      mx = 0;
      my = 0;
    });
  }

  let t = 0,
    last = 0,
    raf = null,
    running = false;
  function draw(dt) {
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(-mx * 14, -my * 14);

    // node positions (with a gentle bob)
    const pos = {};
    for (const id in NODES) {
      const n = NODES[id];
      pos[id] = {
        x: px(n),
        y: py(n) + (reduce ? 0 : Math.sin(t * 1.1 + n.phase) * 3),
      };
    }

    // edges
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = COL.wire;
    EDGES.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(pos[a].x, pos[a].y);
      ctx.lineTo(pos[b].x, pos[b].y);
      ctx.stroke();
    });

    // packets
    if (!reduce) {
      packets.forEach((pk) => {
        if (pk.wait > 0) {
          pk.wait -= dt;
          return;
        }
        const a = pos[pk.path[pk.seg]],
          b = pos[pk.path[pk.seg + 1]];
        pk.t += dt * pk.speed;
        if (pk.t >= 1) {
          pk.t = 0;
          pk.seg++;
          NODES[pk.path[pk.seg]].glow = 1;
          if (pk.seg >= pk.path.length - 1) {
            pk.seg = 0;
            pk.wait = 1.1 + pk.speed * 2;
          }
          return;
        }
        const x = a.x + (b.x - a.x) * pk.t,
          y = a.y + (b.y - a.y) * pk.t;
        ctx.drawImage(glow, x - 9, y - 9, 18, 18);
      });
    }

    // nodes
    for (const id in NODES) {
      const n = NODES[id],
        p = pos[id];
      n.glow = Math.max(0, n.glow - dt * 1.6);
      const lit = reduce ? 0.5 : n.glow;
      if (lit > 0.01) {
        ctx.globalAlpha = 0.55 * lit;
        ctx.drawImage(glow, p.x - 16, p.y - 16, 32, 32);
        ctx.globalAlpha = 1;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = lit > 0.05 ? COL.signal : COL.node;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = COL.signal;
      ctx.globalAlpha = lit > 0.05 ? 1 : 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = lit > 0.3 ? COL.text : COL.text3;
      ctx.font = "600 9px 'JetBrains Mono', ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(n.label, p.x, p.y + 11);
    }

    ctx.restore();
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!last) last = now;
    const elapsed = (now - last) / 1000;
    if (elapsed < 0.032) return; // cap at ~30fps — plenty for an ambient diagram
    last = now;
    const dt = Math.min(elapsed, 0.05);
    t += dt;
    draw(dt);
  }
  function start() {
    if (running) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  if (reduce) {
    draw(0);
  } else {
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        (es) => es.forEach((e) => (e.isIntersecting ? start() : stop())),
        { threshold: 0.05 },
      ).observe(canvas);
    } else {
      start();
    }
    document.addEventListener("visibilitychange", () =>
      document.hidden ? stop() : start(),
    );
  }
})();

/* ===========================================
   WOW LAYER — boot intro · scroll bar · card spotlight
   =========================================== */

/* Boot intro + hero entrance */
(function boot() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bootEl = document.getElementById("boot");
  const log = document.getElementById("boot-log");
  const ready = () => document.body.classList.add("ready");
  const finish = () => {
    bootEl && bootEl.classList.add("done");
    ready();
  };

  if (reduce || sessionStorage.getItem("booted") || !bootEl || !log) {
    bootEl && bootEl.classList.add("done");
    ready();
    return;
  }
  sessionStorage.setItem("booted", "1");

  const lines = [
    { t: "$ ./giabao --boot", c: "cmd" },
    { t: "[ ok ] loading workflows ............ 7", c: "" },
    { t: "[ ok ] datastores ......... pg · mongo · redis", c: "" },
    { t: "[ ok ] state machines online", c: "" },
    { t: "> ready. welcome.", c: "ok" },
  ];
  let i = 0;
  (function typeLine() {
    if (i >= lines.length) {
      setTimeout(finish, 520);
      return;
    }
    const ln = lines[i++];
    const span = document.createElement("span");
    if (ln.c) span.className = ln.c;
    span.textContent = ln.t + "\n";
    log.appendChild(span);
    setTimeout(typeLine, 230);
  })();
  setTimeout(finish, 2800); // safety: never trap the visitor
})();

/* Scroll progress bar */
const progressBar = document.getElementById("scroll-progress");
if (progressBar) {
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progressBar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* Project card cursor spotlight (rAF-throttled to avoid layout thrash) */
if (window.matchMedia("(pointer:fine)").matches) {
  const grid = document.getElementById("project-grid");
  let pending = false,
    lastEv = null;
  grid?.addEventListener(
    "pointermove",
    (e) => {
      lastEv = e;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const card = lastEv.target.closest && lastEv.target.closest(".project");
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty(
          "--mx",
          ((lastEv.clientX - r.left) / r.width) * 100 + "%",
        );
        card.style.setProperty(
          "--my",
          ((lastEv.clientY - r.top) / r.height) * 100 + "%",
        );
      });
    },
    { passive: true },
  );
}

/* Hero role rotator */
(function rotator() {
  const el = document.getElementById("role-rotator");
  if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return;
  const roles = [
    "Backend Java Engineer",
    "Business Analyst",
    "Systems Thinker",
    "API Designer",
  ];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % roles.length;
    el.style.opacity = "0";
    el.style.transform = "translateY(-5px)";
    setTimeout(() => {
      el.textContent = roles[i];
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 280);
  }, 2600);
})();

/* Tech marquee — duplicate the track for a seamless loop */
(function marquee() {
  const t = document.getElementById("marquee-track");
  if (t && !window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    t.innerHTML += t.innerHTML;
})();

/* Custom cursor (desktop only, additive — never traps input) */
(function customCursor() {
  const fine = window.matchMedia("(pointer:fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  if (!fine || reduce || !dot || !ring) return;
  document.body.classList.add("cursor-on");
  let mx = innerWidth / 2,
    my = innerHeight / 2,
    rx = mx,
    ry = my;
  addEventListener(
    "pointermove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    },
    { passive: true },
  );
  (function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  })();
  const hot = "a,button,.node,.project,.filter,.contact-link,.copy-btn";
  addEventListener("pointerover", (e) => {
    if (e.target.closest(hot)) ring.classList.add("hot");
  });
  addEventListener("pointerout", (e) => {
    if (e.target.closest(hot)) ring.classList.remove("hot");
  });
  addEventListener("pointerdown", () => ring.classList.add("down"));
  addEventListener("pointerup", () => ring.classList.remove("down"));
})();

/* Magnetic primary buttons */
(function magnetic() {
  if (
    !window.matchMedia("(pointer:fine)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  document
    .querySelectorAll(".btn-resume, .copy-btn, .mobile-resume")
    .forEach((el) => {
      el.classList.add("magnetic");
      let rect = null;
      el.addEventListener("pointerenter", () => {
        rect = el.getBoundingClientRect();
      });
      el.addEventListener("pointermove", (e) => {
        const r = rect || (rect = el.getBoundingClientRect());
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
        rect = null;
      });
    });
})();

/* ---------- Scroll to top ---------- */
const toTop = document.getElementById("to-top");
window.addEventListener(
  "scroll",
  () => {
    toTop?.classList.toggle("show", window.scrollY > 500);
  },
  { passive: true },
);
toTop?.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" }),
);

/* =============================================================
   CINEMATIC 3D UPGRADE — depth tilt, soft parallax, console status
   ============================================================= */
(function premiumDepthLayer() {
  const fine = window.matchMedia("(pointer:fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const consoleCode = document.querySelector(".holo-console code");
  if (consoleCode && !reduce) {
    const states = [
      "state.transition(<b>SHIPPED</b>)",
      "lock.acquire(<b>ORDER_ID</b>)",
      "event.emit(<b>TICKET_READY</b>)",
      "api.respond(<b>p95&lt;2s</b>)",
    ];
    let s = 0;
    setInterval(() => {
      s = (s + 1) % states.length;
      consoleCode.style.opacity = "0";
      consoleCode.style.transform = "translateY(-4px)";
      setTimeout(() => {
        consoleCode.innerHTML = states[s];
        consoleCode.style.opacity = "1";
        consoleCode.style.transform = "translateY(0)";
      }, 220);
    }, 2300);
  }

  if (!fine || reduce) return;

  const depthLights = document.querySelector(".depth-lights");
  let px = 0,
    py = 0,
    scheduled = false;
  window.addEventListener(
    "pointermove",
    (e) => {
      px = (e.clientX / innerWidth - 0.5) * 2;
      py = (e.clientY / innerHeight - 0.5) * 2;
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        if (depthLights)
          depthLights.style.transform = `translate(${px * 12}px, ${py * 10}px)`;
      });
    },
    { passive: true },
  );

  const tiltTargets = document.querySelectorAll(
    ".hero-engine, .project, .bento .skill-card, .contact-link",
  );
  tiltTargets.forEach((el) => {
    let rect = null;
    const isHero = el.classList.contains("hero-engine");
    const max = isHero ? 7 : 4.2;

    el.addEventListener("pointerenter", () => {
      rect = el.getBoundingClientRect();
    });
    el.addEventListener(
      "pointermove",
      (e) => {
        rect = rect || el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rx = (-y * max).toFixed(2);
        const ry = (x * max).toFixed(2);
        if (isHero) {
          el.style.transform = `perspective(1400px) rotateX(${(5 + Number(rx)).toFixed(2)}deg) rotateY(${(-9 + Number(ry)).toFixed(2)}deg) translateZ(0)`;
        } else {
          el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
        }
      },
      { passive: true },
    );
    el.addEventListener("pointerleave", () => {
      rect = null;
      el.style.transform = "";
    });
  });

  document.querySelectorAll(".primary-cta, .secondary-cta").forEach((el) => {
    let rect = null;
    el.addEventListener("pointerenter", () => {
      rect = el.getBoundingClientRect();
    });
    el.addEventListener(
      "pointermove",
      (e) => {
        const r = rect || (rect = el.getBoundingClientRect());
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.16}px, ${(e.clientY - r.top - r.height / 2) * 0.16}px)`;
      },
      { passive: true },
    );
    el.addEventListener("pointerleave", () => {
      rect = null;
      el.style.transform = "";
    });
  });
})();
