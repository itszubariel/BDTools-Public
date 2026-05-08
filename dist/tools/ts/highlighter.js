/* ── loader ── */
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
  t.style.position = "relative";
  t.style.overflow = "hidden";
  t.innerHTML = `<span>${msg}</span><div class="tbar"></div>`;
  box.appendChild(t);
  setTimeout(() => t.remove(), 4500);
}
function toggleTheme() {
  const h = document.documentElement;
  const t = document.getElementById("tog");
  const dark = h.classList.toggle("dark");
  h.classList.toggle("light", !dark); // ← add this line
  localStorage.setItem("darkMode", dark ? "enabled" : "disabled");
  t.classList.toggle("on", dark);
}
(function () {
  document
    .getElementById("tog")
    .classList.toggle(
      "on",
      document.documentElement.classList.contains("dark"),
    );
})();
window.addEventListener("load", () => {
  if (!localStorage.getItem("visited")) {
    toast("Welcome! Auora here 👋", "s");
    localStorage.setItem("visited", "true");
  }
});
/* ── Data ── */
const baseItems = [
  { name: "Default Text", color: "#e4e4e7", style: 0 },
  { name: "Fallback", color: "#cbcbdf", style: 0 },
  { name: "Numbers", color: "#cbcbdf", style: 0 },
  { name: "[][]", color: "#ff006e", style: 1 },
  { name: ";;;", color: "#ff4500", style: 1 },
  { name: "$nomention", color: "#8b5cf6", style: 0 },
  { name: "$catch", color: "#8b5cf6", style: 0 },
  { name: "$else", color: "#8b5cf6", style: 0 },
  { name: "$elseif", color: "#8b5cf6", style: 0 },
  { name: "$endif", color: "#8b5cf6", style: 0 },
  { name: "$error", color: "#8b5cf6", style: 0 },
  { name: "$if", color: "#8b5cf6", style: 0 },
];
let allFns = [];
async function loadFunctions() {
  try {
    const res = await fetch("https://api.bdtools.xyz/bdfd-functions");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allFns = data
      .map((fn) => {
        const tag = fn.tag || "";
        return tag.includes("[") ? tag.split("[")[0] + "[]" : tag;
      })
      .filter(Boolean)
      .sort();
    console.log(
      `[highlighter] ✅ Loaded ${allFns.length} functions from BDFD API`,
    );
  } catch (err) {
    console.error(
      "[highlighter] ❌ Failed to load functions from BDFD API:",
      err.message,
    );
    toast("Could not load function list — using cached fallback", "e");
    // fallback to a small set so the tool still works
    allFns = [
      "$nomention",
      "$catch",
      "$else",
      "$elseif",
      "$endif",
      "$error",
      "$if",
    ];
  }
}
const saved = localStorage.getItem("savedTheme");
const theme = {};
if (saved) {
  Object.assign(theme, JSON.parse(saved));
} else {
  baseItems.forEach(
    (i) => (theme[i.name] = { color: i.color, style: i.style }),
  );
}
const listEl = document.getElementById("functions-list");
let currentFn = null,
  fnToDelete = null,
  tempStyle = 0;
/* ── Render cards ── */
function renderList() {
  listEl.innerHTML = "";
  Object.keys(theme).forEach((fn, idx) => {
    const card = document.createElement("div");
    card.className = "fn-card";
    const dot = document.createElement("div");
    dot.className = "fn-dot";
    dot.style.background = theme[fn].color;
    const name = document.createElement("span");
    name.className = "fn-name";
    name.title = fn;
    name.textContent = fn;
    const actions = document.createElement("div");
    actions.className = "fn-actions";
    const editBtn = document.createElement("button");
    editBtn.className = "icon-btn";
    editBtn.dataset.fn = fn;
    editBtn.innerHTML =
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
    editBtn.addEventListener("click", () => openEdit(fn));
    actions.appendChild(editBtn);
    if (idx >= 5) {
      const delBtn = document.createElement("button");
      delBtn.className = "icon-btn";
      delBtn.dataset.fn = fn;
      delBtn.style.color = "#f87171";
      delBtn.innerHTML =
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>';
      delBtn.addEventListener("click", () => {
        fnToDelete = fn;
        document.getElementById("delete-modal").classList.add("open");
      });
      actions.appendChild(delBtn);
    }
    card.append(dot, name, actions);
    listEl.appendChild(card);
  });
}
/* ── Pickr ── */
const pickr = Pickr.create({
  el: "#color-picker",
  theme: "classic",
  default: "#8b5cf6",
  components: {
    preview: true,
    opacity: false,
    hue: true,
    interaction: { hex: true, input: true, save: false },
  },
});
pickr.on("change", (color) => {
  const hex = color.toHEXA().toString();
  document.getElementById("hex-input").value = hex;
  if (currentFn) {
    theme[currentFn].color = hex;
    updatePreview();
  }
});
document.getElementById("hex-input").addEventListener("input", (e) => {
  if (!currentFn) return;
  let val = e.target.value.toUpperCase().trim();
  if (!val.startsWith("#")) val = "#" + val;
  if (val.length > 7) val = val.slice(0, 7);
  if (/^#[0-9A-F]{6}$/i.test(val)) {
    theme[currentFn].color = val;
    pickr.setColor(val);
    updatePreview();
  }
});
/* ── Edit modal ── */
function openEdit(fn) {
  currentFn = fn;
  tempStyle = theme[fn]?.style || 0;
  pickr.setColor(theme[fn]?.color || "#8b5cf6");
  document.getElementById("hex-input").value = theme[fn]?.color || "#8b5cf6";
  updateStyleBtns();
  updatePreview();
  document.getElementById("edit-modal").classList.add("open");
}
function updatePreview() {
  const p = document.getElementById("preview");
  p.style.color = theme[currentFn]?.color || "#fff";
  p.style.fontWeight = tempStyle === 1 || tempStyle === 3 ? "bold" : "normal";
  p.style.fontStyle = tempStyle === 2 || tempStyle === 3 ? "italic" : "normal";
}
function updateStyleBtns() {
  document
    .querySelectorAll(".style-btn")
    .forEach((b) =>
      b.classList.toggle("active", parseInt(b.dataset.style) === tempStyle),
    );
}
document.querySelectorAll(".style-btn").forEach((b) =>
  b.addEventListener("click", () => {
    if (!currentFn) return;
    tempStyle = parseInt(b.dataset.style);
    updateStyleBtns();
    updatePreview();
  }),
);
document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("edit-modal").classList.remove("open");
  currentFn = null;
});
document.getElementById("edit-modal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("edit-modal")) {
    document.getElementById("edit-modal").classList.remove("open");
    currentFn = null;
  }
});
document.getElementById("save-settings").addEventListener("click", () => {
  if (!currentFn) return;
  theme[currentFn].style = tempStyle;
  localStorage.setItem("savedTheme", JSON.stringify(theme));
  renderList();
  document.getElementById("edit-modal").classList.remove("open");
  toast(`"${currentFn}" updated`, "s");
  currentFn = null;
  tempStyle = 0;
});
/* ── Delete ── */
document.getElementById("cancel-delete").addEventListener("click", () => {
  document.getElementById("delete-modal").classList.remove("open");
  fnToDelete = null;
});
document.getElementById("confirm-delete").addEventListener("click", () => {
  if (fnToDelete) {
    delete theme[fnToDelete];
    renderList();
    toast(`"${fnToDelete}" removed`, "s");
    fnToDelete = null;
  }
  document.getElementById("delete-modal").classList.remove("open");
});
document
  .getElementById("delete-all")
  .addEventListener("click", () =>
    document.getElementById("delete-all-modal").classList.add("open"),
  );
document
  .getElementById("cancel-delete-all")
  .addEventListener("click", () =>
    document.getElementById("delete-all-modal").classList.remove("open"),
  );
document.getElementById("confirm-delete-all").addEventListener("click", () => {
  localStorage.removeItem("savedTheme");
  Object.keys(theme).forEach((k) => delete theme[k]);
  baseItems.forEach(
    (i) => (theme[i.name] = { color: i.color, style: i.style }),
  );
  renderList();
  document.getElementById("delete-all-modal").classList.remove("open");
  toast("Theme reset to defaults", "s");
});
/* ── Add function ── */
const addOverlay = document.getElementById("add-function-overlay");
const fnSearch = document.getElementById("function-search");
const fnList = document.getElementById("function-list");
document
  .getElementById("add-function-btn")
  .addEventListener("click", async () => {
    if (allFns.length === 0) {
      await loadFunctions();
    }
    fnSearch.value = "";
    renderFnSearch();
    addOverlay.classList.add("open");
    fnSearch.focus();
  });
document
  .getElementById("cancel-add-function")
  .addEventListener("click", () => addOverlay.classList.remove("open"));
function renderFnSearch() {
  fnList.innerHTML = "";
  const q = fnSearch.value.toLowerCase();
  allFns
    .filter((fn) => fn.toLowerCase().includes(q))
    .forEach((fn) => {
      const clean = fn.replace(/\[\]$/, "");
      if (theme[clean]) return;
      const li = document.createElement("li");
      li.textContent = fn;
      li.addEventListener("click", () => {
        theme[clean] = { color: "#8b5cf6", style: 0 };
        renderList();
        localStorage.setItem("savedTheme", JSON.stringify(theme));
        addOverlay.classList.remove("open");
        toast(`"${fn}" added`, "s");
      });
      fnList.appendChild(li);
    });
}
fnSearch.addEventListener("input", renderFnSearch);
/* ── Import ── */
function uint32ToHex(u) {
  const r = (u >> 16) & 0xff,
    g = (u >> 8) & 0xff,
    b = u & 0xff;
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
document.getElementById("import-theme-btn").addEventListener("click", () => {
  document.getElementById("import-overlay").classList.add("open");
});
document
  .getElementById("cancel-import-btn")
  .addEventListener("click", () =>
    document.getElementById("import-overlay").classList.remove("open"),
  );
document
  .getElementById("cancel-import-btn2")
  .addEventListener("click", () =>
    document.getElementById("import-overlay").classList.remove("open"),
  );
document.getElementById("apply-import-btn").addEventListener("click", () => {
  const text = document.getElementById("import-theme-textarea").value.trim();
  const errEl = document.getElementById("import-error-msg");
  if (!text) {
    errEl.textContent = "Please paste a JSON theme.";
    errEl.style.display = "block";
    return;
  }
  let imp;
  try {
    imp = JSON.parse(text);
  } catch {
    errEl.textContent = "Invalid JSON.";
    errEl.style.display = "block";
    return;
  }
  const keyMap = {
    defaultTextHighlight: "Default Text",
    fallbackHighlight: "Fallback",
    numberHighlight: "Numbers",
    bracketHighlight: "[][]",
    semicolonHighlight: ";;;",
  };
  Object.keys(theme).forEach((k) => delete theme[k]);
  for (const [k, v] of Object.entries(imp)) {
    if (k === "functionsHighlights") continue;
    if (keyMap[k] && v && typeof v.color === "number")
      theme[keyMap[k]] = {
        color: uint32ToHex(v.color),
        style: v.style || 0,
      };
  }
  if (imp.functionsHighlights) {
    for (const [fn, v] of Object.entries(imp.functionsHighlights)) {
      if (v && typeof v.color === "number")
        theme[fn] = {
          color: uint32ToHex(v.color),
          style: v.style || 0,
        };
    }
  }
  renderList();
  localStorage.setItem("savedTheme", JSON.stringify(theme));
  toast("Theme imported", "s");
  document.getElementById("import-overlay").classList.remove("open");
});
/* ── Generate JSON ── */
function hexToUInt32(hex) {
  return parseInt(hex.replace("#", "0xFF"), 16) >>> 0;
}
document.getElementById("generate-code-btn").addEventListener("click", () => {
  const baseKeys = [
    "defaultTextHighlight",
    "fallbackHighlight",
    "numberHighlight",
    "bracketHighlight",
    "semicolonHighlight",
  ];
  const out = {};
  for (let i = 0; i < 5; i++) {
    const n = baseItems[i].name;
    if (theme[n])
      out[baseKeys[i]] = {
        color: hexToUInt32(theme[n].color),
        style: theme[n].style,
      };
  }
  const fh = {};
  Object.keys(theme).forEach((fn) => {
    if (fn === ";;;") return;
    if (!baseItems.slice(0, 4).some((i) => i.name === fn))
      fh[fn] = {
        color: hexToUInt32(theme[fn].color),
        style: theme[fn].style,
      };
  });
  out.functionsHighlights = fh;
  document.getElementById("output-text").value = JSON.stringify(out, null, 2);
  toast("JSON generated", "s");
});
/* ── Copy ── */
document.getElementById("copy-output").addEventListener("click", () => {
  const v = document.getElementById("output-text").value;
  if (!v) {
    toast("Nothing to copy", "e");
    return;
  }
  navigator.clipboard
    .writeText(v)
    .then(() => toast("Copied", "s"))
    .catch(() => toast("Copy failed", "e"));
});
loadFunctions();
renderList();
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
