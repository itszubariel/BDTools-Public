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
    toast("Welcome! scrobbler here 👋", "s");
    localStorage.setItem("visited", "true");
  }
});
/* Validators */
function isValidURL(url) {
  return /^https?:\/\/.+/.test(url);
}
function isValidHex(hex) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);
}
/* localStorage persistence */
const SEB_LS_KEY = "bdtools_sendembed_state";
const SEB_FIELD_IDS = [
  "channelID-input",
  "content-input",
  "author-input",
  "author-icon-input",
  "title-input",
  "title-url-input",
  "description-input",
  "thumbnail-input",
  "image-input",
  "color-input",
  "footer-input",
  "footer-icon-input",
  "timestamp-input",
  "messageID-input",
];
function sebSaveState() {
  try {
    const state = {};
    SEB_FIELD_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      state[id] = el.type === "checkbox" ? el.checked : el.value;
    });
    localStorage.setItem(SEB_LS_KEY, JSON.stringify(state));
  } catch (e) { }
}
function sebLoadState() {
  try {
    const raw = localStorage.getItem(SEB_LS_KEY);
    if (!raw) return;
    const state = JSON.parse(raw);
    SEB_FIELD_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el || state[id] === undefined) return;
      if (el.type === "checkbox") el.checked = state[id];
      else el.value = state[id];
    });
    updatePreview();
  } catch (e) { }
}
/* EXACT original sanitize */
function sanitizeInput(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\$/g, "%{DOL}%")
    .replace(/;/g, "\\;")
    .replace(/]/g, "\\]");
}
/* EXACT original generateEmbedCode */
function generateEmbedCode() {
  const channelID = sanitizeInput(
    document.getElementById("channelID-input").value.trim(),
  );
  const content = sanitizeInput(
    document.getElementById("content-input").value.trim(),
  );
  const title = sanitizeInput(
    document.getElementById("title-input").value.trim(),
  );
  const titleURL = sanitizeInput(
    document.getElementById("title-url-input").value.trim(),
  );
  const description = sanitizeInput(
    document.getElementById("description-input").value.trim(),
  );
  const color = sanitizeInput(
    document.getElementById("color-input").value.trim(),
  );
  const author = sanitizeInput(
    document.getElementById("author-input").value.trim(),
  );
  const authorIcon = sanitizeInput(
    document.getElementById("author-icon-input").value.trim(),
  );
  const footer = sanitizeInput(
    document.getElementById("footer-input").value.trim(),
  );
  const footerIcon = sanitizeInput(
    document.getElementById("footer-icon-input").value.trim(),
  );
  const thumbnail = sanitizeInput(
    document.getElementById("thumbnail-input").value.trim(),
  );
  const image = sanitizeInput(
    document.getElementById("image-input").value.trim(),
  );
  const ts = document.getElementById("timestamp-input")?.checked ? "yes" : "no";
  const retID = document.getElementById("messageID-input")?.checked
    ? "yes"
    : "no";
  if (!channelID) {
    toast("Channel ID is required", "e");
    return "";
  }
  if (!author && authorIcon) {
    toast("Can't have Author Icon without Author Name", "e");
    return "";
  }
  if (!title && titleURL) {
    toast("Can't have Title URL without Title", "e");
    return "";
  }
  if (!footer && footerIcon) {
    toast("Can't have Footer Icon without Footer text", "e");
    return "";
  }
  const urlFields = [
    [authorIcon, "Author Icon URL"],
    [titleURL, "Title URL"],
    [thumbnail, "Thumbnail URL"],
    [image, "Image URL"],
    [footerIcon, "Footer Icon URL"],
  ];
  for (const [val, label] of urlFields) {
    if (val && !isValidURL(val)) {
      toast(`${label}: must start with http:// or https://`, "e");
      return "";
    }
  }
  const rawColor = document.getElementById("color-input").value.trim();
  if (rawColor && !isValidHex(rawColor)) {
    toast("Colour: must be a valid hex code (e.g. #5865F2)", "e");
    return "";
  }
  return `$sendEmbedMessage[${channelID};${content};${title};${titleURL};${description};${color};${author};${authorIcon};${footer};${footerIcon};${thumbnail};${image};${ts};${retID}]`;
}
/* ── Markdown rendering helper ── */
function escHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function renderMarkdown(text) {
  if (!text) return "";
  let s = escHtml(text);
  // Subheading: -# text (Discord's smaller heading)
  s = s.replace(
    /^-# (.+)$/gm,
    '<span style="font-size:.875em;font-weight:600;color:#b5bac1;">$1</span>',
  );
  // Headings: # H1, ## H2, ### H3 (line-start)
  s = s.replace(
    /^### (.+)$/gm,
    '<span style="font-size:.85em;font-weight:700;color:#dbdee1;">$1</span>',
  );
  s = s.replace(
    /^## (.+)$/gm,
    '<span style="font-size:.95em;font-weight:700;color:#dbdee1;">$1</span>',
  );
  s = s.replace(
    /^# (.+)$/gm,
    '<span style="font-size:1.1em;font-weight:700;color:#dbdee1;">$1</span>',
  );
  // Bold+italic ***text***
  s = s.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  // Bold **text**
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic *text* or _text_
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  s = s.replace(/_(.+?)_/g, "<em>$1</em>");
  // Underline __text__
  s = s.replace(/__(.+?)__/g, "<u>$1</u>");
  // Strikethrough ~~text~~
  s = s.replace(/~~(.+?)~~/g, "<s>$1</s>");
  // Inline code `text`
  s = s.replace(
    /`([^`]+)`/g,
    '<code style="background:#2e3035;padding:.1em .3em;border-radius:3px;font-family:monospace;font-size:.875em;">$1</code>',
  );
  // Code block ```text```
  s = s.replace(
    /```([\s\S]+?)```/g,
    '<pre style="background:#2e3035;padding:.5em .75em;border-radius:4px;font-family:monospace;font-size:.8em;overflow-x:auto;margin:.25em 0;">$1</pre>',
  );
  // Block quote > text
  s = s.replace(
    /^&gt; (.+)$/gm,
    '<span style="display:inline-block;border-left:4px solid #4e5058;padding-left:.5em;">$1</span>',
  );
  // Newlines
  s = s.replace(/\n/g, "<br>");
  return s;
}
/* EXACT original updatePreview */
function updatePreview() {
  const author = document.getElementById("author-input").value.trim();
  const authorIcon = document.getElementById("author-icon-input").value.trim();
  const title = document.getElementById("title-input").value.trim();
  const titleURL = document.getElementById("title-url-input").value.trim();
  const description = document.getElementById("description-input").value.trim();
  const thumbnail = document.getElementById("thumbnail-input").value.trim();
  const image = document.getElementById("image-input").value.trim();
  const color =
    document.getElementById("color-input").value.trim() || "#ffffff";
  const footer = document.getElementById("footer-input").value.trim();
  const footerIcon = document.getElementById("footer-icon-input").value.trim();
  const ts = document.getElementById("timestamp-input")?.checked;
  const botAvatarURL =
    "https://scrobbler.netlify.app/assets/images/scrobbler_logo.png";
  const botName = "scrobbler";
  const now = new Date();
  const dateStr =
    "Today at " +
    now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  const hasContent =
    author || title || description || footer || image || thumbnail;
  document.getElementById("embed-preview").innerHTML = `
    <div class="preview-msg">
      <img src="${botAvatarURL}" class="preview-avatar" onerror="this.style.display='none'"/>
      <div class="preview-content">
        <div class="preview-meta">
          <span class="preview-name">${botName}</span>
          <span class="preview-badge">BOT</span>
          <span class="preview-time">${dateStr}</span>
        </div>
        ${hasContent
      ? `
        <div class="preview-embed">
          <div class="embed-pill" style="background:${color}"></div>
          <div class="embed-body" style="position:relative;padding-right:${thumbnail ? "88px" : ".75rem"}">
            ${author ? `<div class="embed-author">${authorIcon ? `<img src="${authorIcon}" onerror="this.style.display='none'">` : ""}${author}</div>` : ""}
            ${title ? `<div class="embed-title">${titleURL ? `<a href="${titleURL}" style="color:#00aff4;text-decoration:none">${title}</a>` : title}</div>` : ""}
            ${description ? `<div class="embed-desc">${renderMarkdown(description)}</div>` : ""}
            ${image ? `<div class="embed-image"><img src="${image}" onerror="this.style.display='none'"></div>` : ""}
            ${footer || ts ? `<div class="embed-footer">${footerIcon ? `<img src="${footerIcon}" onerror="this.style.display='none'">` : ""}${footer}${footer && ts ? " · " : ""}${ts ? dateStr : ""}</div>` : ""}
            ${thumbnail ? `<img src="${thumbnail}" class="embed-thumb" onerror="this.style.display='none'">` : ""}
          </div>
        </div>`
      : '<p style="font-size:.8rem;color:#72767d;font-style:italic">Fill in the form to see a preview…</p>'
    }
      </div>
    </div>`;
}
/* listeners */
[
  "author-input",
  "author-icon-input",
  "title-input",
  "title-url-input",
  "description-input",
  "thumbnail-input",
  "image-input",
  "color-input",
  "footer-input",
  "footer-icon-input",
  "timestamp-input",
].forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("input", () => {
    sebSaveState();
    updatePreview();
  });
  if (el.type === "checkbox")
    el.addEventListener("change", () => {
      sebSaveState();
      updatePreview();
    });
});
document.getElementById("replace-btn").addEventListener("click", () => {
  const code = generateEmbedCode();
  if (code) {
    document.getElementById("output-text").value = code;
    toast("Code generated", "s");
    updatePreview();
  }
});
// Also save on channelID and content changes (not in preview listener list)
["channelID-input", "content-input"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", sebSaveState);
});
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
/* ── Preset Management ── */
const PRESETS_KEY = "bdtools_sendembed_presets";
function getPresets() {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function savePresets(presets) {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch (e) {
    toast("Failed to save presets", "e");
  }
}
function esc(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
document.getElementById("save-preset").addEventListener("click", () => {
  document.getElementById("preset-name-input").value = "";
  document.getElementById("save-preset-modal").style.display = "flex";
});
document
  .getElementById("close-save-preset-modal")
  .addEventListener("click", () => {
    document.getElementById("save-preset-modal").style.display = "none";
  });
document.getElementById("cancel-save-preset").addEventListener("click", () => {
  document.getElementById("save-preset-modal").style.display = "none";
});
// Close save preset modal on backdrop click
document.getElementById("save-preset-modal").addEventListener("click", (e) => {
  if (e.target.id === "save-preset-modal") {
    document.getElementById("save-preset-modal").style.display = "none";
  }
});
document.getElementById("confirm-save-preset").addEventListener("click", () => {
  const name = document.getElementById("preset-name-input").value;
  if (!name || !name.trim()) {
    toast("Preset name required", "e");
    return;
  }
  const presets = getPresets();
  // Collect current state
  const state = {};
  SEB_FIELD_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    state[id] = el.type === "checkbox" ? el.checked : el.value;
  });
  const preset = {
    id: Date.now(),
    name: name.trim(),
    date: new Date().toISOString(),
    data: state,
  };
  presets.push(preset);
  savePresets(presets);
  document.getElementById("save-preset-modal").style.display = "none";
  toast(`Preset "${name}" saved!`, "s");
});
document.getElementById("load-preset").addEventListener("click", () => {
  const presets = getPresets();
  if (presets.length === 0) {
    document.getElementById("no-presets").style.display = "block";
  } else {
    document.getElementById("no-presets").style.display = "none";
    renderPresetList(presets);
  }
  document.getElementById("preset-modal").style.display = "flex";
});
document.getElementById("close-preset-modal").addEventListener("click", () => {
  document.getElementById("preset-modal").style.display = "none";
});
// Close modal on backdrop click
document.getElementById("preset-modal").addEventListener("click", (e) => {
  if (e.target.id === "preset-modal") {
    document.getElementById("preset-modal").style.display = "none";
  }
});
function renderPresetList(presets) {
  const list = document.getElementById("preset-list");
  list.innerHTML = "";
  presets
    .sort((a, b) => b.id - a.id)
    .forEach((preset) => {
      const date = new Date(preset.date);
      const dateStr =
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      // Count how many fields are filled
      const fieldCount = Object.values(preset.data).filter(
        (v) => v && v !== false,
      ).length;
      const item = document.createElement("div");
      item.style.cssText =
        "background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:0.75rem;display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-bottom:0.5rem;";
      item.innerHTML = `
            <div style="flex:1;min-width:0;">
              <div style="font-size:0.875rem;font-weight:600;color:var(--text);margin-bottom:0.25rem;">${esc(preset.name)}</div>
              <div style="font-size:0.7rem;color:var(--text3);">${dateStr} • ${fieldCount} field${fieldCount !== 1 ? "s" : ""} filled</div>
            </div>
            <div style="display:flex;gap:0.25rem;">
              <button class="btn btn-ghost" data-load="${preset.id}" style="padding:0.3rem 0.625rem;font-size:0.75rem;">Load</button>
              <button class="icon-btn" data-delete="${preset.id}" style="color:#f87171;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                </svg>
              </button>
            </div>
          `;
      item
        .querySelector(`[data-load="${preset.id}"]`)
        .addEventListener("click", () => {
          // Check if there's current work
          const hasWork = SEB_FIELD_IDS.some((id) => {
            const el = document.getElementById(id);
            if (!el) return false;
            return el.type === "checkbox" ? el.checked : el.value.trim() !== "";
          });
          if (hasWork) {
            if (
              !confirm(
                "Loading this preset will replace your current work. Continue?",
              )
            ) {
              return;
            }
          }
          // Load preset data
          SEB_FIELD_IDS.forEach((id) => {
            const el = document.getElementById(id);
            if (!el || preset.data[id] === undefined) return;
            if (el.type === "checkbox") el.checked = preset.data[id];
            else el.value = preset.data[id];
          });
          sebSaveState();
          updatePreview();
          document.getElementById("preset-modal").style.display = "none";
          toast(`Preset "${preset.name}" loaded!`, "s");
        });
      item
        .querySelector(`[data-delete="${preset.id}"]`)
        .addEventListener("click", () => {
          if (!confirm(`Delete preset "${preset.name}"?`)) {
            return;
          }
          const presets = getPresets();
          const filtered = presets.filter((p) => p.id !== preset.id);
          savePresets(filtered);
          if (filtered.length === 0) {
            document.getElementById("no-presets").style.display = "block";
            list.innerHTML = "";
          } else {
            renderPresetList(filtered);
          }
          toast(`Preset "${preset.name}" deleted`, "s");
        });
      list.appendChild(item);
    });
}
document.getElementById("clear-input").addEventListener("click", () => {
  [
    "channelID-input",
    "content-input",
    "author-input",
    "author-icon-input",
    "title-input",
    "title-url-input",
    "description-input",
    "thumbnail-input",
    "image-input",
    "color-input",
    "footer-input",
    "footer-icon-input",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  ["timestamp-input", "messageID-input"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });
  document.getElementById("output-text").value = "";
  localStorage.removeItem(SEB_LS_KEY);
  toast("Cleared", "s");
  updatePreview();
});
sebLoadState();
updatePreview();
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
