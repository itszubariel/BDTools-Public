const ldrtxt = document.getElementById("ldrtxt");
let dc = 0;
const di = setInterval(() => {
  dc = (dc + 1) % 4;
  ldrtxt.textContent = "Loading" + ".".repeat(dc);
}, 350);
window.addEventListener("load", () => {
  setTimeout(() => {
    const l = document.getElementById("ldr");
    l.classList.add("out");
    setTimeout(() => l.remove(), 400);
    clearInterval(di);
  }, 900);
});

function toast(msg, type = "s") {
  const box = document.getElementById("toasts");
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${msg}</span><div class="tbar"></div>`;
  box.appendChild(t);
  setTimeout(() => t.remove(), 4500);
}

function toggleTheme() {
  const h = document.documentElement;
  const t = document.getElementById("themeToggle");
  const dark = h.classList.toggle("dark");
  h.classList.toggle("light", !dark);
  localStorage.setItem("darkMode", dark ? "enabled" : "disabled");
  t.classList.toggle("on", dark);
}

// Sync toggle state on load
(function () {
  const isDark = document.documentElement.classList.contains("dark");
  document.getElementById("themeToggle").classList.toggle("on", isDark);
})();

const PANELS = [
  "skeletonGrid",
  "loadingState",
  "emptyState",
  "noServersState",
  "serversGrid",
];
function hideAll() {
  PANELS.forEach((id) => {
    document.getElementById(id).style.display = "none";
  });
}
function show(id, disp = "block") {
  document.getElementById(id).style.display = disp;
}

function getCols() {
  const w = window.innerWidth;
  if (w >= 1100) return 4;
  if (w >= 740) return 3;
  if (w >= 480) return 2;
  return 1;
}

function buildSkeletons() {
  const cols = getCols(),
    count = cols * 4;
  const body = document.getElementById("skelBody");
  body.innerHTML = Array.from(
    { length: count },
    () => `
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:1rem;height:var(--card-h);display:flex;flex-direction:column;gap:.75rem;">
          <div style="display:flex;gap:.75rem;align-items:flex-start;">
            <div class="skel" style="width:48px;height:48px;border-radius:11px;flex-shrink:0;"></div>
            <div style="flex:1;display:flex;flex-direction:column;gap:.4rem;">
              <div class="skel" style="height:13px;width:70%;"></div>
              <div class="skel" style="height:10px;width:50%;"></div>
              <div class="skel" style="height:10px;width:40%;"></div>
            </div>
          </div>
          <div style="display:flex;gap:.4rem;">
            <div class="skel" style="height:20px;width:90px;border-radius:6px;"></div>
            <div class="skel" style="height:20px;width:70px;border-radius:6px;"></div>
          </div>
          <div style="flex:1;"></div>
          <div class="skel" style="height:34px;width:100%;border-radius:9px;"></div>
        </div>`,
  ).join("");
}

let allGuilds = [],
  filteredGuilds = [],
  currentPage = 1;
const ROWS = 4; // rows per page

async function loadGuilds() {
  const key = document.getElementById("apiKeyInput").value.trim();
  if (key) localStorage.setItem("bdtools_apikey", key);
  if (!key) {
    toast("Please enter your API key first", "e");
    document.getElementById("apiKeyInput").focus();
    return;
  }
  if (!key.startsWith("BDTools-")) {
    toast("API key must start with BDTools-", "e");
    return;
  }

  hideAll();
  show("skeletonGrid");
  buildSkeletons();
  document.getElementById("guildCount").textContent = "Loading…";

  await new Promise((r) => setTimeout(r, 400));
  hideAll();
  show("loadingState", "flex");

  try {
    const res = await fetch("https://api.bdtools.xyz/get-servers", {
      method: "GET",
      headers: { Authorization: `Bearer ${key}` },
    });

    if (res.status === 401 || res.status === 403) {
      toast("Invalid API key", "e");
      hideAll();
      show("emptyState");
      return;
    }
    if (res.status === 404) {
      toast("No servers found for this key", "e");
      hideAll();
      show("noServersState");
      document.getElementById("guildCount").textContent = "0 servers";
      return;
    }
    if (!res.ok) {
      toast(`Server error (${res.status})`, "e");
      hideAll();
      show("emptyState");
      return;
    }

    const data = await res.json();
    allGuilds = data.servers || [];
    filteredGuilds = [...allGuilds];
    currentPage = 1;
    hideAll();
    renderPage();
  } catch (e) {
    console.error("Fetch error:", e);
    toast("Connection error — could not reach the server", "e");
    hideAll();
    show("emptyState");
  }
}

function memberIcon() {
  return `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
}
function onlineIcon() {
  return `<svg width="8" height="8" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#22c55e"/></svg>`;
}
function idIcon() {
  return `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 10h2M16 14h2M6 10h.01M6 14h.01M10 10h2M10 14h2"/></svg>`;
}
function ownerIcon() {
  return `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
}

function buildCard(g) {
  const members = (parseInt(g.memberCount) || 0).toLocaleString();
  const online =
    g.presenceCount != null ? parseInt(g.presenceCount).toLocaleString() : null;
  const shortId = g.id || "—";
  const ownerId = g.ownerId || null;
  const desc = (g.description || "").trim();

  const iconHtml = g.icon
    ? `<div class="card-icon"><img src="${g.icon}" alt="" onerror="this.parentElement.innerHTML='${(g.name || "?")[0].toUpperCase()}'"/></div>`
    : `<div class="card-icon">${(g.name || "?")[0].toUpperCase()}</div>`;

  const descHtml = desc
    ? `<div class="card-desc">${desc}</div>`
    : `<div class="card-desc empty">No description</div>`;

  return `
        <div class="srv-card">
          <div class="card-top">
            ${iconHtml}
            <div style="flex:1;min-width:0;">
              <div class="card-title" title="${g.name || "Unknown"}">${g.name || "Unknown"}</div>
              ${descHtml}
            </div>
          </div>

          <div class="card-meta">
            <span class="badge">${memberIcon()} ${members} members</span>
            ${online !== null ? `<span class="badge">${onlineIcon()} ${online} online</span>` : ""}
            <div style="width:100%;min-width:0;overflow:hidden;display:flex;flex-direction:column;gap:.3rem;margin-top:.1rem;">
  <span class="badge" style="font-size:.6rem;">${idIcon()} Server: ${shortId}</span>
  ${ownerId ? `<span class="badge" style="font-size:.6rem;">${ownerIcon()} Owner: ${ownerId}</span>` : ""}
</div>
          </div>

          <div class="card-spacer"></div>

          <div class="card-bottom">
            ${g.invite && g.invite !== "failed"
      ? `<a href="${g.invite}" target="_blank" rel="noopener" class="join-btn">Join Server →</a>`
      : `<span class="no-invite">No invite link</span>`
    }
          </div>
        </div>`;
}

function renderPage() {
  const cols = getCols();
  const pageSize = cols * ROWS;
  const total = filteredGuilds.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;

  if (!total) {
    show("noServersState");
    document.getElementById("guildCount").textContent = "0 servers";
    return;
  }

  show("serversGrid");
  document.getElementById("guildCount").textContent =
    total + (total === 1 ? " server" : " servers");

  const body = document.getElementById("guildGridBody");
  const slice = filteredGuilds.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  body.innerHTML = slice.map(buildCard).join("");

  document.getElementById("pgInfo").textContent =
    `Page ${currentPage} of ${totalPages}`;
  document.getElementById("prevBtn").disabled = currentPage <= 1;
  document.getElementById("nextBtn").disabled = currentPage >= totalPages;
}

function changePage(dir) {
  currentPage += dir;
  renderPage();
  document
    .getElementById("serversGrid")
    .scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function onSearch() {
  const q = document.getElementById("searchInput").value.toLowerCase();
  filteredGuilds = allGuilds.filter(
    (g) => (g.name || "").toLowerCase().includes(q) || (g.id || "").includes(q),
  );
  applySort();
  currentPage = 1;
  if (allGuilds.length) {
    hideAll();
    renderPage();
  }
}
function onSort() {
  applySort();
  currentPage = 1;
  if (allGuilds.length) {
    hideAll();
    renderPage();
  }
}
function applySort() {
  const s = document.getElementById("sortSelect").value;
  filteredGuilds.sort((a, b) => {
    if (s === "members")
      return (parseInt(b.memberCount) || 0) - (parseInt(a.memberCount) || 0);
    if (s === "id") return (a.id || "").localeCompare(b.id || "");
    return (a.name || "").localeCompare(b.name || "");
  });
}

let rt;
window.addEventListener("resize", () => {
  clearTimeout(rt);
  rt = setTimeout(() => {
    if (document.getElementById("skeletonGrid").style.display !== "none")
      buildSkeletons();
    if (allGuilds.length) renderPage();
  }, 200);
});

buildSkeletons();
const savedKey = localStorage.getItem("bdtools_apikey");
if (savedKey) document.getElementById("apiKeyInput").value = savedKey;

// Scroll fade-in observer
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  },
);

window.addEventListener("load", () => {
  const fadeElements = document.querySelectorAll(".scroll-fade");
  fadeElements.forEach((el) => observer.observe(el));
});
