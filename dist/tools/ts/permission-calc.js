// Loader
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
// Toast
function toast(msg, type = "s") {
  const box = document.getElementById("toasts");
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${msg}</span><div class="tbar"></div>`;
  box.appendChild(t);
  setTimeout(() => t.remove(), 4500);
}
// Theme toggle — fixed: correct id + adds light class
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
window.addEventListener("load", () => {
  if (!localStorage.getItem("visited")) {
    toast("Welcome! 👋", "s");
    localStorage.setItem("visited", "true");
  }
});
// Permission data
const GROUPS = [
  {
    label: "General Server Permissions",
    perms: [
      { name: "Manage Server", value: 32n },
      { name: "View Audit Log", value: 128n },
      { name: "View Server Insights", value: 524288n },
      { name: "Administrator", value: 8n },
    ],
  },
  {
    label: "Member Management",
    perms: [
      { name: "Kick Members", value: 2n },
      { name: "Ban Members", value: 4n },
      { name: "Manage Nicknames", value: 134217728n },
      { name: "Change Nickname", value: 67108864n },
    ],
  },
  {
    label: "Channel Management",
    perms: [
      { name: "Manage Channels", value: 16n },
      { name: "Manage Roles", value: 268435456n },
      { name: "Manage Webhooks", value: 536870912n },
      { name: "View Channels", value: 1024n },
    ],
  },
  {
    label: "Text Permissions",
    perms: [
      { name: "Send Messages", value: 2048n },
      { name: "Send Messages in Threads", value: 274877906944n },
      { name: "Create Public Threads", value: 34359738368n },
      { name: "Create Private Threads", value: 68719476736n },
      { name: "Embed Links", value: 16384n },
      { name: "Attach Files", value: 32768n },
      { name: "Add Reactions", value: 64n },
      { name: "Use External Emoji", value: 262144n },
      { name: "Use External Stickers", value: 137438953472n },
      { name: "Mention @everyone, @here, All Roles", value: 131072n },
      { name: "Manage Messages", value: 8192n },
      { name: "Manage Threads", value: 17179869184n },
      { name: "Read Message History", value: 65536n },
      { name: "Send Text-to-Speech Messages", value: 4096n },
      { name: "Use Application Commands", value: 2147483648n },
    ],
  },
  {
    label: "Voice Permissions",
    perms: [
      { name: "Connect", value: 1048576n },
      { name: "Speak", value: 2097152n },
      { name: "Video", value: 512n },
      { name: "Start Activities", value: 549755813888n },
      { name: "Use Voice Activity", value: 33554432n },
      { name: "Priority Speaker", value: 256n },
      { name: "Mute Members", value: 4194304n },
      { name: "Deafen Members", value: 8388608n },
      { name: "Move Members", value: 16777216n },
      { name: "Request to Speak", value: 4294967296n },
    ],
  },
  {
    label: "Other Permissions",
    perms: [
      { name: "Manage Emojis and Stickers", value: 1073741824n },
      { name: "Manage Events", value: 8589934592n },
      { name: "Create Invite", value: 1n },
    ],
  },
];
const VAL_TO_NAME = {};
GROUPS.forEach((g) =>
  g.perms.forEach((p) => (VAL_TO_NAME[p.value.toString()] = p.name)),
);
let bits = 0n;
function buildSections() {
  const container = document.getElementById("sections");
  GROUPS.forEach((group, gi) => {
    const wrap = document.createElement("div");
    wrap.style.cssText =
      "background:var(--bg2);border:1px solid var(--border);border-radius:16px;overflow:hidden;";
    wrap.dataset.gi = gi;
    const hdr = document.createElement("div");
    hdr.style.cssText =
      "display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:1px solid var(--border);cursor:pointer;user-select:none;transition:background 0.1s;";
    hdr.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:0.875rem;font-weight:600;color:var(--text);">${group.label}</span>
              <span style="font-size:10px;font-family:var(--mono);padding:2px 6px;border-radius:8px;background:var(--bg);border:1px solid var(--border2);color:var(--text3);" class="section-badge" data-gi="${gi}">0/${group.perms.length}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <button data-enable="1" style="font-size:11px;padding:2px 8px;border-radius:8px;background:var(--bg);border:1px solid var(--border2);color:var(--text3);cursor:pointer;transition:background 0.1s;" class="sect-btn">All</button>
              <button data-enable="0" style="font-size:11px;padding:2px 8px;border-radius:8px;background:var(--bg);border:1px solid var(--border2);color:var(--text3);cursor:pointer;transition:background 0.1s;" class="sect-btn">None</button>
              <svg class="section-chevron" style="width:16px;height:16px;color:var(--text3);transition:transform 0.2s;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </div>`;
    const body = document.createElement("div");
    body.style.cssText = "display:grid;grid-template-columns:repeat(2,1fr);";
    body.dataset.gi = gi;
    group.perms.forEach((perm) => {
      const row = document.createElement("label");
      row.className = "perm-row";
      row.style.cssText =
        "display:flex;align-items:center;gap:12px;padding:12px 20px;cursor:pointer;border-bottom:1px solid var(--border3);";
      row.dataset.name = perm.name.toLowerCase();
      row.dataset.gi = gi;
      row.innerHTML = `
              <input type="checkbox" class="perm-cb" data-val="${perm.value}" data-gi="${gi}"/>
              <div style="flex:1;min-width:0;">
                <div style="font-size:0.875rem;color:var(--text);">${perm.name}</div>
                <div style="font-size:11px;font-family:var(--mono);color:var(--text3);margin-top:2px;">${perm.value}</div>
              </div>`;
      body.appendChild(row);
    });
    hdr.addEventListener(
      "mouseover",
      () => (hdr.style.background = "var(--bg4)"),
    );
    hdr.addEventListener("mouseout", () => (hdr.style.background = ""));
    hdr.addEventListener("click", (e) => {
      if (e.target.closest(".sect-btn")) return;
      const hidden = body.style.display === "none";
      body.style.display = hidden ? "grid" : "none";
      hdr.querySelector(".section-chevron").style.transform = hidden
        ? "rotate(180deg)"
        : "";
    });
    hdr.querySelectorAll(".sect-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        body
          .querySelectorAll(".perm-cb")
          .forEach((cb) => (cb.checked = btn.dataset.enable === "1"));
        recalc();
      });
    });
    body.addEventListener("change", () => recalc());
    wrap.appendChild(hdr);
    wrap.appendChild(body);
    container.appendChild(wrap);
  });
}
function recalc() {
  bits = 0n;
  document.querySelectorAll(".perm-cb:checked").forEach((cb) => {
    bits |= BigInt(cb.dataset.val);
  });
  document.getElementById("decVal").textContent = bits.toString();
  document.getElementById("hexVal").textContent =
    "0x" + bits.toString(16).toUpperCase();
  GROUPS.forEach((group, gi) => {
    const cbs = [...document.querySelectorAll(`.perm-cb[data-gi="${gi}"]`)];
    const checked = cbs.filter((c) => c.checked).length;
    const badge = document.querySelector(`.section-badge[data-gi="${gi}"]`);
    if (!badge) return;
    badge.textContent = `${checked}/${group.perms.length}`;
    if (checked > 0) {
      badge.style.background = "rgba(88,101,242,0.1)";
      badge.style.borderColor = "rgba(88,101,242,0.2)";
      badge.style.color = "#818cf8";
    } else {
      badge.style.background = "var(--bg)";
      badge.style.borderColor = "var(--border2)";
      badge.style.color = "var(--text3)";
    }
  });
  const checked = [...document.querySelectorAll(".perm-cb:checked")];
  document.getElementById("activeCount").textContent = checked.length;
  const list = document.getElementById("activeList");
  list.innerHTML =
    checked.length === 0
      ? '<p style="font-size:0.75rem;color:var(--text3);font-style:italic;">No permissions selected.</p>'
      : checked
        .map(
          (
            cb,
          ) => `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--bg);border-radius:8px;padding:6px 12px;border:1px solid var(--border);">
                <span style="font-size:0.75rem;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${VAL_TO_NAME[cb.dataset.val] ?? "?"}</span>
                <span style="font-size:10px;font-family:var(--mono);color:var(--text3);flex-shrink:0;">${cb.dataset.val}</span>
              </div>`,
        )
        .join("");
}
function enableAll() {
  document.querySelectorAll(".perm-cb").forEach((cb) => (cb.checked = true));
  recalc();
}
function disableAll() {
  document.querySelectorAll(".perm-cb").forEach((cb) => (cb.checked = false));
  recalc();
}
function filterPerms(q) {
  q = q.trim().toLowerCase();
  document.querySelectorAll(".perm-row").forEach((row) => {
    row.style.display = !q || row.dataset.name.includes(q) ? "" : "none";
  });
  document.querySelectorAll("#sections>div").forEach((sec) => {
    const any = [...sec.querySelectorAll(".perm-row")].some(
      (r) => r.style.display !== "none",
    );
    sec.style.display = any ? "" : "none";
  });
}
function parseManual() {
  const raw = document.getElementById("manualIn").value.trim();
  if (!raw) return;
  let v;
  try {
    v = BigInt(raw);
  } catch {
    return;
  }
  document.querySelectorAll(".perm-cb").forEach((cb) => {
    const pv = BigInt(cb.dataset.val);
    cb.checked = pv !== 0n && (v & pv) === pv;
  });
  recalc();
}
function copyEl(id) {
  const text = document.getElementById(id).textContent.trim();
  navigator.clipboard.writeText(text).then(() => toast("Copied!"));
}
function copyInvite() {
  const id = document.getElementById("clientId").value.trim();
  if (!id) {
    toast("Enter a Client ID first!", "e");
    return;
  }
  const url = `https://discord.com/api/oauth2/authorize?client_id=${id}&permissions=${bits.toString()}&scope=bot`;
  navigator.clipboard.writeText(url).then(() => toast("Invite link copied!"));
}
buildSections();
recalc();
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
