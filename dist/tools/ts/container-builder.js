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
  h.classList.toggle("light", !dark);
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
let components = [];
let uidCounter = 0;
function uid() {
  return "c" + ++uidCounter;
}
// ── localStorage persistence ──
const LS_KEY = "bdtools_compv2_state";
function saveState() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ uidCounter, components }));
  } catch (e) { }
}
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.components)) {
      components = parsed.components;
      uidCounter = parsed.uidCounter || 0;
    }
  } catch (e) { }
}
function getContainerIds() {
  return components
    .filter((c) => c.type === "container")
    .map((c) => c.fields.id || "")
    .filter((id) => id);
}
function getSectionNames() {
  return components
    .filter((c) => c.type === "section")
    .map((c) => c.fields.name || "")
    .filter((n) => n);
}
function getGalleryIds() {
  return components
    .filter((c) => c.type === "mediagallery")
    .map((c) => c.fields.galleryId || "")
    .filter((n) => n);
}
function getActionRowIds() {
  return components
    .filter((c) => c.type === "actionrow")
    .map((c) => c.fields.rowId || "")
    .filter((n) => n);
}
// Build a plain <select> with optgroups
function buildSelect(field, current, groups) {
  // groups: [{label, items:[{value,display}]}]
  let opts = `<option value="">None</option>`;
  groups.forEach((g) => {
    if (!g.items.length) return;
    opts += `<optgroup label="${esc(g.label)}">`;
    g.items.forEach((item) => {
      opts += `<option value="${esc(item.value)}" ${current === item.value ? "selected" : ""}>${esc(item.display)}</option>`;
    });
    opts += `</optgroup>`;
  });
  return `<select class="finput" data-field="${field}">${opts}</select>`;
}
function buildRequiredSelect(field, current, groups, placeholder) {
  // required — no "none" option, just a placeholder
  let opts = `<option value="">${esc(placeholder || "— select —")}</option>`;
  groups.forEach((g) => {
    if (!g.items.length) return;
    opts += `<optgroup label="${esc(g.label)}">`;
    g.items.forEach((item) => {
      opts += `<option value="${esc(item.value)}" ${current === item.value ? "selected" : ""}>${esc(item.display)}</option>`;
    });
    opts += `</optgroup>`;
  });
  return `<select class="finput" data-field="${field}">${opts}</select>`;
}
function syncAllFields() {
  document.querySelectorAll("#components-root .comp-block").forEach((block) => {
    const comp = components.find((c) => c.uid === block.dataset.uid);
    if (!comp) return;
    block.querySelectorAll("[data-field]").forEach((el) => {
      comp.fields[el.dataset.field] =
        el.type === "checkbox" ? el.checked : el.value;
    });
    block.querySelectorAll("[data-f]").forEach((el) => {
      comp.fields[el.dataset.f] =
        el.type === "checkbox" ? el.checked : el.value;
    });
    // Sync string select options
    if (comp.type === "stringselect") {
      const options = [];
      block.querySelectorAll(".stringselect-option").forEach((opt) => {
        const data = {};
        opt.querySelectorAll("[data-optfield]").forEach((el) => {
          data[el.dataset.optfield] =
            el.type === "checkbox" ? el.checked : el.value;
        });
        options.push(data);
      });
      comp.options = options;
    }
  });
}
function renderBuilder() {
  const root = document.getElementById("components-root");
  root.innerHTML = "";
  components.forEach((comp, idx) => {
    const el = buildCompBlock(comp, idx);
    root.appendChild(el);
  });
  saveState();
  updatePreview();
}
function buildCompBlock(comp, idx) {
  const d = document.createElement("div");
  d.className = "comp-block";
  d.dataset.uid = comp.uid;
  const containerIds = getContainerIds();
  const sectionNames = getSectionNames();
  const galleryIds = getGalleryIds();
  const actionRowIds = getActionRowIds();
  // Calculate type-specific number (position within components of same type)
  const typeSpecificNum = components.filter(
    (c, i) => c.type === comp.type && i <= idx,
  ).length;
  const num = typeSpecificNum;
  const chevronStyle = comp.collapsed
    ? "transform:rotate(180deg);transition:transform .2s;"
    : "transition:transform .2s;";
  const collapseBtn = `<button class="icon-btn" data-collapse title="Collapse" style="color:var(--text3)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="${chevronStyle}"><polyline points="6 9 12 15 18 9"/></svg></button>`;
  const numBadge = `<span style="font-size:.6rem;font-family:var(--mono);color:var(--text3);font-weight:600;">#${num}</span>`;
  const bodyStyle = comp.collapsed ? 'style="display:none"' : "";
  let bodyHtml = "";
  if (comp.type === "container") {
    const header = `<div class="comp-actions"><div style="display:flex;align-items:center;gap:.5rem;"><span class="drag-handle" title="Drag to reorder">⠿</span><span class="type-badge container">Container</span>${numBadge}</div><div style="display:flex;gap:.25rem;">${collapseBtn}<button class="icon-btn" data-remove style="color:#f87171;">✕</button></div></div>`;
    bodyHtml = `<div class="g3" style="margin-top:.625rem;"><div><label class="slabel">Name (required)</label><input class="finput" data-field="id" placeholder="e.g. main" value="${esc(comp.fields.id)}"/></div><div><label class="slabel">Color (hex, vacantable)</label><input class="finput" data-field="color" placeholder="#673ab7" value="${esc(comp.fields.color)}"/></div><div style="display:flex;align-items:flex-end;padding-bottom:.1rem;"><label class="chk"><input type="checkbox" data-field="spoiler" ${comp.fields.spoiler ? "checked" : ""}/><span>Spoiler</span></label></div></div>`;
    d.innerHTML =
      header + `<div class="comp-body" ${bodyStyle}>${bodyHtml}</div>`;
  } else if (comp.type === "textdisplay") {
    const tdGroups = [
      {
        label: "Containers",
        items: containerIds.map((id) => ({ value: id, display: id })),
      },
      {
        label: "Sections",
        items: sectionNames.map((n) => ({ value: n, display: n })),
      },
    ];
    const tdHeader = `<div class="comp-actions"><div style="display:flex;align-items:center;gap:.5rem;"><span class="drag-handle">⠿</span><span class="type-badge textdisplay">Text Display</span>${numBadge}</div><div style="display:flex;gap:.25rem;">${collapseBtn}<button class="icon-btn" data-remove style="color:#f87171;">✕</button></div></div>`;
    bodyHtml = `<div style="margin-top:.625rem;"><label class="slabel">Content (required)</label><textarea class="finput" data-field="content" rows="3" placeholder="Enter text content…">${esc(comp.fields.content)}</textarea></div><div style="margin-top:.5rem;"><label class="slabel">Container / Section</label>${buildSelect("container", comp.fields.container, tdGroups)}</div>`;
    d.innerHTML =
      tdHeader + `<div class="comp-body" ${bodyStyle}>${bodyHtml}</div>`;
  } else if (comp.type === "separator") {
    const sepGroups = [
      {
        label: "Containers",
        items: containerIds.map((id) => ({ value: id, display: id })),
      },
    ];
    const sepHeader = `<div class="comp-actions"><div style="display:flex;align-items:center;gap:.5rem;"><span class="drag-handle">⠿</span><span class="type-badge separator">Separator</span>${numBadge}</div><div style="display:flex;gap:.25rem;">${collapseBtn}<button class="icon-btn" data-remove style="color:#f87171;">✕</button></div></div>`;
    bodyHtml = `<div class="g3" style="margin-top:.625rem;"><div style="display:flex;align-items:flex-end;padding-bottom:.1rem;"><label class="chk"><input type="checkbox" data-field="divider" ${comp.fields.divider !== false ? "checked" : ""}/><span>Show divider line</span></label></div><div><label class="slabel">Spacing</label><select class="finput" data-field="spacing"><option value="" ${!comp.fields.spacing ? "selected" : ""}>Default (small)</option><option value="small" ${comp.fields.spacing === "small" ? "selected" : ""}>Small</option><option value="large" ${comp.fields.spacing === "large" ? "selected" : ""}>Large</option></select></div><div><label class="slabel">Container</label>${buildSelect("container", comp.fields.container, sepGroups)}</div></div>`;
    d.innerHTML =
      sepHeader + `<div class="comp-body" ${bodyStyle}>${bodyHtml}</div>`;
  } else if (comp.type === "section") {
    const secGroups = [
      {
        label: "Containers",
        items: containerIds.map((id) => ({ value: id, display: id })),
      },
    ];
    const secHeader = `<div class="comp-actions"><div style="display:flex;align-items:center;gap:.5rem;"><span class="drag-handle">⠿</span><span class="type-badge section">Section</span>${numBadge}</div><div style="display:flex;gap:.25rem;">${collapseBtn}<button class="icon-btn" data-remove style="color:#f87171;">✕</button></div></div>`;
    bodyHtml = `<div class="g2" style="margin-top:.625rem;"><div><label class="slabel">Name (required)</label><input class="finput" data-field="name" placeholder="e.g. mySection" value="${esc(comp.fields.name)}"/></div><div><label class="slabel">Container (opt)</label>${buildSelect("container", comp.fields.container, secGroups)}</div></div>`;
    d.innerHTML =
      secHeader + `<div class="comp-body" ${bodyStyle}>${bodyHtml}</div>`;
  } else if (comp.type === "thumbnail") {
    const thumbGroups = [
      {
        label: "Sections",
        items: sectionNames.map((n) => ({ value: n, display: n })),
      },
    ];
    const thumbHeader = `<div class="comp-actions"><div style="display:flex;align-items:center;gap:.5rem;"><span class="drag-handle">⠿</span><span class="type-badge thumbnail">Thumbnail</span>${numBadge}</div><div style="display:flex;gap:.25rem;">${collapseBtn}<button class="icon-btn" data-remove style="color:#f87171;">✕</button></div></div>`;
    bodyHtml = `<p style="font-size:.7rem;color:#f472b6;margin:.4rem 0 .1rem;">Thumbnails only go inside sections.</p><div class="g2" style="margin-top:.5rem;"><div><label class="slabel">URL (required)</label><input class="finput" data-field="url" placeholder="https://…" value="${esc(comp.fields.url)}"/></div><div><label class="slabel">Description (emptiable)</label><input class="finput" data-field="description" placeholder="Optional" value="${esc(comp.fields.description)}"/></div></div><div class="g2" style="margin-top:.5rem;"><div style="display:flex;align-items:flex-end;padding-bottom:.1rem;"><label class="chk"><input type="checkbox" data-field="spoiler" ${comp.fields.spoiler ? "checked" : ""}/><span>Spoiler</span></label></div><div><label class="slabel">Section Name (required)</label>${buildRequiredSelect("container", comp.fields.container, thumbGroups, "Choose a section")}</div></div>`;
    d.innerHTML =
      thumbHeader + `<div class="comp-body" ${bodyStyle}>${bodyHtml}</div>`;
  } else if (comp.type === "mediagallery") {
    const mgGroups = [
      {
        label: "Containers",
        items: containerIds.map((id) => ({ value: id, display: id })),
      },
    ];
    const mgHeader = `<div class="comp-actions"><div style="display:flex;align-items:center;gap:.5rem;"><span class="drag-handle">⠿</span><span class="type-badge mediagallery">Media Gallery</span>${numBadge}</div><div style="display:flex;gap:.25rem;">${collapseBtn}<button class="icon-btn" data-remove style="color:#f87171;">✕</button></div></div>`;
    bodyHtml = `<div class="g2" style="margin-top:.625rem;"><div><label class="slabel">Gallery ID (required)</label><input class="finput" data-field="galleryId" placeholder="e.g. gallery1" value="${esc(comp.fields.galleryId)}"/></div><div><label class="slabel">Container (opt)</label>${buildSelect("container", comp.fields.container, mgGroups)}</div></div>`;
    d.innerHTML =
      mgHeader + `<div class="comp-body" ${bodyStyle}>${bodyHtml}</div>`;
  } else if (comp.type === "mediagalleryitem") {
    const mgiGroups = [
      {
        label: "Galleries",
        items: galleryIds.map((id) => ({ value: id, display: id })),
      },
    ];
    const mgiHeader = `<div class="comp-actions"><div style="display:flex;align-items:center;gap:.5rem;"><span class="drag-handle">⠿</span><span class="type-badge mediagallery">Media Item</span>${numBadge}</div><div style="display:flex;gap:.25rem;">${collapseBtn}<button class="icon-btn" data-remove style="color:#f87171;">✕</button></div></div>`;
    bodyHtml = `<div class="g2" style="margin-top:.625rem;"><div><label class="slabel">URL (required)</label><input class="finput" data-field="url" placeholder="https://…" value="${esc(comp.fields.url)}"/></div><div><label class="slabel">Description (emptiable)</label><input class="finput" data-field="description" placeholder="Optional" value="${esc(comp.fields.description)}"/></div></div><div class="g2" style="margin-top:.5rem;"><div style="display:flex;align-items:flex-end;padding-bottom:.1rem;"><label class="chk"><input type="checkbox" data-field="spoiler" ${comp.fields.spoiler ? "checked" : ""}/><span>Spoiler</span></label></div><div><label class="slabel">Gallery ID (required)</label>${buildRequiredSelect("galleryId", comp.fields.galleryId, mgiGroups, "Choose a media gallery")}</div></div>`;
    d.innerHTML =
      mgiHeader + `<div class="comp-body" ${bodyStyle}>${bodyHtml}</div>`;
  } else if (comp.type === "actionrow") {
    const arGroups = [
      {
        label: "Containers",
        items: containerIds.map((id) => ({ value: id, display: id })),
      },
    ];
    const arHeader = `<div class="comp-actions"><div style="display:flex;align-items:center;gap:.5rem;"><span class="drag-handle">⠿</span><span class="type-badge actionrow">Action Row</span>${numBadge}</div><div style="display:flex;gap:.25rem;">${collapseBtn}<button class="icon-btn" data-remove style="color:#f87171;">✕</button></div></div>`;
    bodyHtml = `<div class="g2" style="margin-top:.625rem;"><div><label class="slabel">Action Row ID (required)</label><input class="finput" data-field="rowId" placeholder="e.g. row1" value="${esc(comp.fields.rowId)}"/></div><div><label class="slabel">Container (opt)</label>${buildSelect("container", comp.fields.container, arGroups)}</div></div>`;
    d.innerHTML =
      arHeader + `<div class="comp-body" ${bodyStyle}>${bodyHtml}</div>`;
  } else if (comp.type === "buttoncv2") {
    const btnGroups = [
      {
        label: "Action Rows",
        items: actionRowIds.map((id) => ({ value: id, display: id })),
      },
      {
        label: "Sections",
        items: sectionNames.map((n) => ({ value: n, display: n })),
      },
    ];
    const btnHeader = `<div class="comp-actions"><div style="display:flex;align-items:center;gap:.5rem;"><span class="drag-handle">⠿</span><span class="type-badge button">Button CV2</span>${numBadge}</div><div style="display:flex;gap:.25rem;">${collapseBtn}<button class="icon-btn" data-remove style="color:#f87171;">✕</button></div></div>`;
    bodyHtml = `<div class="g3" style="margin-top:.625rem;"><div><label class="slabel">ID / URL (required)</label><input class="finput" data-f="id" placeholder="button_id or https://…" value="${esc(comp.fields.id)}"/></div><div><label class="slabel">Label (emptiable)</label><input class="finput" data-f="label" placeholder="Click me" value="${esc(comp.fields.label)}"/></div><div><label class="slabel">Style (emptiable)</label><select class="finput" data-f="style"><option value="" ${!comp.fields.style ? "selected" : ""}>— default —</option><option value="primary" ${comp.fields.style === "primary" ? "selected" : ""}>Primary</option><option value="secondary" ${comp.fields.style === "secondary" ? "selected" : ""}>Secondary</option><option value="success" ${comp.fields.style === "success" ? "selected" : ""}>Success</option><option value="danger" ${comp.fields.style === "danger" ? "selected" : ""}>Danger</option><option value="link" ${comp.fields.style === "link" ? "selected" : ""}>Link</option></select></div></div><div class="g2" style="margin-top:.5rem;"><div><label class="slabel">Emoji (emptiable)</label><input class="finput" data-f="emoji" placeholder="Emoji ID or unicode" value="${esc(comp.fields.emoji)}"/></div><div style="display:flex;align-items:flex-end;padding-bottom:.1rem;"><label class="chk"><input type="checkbox" data-f="disabled" ${comp.fields.disabled ? "checked" : ""}/><span>Disabled</span></label></div></div><div style="margin-top:.5rem;"><label class="slabel">Action Row / Section (required)</label>${buildRequiredSelect("actionRowOrSection", comp.fields.actionRowOrSection, btnGroups, "Choose an action row or section")}</div>`;
    d.innerHTML =
      btnHeader + `<div class="comp-body" ${bodyStyle}>${bodyHtml}</div>`;
  } else if (
    comp.type === "userselect" ||
    comp.type === "roleselect" ||
    comp.type === "mentionableselect"
  ) {
    const typeName =
      comp.type === "userselect"
        ? "User Select"
        : comp.type === "roleselect"
          ? "Role Select"
          : "Mentionable Select";
    const selGroups = [
      {
        label: "Action Rows",
        items: actionRowIds.map((id) => ({ value: id, display: id })),
      },
    ];
    const selHeader = `<div class="comp-actions"><div style="display:flex;align-items:center;gap:.5rem;"><span class="drag-handle">⠿</span><span class="type-badge select">${typeName}</span>${numBadge}</div><div style="display:flex;gap:.25rem;">${collapseBtn}<button class="icon-btn" data-remove style="color:#f87171;">✕</button></div></div>`;
    bodyHtml = `<div class="g2" style="margin-top:.625rem;"><div><label class="slabel">ID (required)</label><input class="finput" data-f="id" placeholder="select_id" value="${esc(comp.fields.id)}"/></div><div><label class="slabel">Placeholder (emptiable)</label><input class="finput" data-f="placeholder" placeholder="Optional" value="${esc(comp.fields.placeholder)}"/></div></div><div class="g3" style="margin-top:.5rem;"><div><label class="slabel">Min (0-25)</label><input class="finput" type="number" min="0" max="25" data-f="min" placeholder="0" value="${esc(comp.fields.min)}"/></div><div><label class="slabel">Max (1-25)</label><input class="finput" type="number" min="1" max="25" data-f="max" placeholder="1" value="${esc(comp.fields.max)}"/></div><div style="display:flex;align-items:flex-end;padding-bottom:.1rem;"><label class="chk"><input type="checkbox" data-f="disabled" ${comp.fields.disabled ? "checked" : ""}/><span>Disabled</span></label></div></div><div style="margin-top:.5rem;"><label class="slabel">Action Row ID (required)</label>${buildRequiredSelect("actionRowId", comp.fields.actionRowId, selGroups, "Choose an action row")}</div>`;
    d.innerHTML =
      selHeader + `<div class="comp-body" ${bodyStyle}>${bodyHtml}</div>`;
  } else if (comp.type === "stringselect") {
    const ssGroups = [
      {
        label: "Action Rows",
        items: actionRowIds.map((id) => ({ value: id, display: id })),
      },
    ];
    const ssHeader = `<div class="comp-actions"><div style="display:flex;align-items:center;gap:.5rem;"><span class="drag-handle">⠿</span><span class="type-badge select">String Select</span>${numBadge}</div><div style="display:flex;gap:.25rem;">${collapseBtn}<button class="icon-btn" data-remove style="color:#f87171;">✕</button></div></div>`;
    bodyHtml = `<div class="g2" style="margin-top:.625rem;"><div><label class="slabel">Select Menu ID (required)</label><input class="finput" data-f="id" placeholder="select_id" value="${esc(comp.fields.id)}"/></div><div><label class="slabel">Placeholder (emptiable)</label><input class="finput" data-f="placeholder" placeholder="Optional" value="${esc(comp.fields.placeholder)}"/></div></div><div class="g3" style="margin-top:.5rem;"><div><label class="slabel">Min (0-25)</label><input class="finput" type="number" min="0" max="25" data-f="min" placeholder="0" value="${esc(comp.fields.min)}"/></div><div><label class="slabel">Max (1-25)</label><input class="finput" type="number" min="1" max="25" data-f="max" placeholder="1" value="${esc(comp.fields.max)}"/></div><div style="display:flex;align-items:flex-end;padding-bottom:.1rem;"><label class="chk"><input type="checkbox" data-f="disabled" ${comp.fields.disabled ? "checked" : ""}/><span>Disabled</span></label></div></div><div style="margin-top:.5rem;"><label class="slabel">Action Row ID (required)</label>${buildRequiredSelect("actionRowId", comp.fields.actionRowId, ssGroups, "Choose an action row")}</div><div style="margin-top:.625rem;"><button class="btn btn-ghost btn-add-option" style="width:100%;">+ Add Option</button></div><div class="stringselect-options"></div>`;
    d.innerHTML =
      ssHeader + `<div class="comp-body" ${bodyStyle}>${bodyHtml}</div>`;
  }
  // Collapse toggle
  const collapseEl = d.querySelector("[data-collapse]");
  if (collapseEl) {
    collapseEl.addEventListener("click", () => {
      comp.collapsed = !comp.collapsed;
      const body = d.querySelector(".comp-body");
      const chevron = collapseEl.querySelector("svg");
      body.style.display = comp.collapsed ? "none" : "";
      chevron.style.transform = comp.collapsed ? "rotate(180deg)" : "";
      saveState();
    });
  }
  d.querySelector("[data-remove]").addEventListener("click", () => {
    syncAllFields();
    const typeMap = {
      container: "Container",
      textdisplay: "Text Display",
      separator: "Separator",
      section: "Section",
      thumbnail: "Thumbnail",
      mediagallery: "Media Gallery",
      mediagalleryitem: "Media Item",
      actionrow: "Action Row",
      buttoncv2: "Button CV2",
      userselect: "User Select",
      roleselect: "Role Select",
      mentionableselect: "Mentionable Select",
      stringselect: "String Select",
    };
    const typeName = typeMap[comp.type] || comp.type;
    // Calculate the type-specific number before removing
    const compIndex = components.findIndex((c) => c.uid === comp.uid);
    const typeSpecificNum = components.filter(
      (c, i) => c.type === comp.type && i <= compIndex,
    ).length;
    components = components.filter((c) => c.uid !== comp.uid);
    renderBuilder();
    toast(`${typeName} #${typeSpecificNum} removed`, "s");
  });
  // Wire up String Select option button if this is a stringselect
  if (comp.type === "stringselect") {
    const optionsContainer = d.querySelector(".stringselect-options");
    const addOptBtn = d.querySelector(".btn-add-option");
    // Restore existing options if any
    if (comp.options && Array.isArray(comp.options)) {
      comp.options.forEach((optData, idx) => {
        const optCard = createStringSelectOption(
          comp,
          idx,
          optData,
          optionsContainer,
        );
        optionsContainer.appendChild(optCard);
      });
    }
    addOptBtn.addEventListener("click", () => {
      const currentOptionCount = optionsContainer.querySelectorAll(
        ".stringselect-option",
      ).length;
      const optCard = createStringSelectOption(
        comp,
        currentOptionCount,
        {},
        optionsContainer,
      );
      optionsContainer.appendChild(optCard);
      saveCV2State();
      toast(`Option #${currentOptionCount + 1} added`, "s");
    });
  }
  // Handle data-field attributes (used by container, section, etc.)
  d.querySelectorAll("[data-field]").forEach((el) => {
    const field = el.dataset.field;
    const ev = el.type === "checkbox" ? "change" : "input";
    el.addEventListener(ev, () => {
      comp.fields[field] = el.type === "checkbox" ? el.checked : el.value;
      // Refresh dropdowns when a parent ID/name changes
      if (
        (comp.type === "container" && field === "id") ||
        (comp.type === "section" && field === "name") ||
        (comp.type === "mediagallery" && field === "galleryId") ||
        (comp.type === "actionrow" && field === "rowId")
      ) {
        refreshAllDropdowns();
      }
      saveCV2State();
      updatePreview();
    });
  });
  d.querySelectorAll("[data-f]").forEach((el) => {
    const field = el.dataset.f;
    const isIdField =
      ["id", "name", "galleryId", "rowId"].includes(field) &&
      [
        "container",
        "section",
        "mediagallery",
        "actionrow",
        "stringselect",
      ].includes(comp.type);
    const ev = el.type === "checkbox" ? "change" : "input";
    el.addEventListener(ev, () => {
      comp.fields[field] = el.type === "checkbox" ? el.checked : el.value;
      if (isIdField) refreshAllDropdowns();
      saveCV2State();
      updatePreview();
    });
  });
  makeDraggable(d);
  return d;
}
function createStringSelectOption(
  parentComp,
  optIdx,
  optData = {},
  optionsContainer,
) {
  const od = document.createElement("div");
  od.className = "stringselect-option";
  // Function to get current position in the list
  const getCurrentPosition = () => {
    if (!optionsContainer) return optIdx + 1;
    const allOptions = Array.from(
      optionsContainer.querySelectorAll(".stringselect-option"),
    );
    const currentIdx = allOptions.indexOf(od);
    return currentIdx >= 0 ? currentIdx + 1 : optIdx + 1;
  };
  od.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem;">
            <div style="display:flex;align-items:center;gap:.5rem;">
              <span class="type-badge select">Option</span>
              <span class="option-number" style="font-size:.6rem;font-family:var(--mono);color:var(--text3);font-weight:600;">#${optIdx + 1}</span>
            </div>
            <div style="display:flex;gap:.25rem;">
              <button class="icon-btn opt-collapse" title="Collapse" style="color:var(--text3)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transition:transform .2s"><polyline points="6 9 12 15 18 9"/></svg></button>
              <button class="icon-btn opt-remove" style="color:#f87171;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
          </div>
          <div class="opt-body">
            <div class="g2" style="margin-bottom:.5rem;">
              <div><label class="slabel">Label (required, max 100)</label><input class="finput" data-optfield="label" maxlength="100" placeholder="Option label" value="${esc(optData.label || "")}"/></div>
              <div><label class="slabel">Value (required, max 100)</label><input class="finput" data-optfield="value" maxlength="100" placeholder="option_value" value="${esc(optData.value || "")}"/></div>
            </div>
            <div class="g2" style="margin-bottom:.5rem;">
              <div><label class="slabel">Description (opt, max 100)</label><input class="finput" data-optfield="description" maxlength="100" placeholder="Optional description" value="${esc(optData.description || "")}"/></div>
              <div><label class="slabel">Emoji (optional)</label><input class="finput" data-optfield="emoji" placeholder="Emoji ID or unicode" value="${esc(optData.emoji || "")}"/></div>
            </div>
            <div style="display:flex;align-items:center;">
              <label class="chk"><input type="checkbox" data-optfield="default" ${optData.default ? "checked" : ""}/><span>Default</span></label>
            </div>
          </div>
        `;
  // Collapse toggle
  const collapseBtn = od.querySelector(".opt-collapse");
  const optBody = od.querySelector(".opt-body");
  collapseBtn.addEventListener("click", () => {
    const collapsed = optBody.style.display === "none";
    optBody.style.display = collapsed ? "" : "none";
    collapseBtn.querySelector("svg").style.transform = collapsed
      ? ""
      : "rotate(180deg)";
  });
  // Remove button
  od.querySelector(".opt-remove").addEventListener("click", () => {
    const currentPos = getCurrentPosition();
    od.remove();
    // Update all remaining option numbers
    if (optionsContainer) {
      optionsContainer
        .querySelectorAll(".stringselect-option")
        .forEach((opt, idx) => {
          const numSpan = opt.querySelector(".option-number");
          if (numSpan) numSpan.textContent = `#${idx + 1}`;
        });
    }
    saveCV2State();
    toast(`Option #${currentPos} removed`, "s");
  });
  // Input listeners
  od.querySelectorAll("[data-optfield]").forEach((el) => {
    const ev = el.type === "checkbox" ? "change" : "input";
    el.addEventListener(ev, saveCV2State);
  });
  return od;
}
function saveCV2State() {
  try {
    // Collect options for each stringselect
    components.forEach((comp) => {
      if (comp.type === "stringselect") {
        const card = document.querySelector(`[data-uid="${comp.uid}"]`);
        if (!card) return;
        const options = [];
        card.querySelectorAll(".stringselect-option").forEach((opt) => {
          const data = {};
          opt.querySelectorAll("[data-optfield]").forEach((el) => {
            data[el.dataset.optfield] =
              el.type === "checkbox" ? el.checked : el.value;
          });
          options.push(data);
        });
        comp.options = options;
      }
    });
    saveState();
  } catch (e) { }
}
function refreshAllDropdowns() {
  const containerIds = getContainerIds();
  const sectionNames = getSectionNames();
  const galleryIds = getGalleryIds();
  const actionRowIds = getActionRowIds();
  document.querySelectorAll("#components-root .comp-block").forEach((block) => {
    const cuid = block.dataset.uid;
    const comp = components.find((c) => c.uid === cuid);
    if (!comp) return;
    // Handle both data-f and data-field selects
    const allSelects = [
      ...block.querySelectorAll("select[data-f]"),
      ...block.querySelectorAll("select[data-field]"),
    ];
    allSelects.forEach((sel) => {
      const field = sel.dataset.f || sel.dataset.field;
      const current = comp.fields[field] || "";
      let newHtml = null;
      if (comp.type === "textdisplay" && field === "container") {
        newHtml = buildSelect(field, current, [
          {
            label: "Containers",
            items: containerIds.map((id) => ({
              value: id,
              display: id,
            })),
          },
          {
            label: "Sections",
            items: sectionNames.map((n) => ({ value: n, display: n })),
          },
        ]);
      } else if (
        (comp.type === "separator" ||
          comp.type === "mediagallery" ||
          comp.type === "actionrow" ||
          comp.type === "section") &&
        field === "container"
      ) {
        newHtml = buildSelect(field, current, [
          {
            label: "Containers",
            items: containerIds.map((id) => ({
              value: id,
              display: id,
            })),
          },
        ]);
      } else if (comp.type === "thumbnail" && field === "container") {
        newHtml = buildRequiredSelect(
          field,
          current,
          [
            {
              label: "Sections",
              items: sectionNames.map((n) => ({
                value: n,
                display: n,
              })),
            },
          ],
          "Choose a section",
        );
      } else if (comp.type === "mediagalleryitem" && field === "galleryId") {
        newHtml = buildRequiredSelect(
          field,
          current,
          [
            {
              label: "Galleries",
              items: galleryIds.map((id) => ({
                value: id,
                display: id,
              })),
            },
          ],
          "Choose a media gallery",
        );
      } else if (comp.type === "buttoncv2" && field === "actionRowOrSection") {
        newHtml = buildRequiredSelect(
          field,
          current,
          [
            {
              label: "Action Rows",
              items: actionRowIds.map((id) => ({
                value: id,
                display: id,
              })),
            },
            {
              label: "Sections",
              items: sectionNames.map((n) => ({
                value: n,
                display: n,
              })),
            },
          ],
          "Choose an action row or section",
        );
      } else if (
        (comp.type === "userselect" ||
          comp.type === "roleselect" ||
          comp.type === "mentionableselect" ||
          comp.type === "stringselect") &&
        field === "actionRowId"
      ) {
        newHtml = buildRequiredSelect(
          field,
          current,
          [
            {
              label: "Action Rows",
              items: actionRowIds.map((id) => ({
                value: id,
                display: id,
              })),
            },
          ],
          "Choose an action row",
        );
      }
      if (newHtml) {
        const tmp = document.createElement("div");
        tmp.innerHTML = newHtml;
        const newSel = tmp.firstElementChild;
        newSel.addEventListener("change", () => {
          comp.fields[field] = newSel.value;
          saveCV2State();
          updatePreview();
        });
        sel.replaceWith(newSel);
      }
    });
  });
}
function esc(v) {
  if (!v && v !== false) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
document.getElementById("add-container-btn").addEventListener("click", () => {
  syncAllFields();
  const num = components.filter((c) => c.type === "container").length + 1;
  components.push({
    uid: uid(),
    type: "container",
    fields: { id: "", color: "", spoiler: false },
  });
  renderBuilder();
  toast(`Container #${num} added`, "s");
});
document.getElementById("add-textdisplay-btn").addEventListener("click", () => {
  syncAllFields();
  const num = components.filter((c) => c.type === "textdisplay").length + 1;
  components.push({
    uid: uid(),
    type: "textdisplay",
    fields: { content: "", container: "" },
  });
  renderBuilder();
  toast(`Text Display #${num} added`, "s");
});
document.getElementById("add-separator-btn").addEventListener("click", () => {
  syncAllFields();
  const num = components.filter((c) => c.type === "separator").length + 1;
  components.push({
    uid: uid(),
    type: "separator",
    fields: { divider: true, spacing: "", container: "" },
  });
  renderBuilder();
  toast(`Separator #${num} added`, "s");
});
document.getElementById("add-section-btn").addEventListener("click", () => {
  syncAllFields();
  const num = components.filter((c) => c.type === "section").length + 1;
  components.push({
    uid: uid(),
    type: "section",
    fields: { name: "", container: "" },
  });
  renderBuilder();
  toast(`Section #${num} added`, "s");
});
document.getElementById("add-thumbnail-btn").addEventListener("click", () => {
  syncAllFields();
  const num = components.filter((c) => c.type === "thumbnail").length + 1;
  components.push({
    uid: uid(),
    type: "thumbnail",
    fields: { url: "", description: "", spoiler: false, container: "" },
  });
  renderBuilder();
  toast(`Thumbnail #${num} added`, "s");
});
document
  .getElementById("add-mediagallery-btn")
  .addEventListener("click", () => {
    syncAllFields();
    const num = components.filter((c) => c.type === "mediagallery").length + 1;
    components.push({
      uid: uid(),
      type: "mediagallery",
      fields: { galleryId: "", container: "" },
    });
    renderBuilder();
    toast(`Media Gallery #${num} added`, "s");
  });
document
  .getElementById("add-mediagalleryitem-btn")
  .addEventListener("click", () => {
    syncAllFields();
    const num =
      components.filter((c) => c.type === "mediagalleryitem").length + 1;
    components.push({
      uid: uid(),
      type: "mediagalleryitem",
      fields: { url: "", description: "", spoiler: false, galleryId: "" },
    });
    renderBuilder();
    toast(`Media Item #${num} added`, "s");
  });
document.getElementById("add-actionrow-btn").addEventListener("click", () => {
  syncAllFields();
  const num = components.filter((c) => c.type === "actionrow").length + 1;
  components.push({
    uid: uid(),
    type: "actionrow",
    fields: { rowId: "", container: "" },
  });
  renderBuilder();
  toast(`Action Row #${num} added`, "s");
});
document.getElementById("add-buttoncv2-btn").addEventListener("click", () => {
  syncAllFields();
  const num = components.filter((c) => c.type === "buttoncv2").length + 1;
  components.push({
    uid: uid(),
    type: "buttoncv2",
    fields: {
      id: "",
      label: "",
      style: "",
      disabled: false,
      emoji: "",
      actionRowOrSection: "",
    },
  });
  renderBuilder();
  toast(`Button CV2 #${num} added`, "s");
});
document.getElementById("add-userselect-btn").addEventListener("click", () => {
  syncAllFields();
  const num = components.filter((c) => c.type === "userselect").length + 1;
  components.push({
    uid: uid(),
    type: "userselect",
    fields: {
      id: "",
      placeholder: "",
      min: "",
      max: "",
      disabled: false,
      actionRowId: "",
    },
  });
  renderBuilder();
  toast(`User Select #${num} added`, "s");
});
document.getElementById("add-roleselect-btn").addEventListener("click", () => {
  syncAllFields();
  const num = components.filter((c) => c.type === "roleselect").length + 1;
  components.push({
    uid: uid(),
    type: "roleselect",
    fields: {
      id: "",
      placeholder: "",
      min: "",
      max: "",
      disabled: false,
      actionRowId: "",
    },
  });
  renderBuilder();
  toast(`Role Select #${num} added`, "s");
});
document
  .getElementById("add-mentionableselect-btn")
  .addEventListener("click", () => {
    syncAllFields();
    const num =
      components.filter((c) => c.type === "mentionableselect").length + 1;
    components.push({
      uid: uid(),
      type: "mentionableselect",
      fields: {
        id: "",
        placeholder: "",
        min: "",
        max: "",
        disabled: false,
        actionRowId: "",
      },
    });
    renderBuilder();
    toast(`Mentionable Select #${num} added`, "s");
  });
document
  .getElementById("add-stringselect-btn")
  .addEventListener("click", () => {
    syncAllFields();
    const num = components.filter((c) => c.type === "stringselect").length + 1;
    components.push({
      uid: uid(),
      type: "stringselect",
      fields: {
        id: "",
        placeholder: "",
        min: "",
        max: "",
        disabled: false,
        actionRowId: "",
        optionCounter: 0,
      },
      options: [],
    });
    renderBuilder();
    toast(`String Select #${num} added`, "s");
  });
document.getElementById("clear-btn").addEventListener("click", () => {
  components = [];
  uidCounter = 0;
  document.getElementById("output-text").value = "";
  localStorage.removeItem(LS_KEY);
  renderBuilder();
  toast("Cleared", "s");
});
let dragSrc = null;
function makeDraggable(el) {
  const handle = el.querySelector(".drag-handle");
  if (!handle) return;
  handle.draggable = true;
  handle.addEventListener("dragstart", (e) => {
    dragSrc = el;
    // Set the entire component block as the drag image
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setDragImage(el, 0, 0);
    setTimeout(() => el.classList.add("dragging"), 0);
  });
  handle.addEventListener("dragend", () => {
    el.classList.remove("dragging");
    document
      .querySelectorAll(".drag-over")
      .forEach((x) => x.classList.remove("drag-over"));
    syncAllFields();
    const root = document.getElementById("components-root");
    const newOrder = [...root.children].map((c) => c.dataset.uid);
    components.sort(
      (a, b) => newOrder.indexOf(a.uid) - newOrder.indexOf(b.uid),
    );
    renderBuilder(); // renumbers all blocks after reorder
  });
  el.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (dragSrc && dragSrc !== el && dragSrc.parentNode === el.parentNode)
      el.classList.add("drag-over");
  });
  el.addEventListener("dragleave", () => el.classList.remove("drag-over"));
  el.addEventListener("drop", (e) => {
    e.preventDefault();
    el.classList.remove("drag-over");
    if (dragSrc && dragSrc !== el && dragSrc.parentNode === el.parentNode) {
      const par = el.parentNode;
      const kids = [...par.children];
      const si = kids.indexOf(dragSrc),
        ti = kids.indexOf(el);
      if (si < ti) par.insertBefore(dragSrc, el.nextSibling);
      else par.insertBefore(dragSrc, el);
    }
  });
}
function updatePreview() {
  const root = document.getElementById("embed-preview");
  if (components.length === 0) {
    root.innerHTML = `<p class="pv-empty">Add components to see a preview…</p>`;
    return;
  }
  // Build lookup maps
  const containerChildren = {}; // containerName -> [comp]
  const sectionMap = {}; // sectionName -> comp (with .children)
  const galleryMap = {}; // galleryId -> comp (with .items)
  const actionRowMap = {}; // rowId -> comp (with .buttons)
  components.forEach((comp) => {
    if (comp.type === "container") {
      const cid = comp.fields.id || "__" + comp.uid;
      containerChildren[cid] = [];
    }
    if (comp.type === "section") {
      const sname = comp.fields.name || "__sec_" + comp.uid;
      sectionMap[sname] = comp;
      comp.children = [];
      comp.buttons = [];
    }
    if (comp.type === "mediagallery") {
      const gid = comp.fields.galleryId || "__gal_" + comp.uid;
      galleryMap[gid] = comp;
      comp.items = [];
    }
    if (comp.type === "actionrow") {
      const rid = comp.fields.rowId || "__row_" + comp.uid;
      actionRowMap[rid] = comp;
      comp.buttons = [];
      comp.selects = [];
    }
  });
  const topItems = [];
  components.forEach((comp) => {
    if (comp.type === "container") {
      const cid = comp.fields.id || "__" + comp.uid;
      topItems.push({ kind: "container", cid, comp });
    } else if (comp.type === "mediagalleryitem") {
      // attach by galleryId field
      const gid = comp.fields.galleryId;
      if (gid && galleryMap[gid]) {
        galleryMap[gid].items.push(comp);
      }
    } else if (comp.type === "buttoncv2") {
      // attach by actionRowOrSection — could be actionRow or section
      const target = comp.fields.actionRowOrSection;
      if (target && actionRowMap[target]) {
        actionRowMap[target].buttons.push(comp);
      } else if (target && sectionMap[target]) {
        // button as section accessory — store separately so preview can render it on the right
        sectionMap[target].buttons = sectionMap[target].buttons || [];
        sectionMap[target].buttons.push(comp);
      }
    } else if (
      comp.type === "userselect" ||
      comp.type === "roleselect" ||
      comp.type === "mentionableselect" ||
      comp.type === "stringselect"
    ) {
      const rid = comp.fields.actionRowId;
      if (rid && actionRowMap[rid]) {
        actionRowMap[rid].selects.push(comp);
      }
    } else if (comp.type === "textdisplay") {
      const target = comp.fields.container;
      if (target && sectionMap[target]) {
        sectionMap[target].children.push(comp);
      } else if (target && containerChildren[target] !== undefined) {
        containerChildren[target].push(comp);
      } else {
        topItems.push({ kind: "comp", comp });
      }
    } else if (comp.type === "thumbnail") {
      // thumbnails only go in sections
      const target = comp.fields.container;
      if (target && sectionMap[target]) {
        sectionMap[target].children.push(comp);
      }
      // don't render at top level
    } else if (
      comp.type === "section" ||
      comp.type === "mediagallery" ||
      comp.type === "actionrow"
    ) {
      const cid = comp.fields.container;
      if (cid && containerChildren[cid] !== undefined) {
        containerChildren[cid].push(comp);
      } else {
        topItems.push({ kind: "comp", comp });
      }
    } else if (comp.type === "separator") {
      const cid = comp.fields.container;
      if (cid && containerChildren[cid] !== undefined) {
        containerChildren[cid].push(comp);
      } else {
        topItems.push({ kind: "comp", comp });
      }
    }
  });
  let html = "";
  topItems.forEach((item) => {
    if (item.kind === "container") {
      html += renderContainerPreview(item.comp, containerChildren[item.cid]);
    } else {
      html += renderCompPreview(item.comp);
    }
  });
  root.innerHTML =
    html || `<p class="pv-empty">Add components to see a preview…</p>`;
}
function renderContainerPreview(comp, children) {
  const color =
    comp.fields.color &&
      /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(comp.fields.color)
      ? comp.fields.color
      : null;
  const spoiler = comp.fields.spoiler;
  const colorStyle = color ? `--pv-accent:${color};` : "";
  const colorClass = color ? " colored" : "";
  let inner = "";
  (children || []).forEach((c) => {
    inner += renderCompPreview(c);
  });
  if (!inner)
    inner = `<p style="font-size:.7rem;color:#72767d;font-style:italic;padding:.25rem 0;">Empty container</p>`;
  const spoilerOverlay = spoiler
    ? `<div class="pv-spoiler-overlay" onclick="this.style.display='none'"><span class="pv-spoiler-label">SPOILER</span></div>`
    : "";
  return `<div class="pv-container${colorClass}" style="${colorStyle}">${spoilerOverlay}<div class="pv-container-inner">${inner}</div></div>`;
}
function renderCompPreview(comp) {
  if (comp.type === "textdisplay") {
    const text = comp.fields.content || "";
    return `<div class="pv-text-display"><p class="pv-text-content">${renderMarkdown(text) || '<span style="color:#72767d;font-style:italic;">Empty text display</span>'}</p></div>`;
  }
  if (comp.type === "separator") {
    const divider = comp.fields.divider !== false;
    const large = comp.fields.spacing === "large";
    return divider
      ? `<div class="pv-separator divider${large ? " large" : ""}"></div>`
      : `<div class="pv-separator nodivider${large ? " large" : ""}"></div>`;
  }
  if (comp.type === "section") {
    const children = comp.children || [];
    let textItems = "";
    let thumbItem = "";
    children.forEach((c) => {
      if (c.type === "textdisplay") {
        textItems += `<div class="pv-text-display"><p class="pv-text-content">${renderMarkdown(c.fields.content) || '<span style="color:#72767d;font-style:italic;">Empty</span>'}</p></div>`;
      } else if (c.type === "thumbnail") {
        thumbItem = `<img class="pv-thumbnail" src="${escHtml(c.fields.url)}" alt="${escHtml(c.fields.description || "")}" onerror="this.style.display='none'"/>`;
      }
    });
    let btnAccessory = "";
    (comp.buttons || []).forEach((btn) => {
      const style = btn.fields.style || "primary";
      const disabled = btn.fields.disabled ? "disabled" : "";
      btnAccessory += `<button class="pv-btn ${style}" ${disabled} style="align-self:center;">${escHtml(btn.fields.label) || "Button"}</button>`;
    });
    const accessory = thumbItem || btnAccessory;
    const inner =
      textItems || accessory
        ? `<div style="flex:1;">${textItems}</div>${accessory}`
        : `<p style="font-size:.7rem;color:#72767d;font-style:italic;">Empty section</p>`;
    return `<div class="pv-section">${inner}</div>`;
  }
  if (comp.type === "mediagallery") {
    let imgs = "";
    (comp.items || []).forEach((item) => {
      imgs += `<img src="${escHtml(item.fields.url)}" alt="${escHtml(item.fields.description || "")}" onerror="this.style.display='none'"/>`;
    });
    return `<div class="pv-media-gallery">${imgs || '<p style="font-size:.7rem;color:#72767d;font-style:italic;padding:.5rem;">No images</p>'}</div>`;
  }
  if (comp.type === "actionrow") {
    let btns = "";
    (comp.buttons || []).forEach((btn) => {
      const style = btn.fields.style || "primary";
      const disabled = btn.fields.disabled ? "disabled" : "";
      btns += `<button class="pv-btn ${style}" ${disabled}>${escHtml(btn.fields.label) || "Button"}</button>`;
    });
    let sels = "";
    (comp.selects || []).forEach((sel) => {
      sels += `<div class="pv-select">${escHtml(sel.fields.placeholder || "Select…")}</div>`;
    });
    return `<div class="pv-buttons">${btns || sels || '<p style="font-size:.7rem;color:#72767d;font-style:italic;">Empty action row</p>'}</div>${sels && btns ? `<div>${sels}</div>` : ""}`;
  }
  return "";
}
function escHtml(v) {
  return String(v)
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
function generateCode() {
  const errors = [];
  const isUrl = (v) => /^https?:\/\/.+/.test((v || "").trim());
  const isHex = (v) =>
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test((v || "").trim());
  // Collect all defined IDs for parent components
  const containerNames = [];
  const sectionNames = [];
  const galleryIds = [];
  const actionRowIds = [];
  const allParentIds = []; // For duplicate detection across parent types
  components.forEach((comp) => {
    if (comp.type === "container") {
      const id = (comp.fields.id || "").trim();
      containerNames.push(id);
      if (id) allParentIds.push({ id, type: "Container" });
    }
    if (comp.type === "section") {
      const name = (comp.fields.name || "").trim();
      sectionNames.push(name);
      if (name) allParentIds.push({ id: name, type: "Section" });
    }
    if (comp.type === "mediagallery") {
      const gid = (comp.fields.galleryId || "").trim();
      galleryIds.push(gid);
      if (gid) allParentIds.push({ id: gid, type: "Media Gallery" });
    }
    if (comp.type === "actionrow") {
      const rid = (comp.fields.rowId || "").trim();
      actionRowIds.push(rid);
      if (rid) allParentIds.push({ id: rid, type: "Action Row" });
    }
  });
  // Check for duplicate parent IDs
  const seenParentIds = {};
  allParentIds.forEach(({ id, type }) => {
    if (seenParentIds[id]) {
      errors.push(`'${id}' is already used by another ${seenParentIds[id]}`);
    } else {
      seenParentIds[id] = type;
    }
  });
  // --- Per-component field validation ---
  components.forEach((comp) => {
    if (comp.type === "container") {
      const id = (comp.fields.id || "").trim();
      if (!id) {
        errors.push("A container is missing its Name");
        return;
      }
      const color = (comp.fields.color || "").trim();
      if (color && !isHex(color))
        errors.push(`Container "${id}": invalid hex color "${color}"`);
    }
    if (comp.type === "textdisplay") {
      if (!(comp.fields.content || "").trim())
        errors.push("A Text Display has empty content");
    }
    if (comp.type === "section") {
      const name = (comp.fields.name || "").trim();
      if (!name) errors.push("A section is missing its Name");
    }
    if (comp.type === "thumbnail") {
      const url = (comp.fields.url || "").trim();
      const sec = (comp.fields.container || "").trim();
      if (!url) errors.push("A Thumbnail is missing its URL");
      else if (!isUrl(url)) errors.push(`Thumbnail: invalid URL "${url}"`);
      if (!sec) errors.push("A Thumbnail is missing its Section Name");
    }
    if (comp.type === "mediagallery") {
      if (!(comp.fields.galleryId || "").trim())
        errors.push("A Media Gallery is missing its Gallery ID");
    }
    if (comp.type === "mediagalleryitem") {
      const url = (comp.fields.url || "").trim();
      const gid = (comp.fields.galleryId || "").trim();
      if (!url) errors.push("A Media Item is missing its URL");
      else if (!isUrl(url)) errors.push(`Media Item: invalid URL "${url}"`);
      if (!gid) errors.push("A Media Item is missing its Gallery ID");
      else if (!galleryIds.includes(gid))
        errors.push(`Media Item references unknown Gallery ID "${gid}"`);
    }
    if (comp.type === "actionrow") {
      if (!(comp.fields.rowId || "").trim())
        errors.push("An Action Row is missing its ID");
    }
    if (comp.type === "buttoncv2") {
      const id = (comp.fields.id || "").trim();
      const label = (comp.fields.label || "").trim();
      const emoji = (comp.fields.emoji || "").trim();
      if (!id) errors.push("A Button CV2 is missing its ID");
      if (!label && !emoji)
        errors.push(`Button '${id || "unnamed"}': must have a label or emoji`);
      if (!(comp.fields.actionRowOrSection || "").trim())
        errors.push(
          `Button '${id || "unnamed"}': Action Row / Section is required`,
        );
    }
    if (
      comp.type === "userselect" ||
      comp.type === "roleselect" ||
      comp.type === "mentionableselect"
    ) {
      const label =
        comp.type === "userselect"
          ? "User Select"
          : comp.type === "roleselect"
            ? "Role Select"
            : "Mentionable Select";
      const id = (comp.fields.id || "").trim();
      if (!id) errors.push(`A ${label} is missing its ID`);
      if (!(comp.fields.actionRowId || "").trim())
        errors.push(`${label} '${id || "unnamed"}': Action Row ID is required`);
    }
    if (comp.type === "stringselect") {
      const id = (comp.fields.id || "").trim();
      if (!id) {
        errors.push("A String Select is missing its ID");
      } else {
        // Check for at least one option
        if (!comp.options || comp.options.length === 0) {
          errors.push(`String Select '${id}': add at least one option`);
        } else {
          // Validate each option
          const optionValues = [];
          comp.options.forEach((opt, idx) => {
            const label = (opt.label || "").trim();
            const value = (opt.value || "").trim();
            const description = (opt.description || "").trim();
            if (!label || !value) {
              errors.push(
                `String Select '${id}' Option ${idx + 1}: label and value required`,
              );
            }
            if (label && label.length > 100) {
              errors.push(
                `String Select '${id}' Option ${idx + 1}: label max 100 characters`,
              );
            }
            if (value && value.length > 100) {
              errors.push(
                `String Select '${id}' Option ${idx + 1}: value max 100 characters`,
              );
            }
            if (description && description.length > 100) {
              errors.push(
                `String Select '${id}' Option ${idx + 1}: description max 100 characters`,
              );
            }
            // Check for duplicate values
            if (value && optionValues.includes(value)) {
              errors.push(
                `String Select '${id}': duplicate option value '${value}'`,
              );
            } else if (value) {
              optionValues.push(value);
            }
          });
        }
      }
      if (!(comp.fields.actionRowId || "").trim())
        errors.push(
          `String Select '${id || "unnamed"}': Action Row ID is required`,
        );
    }
  });
  // --- Uniqueness: container + section names must not clash (removed, now handled by allParentIds) ---
  // --- Section cross-reference validation ---
  components.forEach((comp) => {
    if (comp.type !== "section") return;
    const name = (comp.fields.name || "").trim();
    if (!name) return;
    const hasText = components.some(
      (c) =>
        c.type === "textdisplay" && (c.fields.container || "").trim() === name,
    );
    const hasAccessory = components.some(
      (c) =>
        (c.type === "thumbnail" &&
          (c.fields.container || "").trim() === name) ||
        (c.type === "buttoncv2" &&
          (c.fields.actionRowOrSection || "").trim() === name),
    );
    if (!hasText)
      errors.push(`Section "${name}": needs at least one Text Display`);
    if (!hasAccessory)
      errors.push(
        `Section "${name}": needs an accessory (Thumbnail or Button CV2)`,
      );
    const total = components.filter(
      (c) =>
        (c.type === "textdisplay" &&
          (c.fields.container || "").trim() === name) ||
        (c.type === "thumbnail" && (c.fields.container || "").trim() === name),
    ).length;
    if (total > 3)
      errors.push(`Section "${name}": max 3 components (has ${total})`);
  });
  // --- Action Row cross-reference validation ---
  components.forEach((comp) => {
    if (comp.type !== "actionrow") return;
    const rid = (comp.fields.rowId || "").trim();
    if (!rid) return; // already caught above
    const selTypes = [
      "userselect",
      "roleselect",
      "mentionableselect",
      "stringselect",
    ];
    const buttons = components.filter(
      (c) =>
        c.type === "buttoncv2" &&
        (c.fields.actionRowOrSection || "").trim() === rid,
    );
    const selects = components.filter(
      (c) =>
        selTypes.includes(c.type) &&
        (c.fields.actionRowId || "").trim() === rid,
    );
    if (buttons.length === 0 && selects.length === 0)
      errors.push(
        `Action Row "${rid}": must contain at least one button or select menu`,
      );
    if (selects.length > 1)
      errors.push(`Action Row "${rid}": can only contain one select menu`);
    if (buttons.length > 0 && selects.length > 0)
      errors.push(
        `Action Row "${rid}": cannot mix buttons and select menus in the same row`,
      );
    if (buttons.length > 5)
      errors.push(
        `Action Row "${rid}": maximum 5 buttons per row (has ${buttons.length})`,
      );
  });
  // --- Button CV2 label/emoji validation (removed, now handled above) ---
  // Show all errors and bail
  if (errors.length > 0) {
    errors.forEach((msg) => toast(msg, "e"));
    return null;
  }
  // --- Code generation ---
  const lines = [];
  const generated = new Set();
  // Helper to trim trailing empty params but keep minimum required
  function trimParams(params, minKeep) {
    const result = [...params];
    while (result.length > minKeep && result[result.length - 1] === "") {
      result.pop();
    }
    return result;
  }
  // Helper to generate a single component and its dependencies
  function generateComponent(comp) {
    if (generated.has(comp.uid)) return;
    generated.add(comp.uid);
    // Generate dependencies first (things this component references)
    if (comp.type === "textdisplay") {
      const target = (comp.fields.container || "").trim();
      if (target) {
        // Find the container or section this references
        const dep = components.find(
          (c) =>
            (c.type === "container" || c.type === "section") &&
            (c.fields.id || c.fields.name || "").trim() === target,
        );
        if (dep) generateComponent(dep);
      }
    } else if (comp.type === "separator") {
      const cid = (comp.fields.container || "").trim();
      if (cid) {
        const dep = components.find(
          (c) => c.type === "container" && (c.fields.id || "").trim() === cid,
        );
        if (dep) generateComponent(dep);
      }
    } else if (comp.type === "section") {
      const cid = (comp.fields.container || "").trim();
      if (cid) {
        const dep = components.find(
          (c) => c.type === "container" && (c.fields.id || "").trim() === cid,
        );
        if (dep) generateComponent(dep);
      }
    } else if (comp.type === "thumbnail") {
      const sectionName = (comp.fields.container || "").trim();
      if (sectionName) {
        const dep = components.find(
          (c) =>
            c.type === "section" &&
            (c.fields.name || "").trim() === sectionName,
        );
        if (dep) generateComponent(dep);
      }
    } else if (comp.type === "mediagallery") {
      const cid = (comp.fields.container || "").trim();
      if (cid) {
        const dep = components.find(
          (c) => c.type === "container" && (c.fields.id || "").trim() === cid,
        );
        if (dep) generateComponent(dep);
      }
    } else if (comp.type === "mediagalleryitem") {
      const gid = (comp.fields.galleryId || "").trim();
      if (gid) {
        const dep = components.find(
          (c) =>
            c.type === "mediagallery" &&
            (c.fields.galleryId || "").trim() === gid,
        );
        if (dep) generateComponent(dep);
      }
    } else if (comp.type === "actionrow") {
      const cid = (comp.fields.container || "").trim();
      if (cid) {
        const dep = components.find(
          (c) => c.type === "container" && (c.fields.id || "").trim() === cid,
        );
        if (dep) generateComponent(dep);
      }
    } else if (comp.type === "buttoncv2") {
      const target = (comp.fields.actionRowOrSection || "").trim();
      if (target) {
        const dep = components.find(
          (c) =>
            (c.type === "actionrow" &&
              (c.fields.rowId || "").trim() === target) ||
            (c.type === "section" && (c.fields.name || "").trim() === target),
        );
        if (dep) generateComponent(dep);
      }
    } else if (
      comp.type === "userselect" ||
      comp.type === "roleselect" ||
      comp.type === "mentionableselect" ||
      comp.type === "stringselect"
    ) {
      const rowId = (comp.fields.actionRowId || "").trim();
      if (rowId) {
        const dep = components.find(
          (c) =>
            c.type === "actionrow" && (c.fields.rowId || "").trim() === rowId,
        );
        if (dep) generateComponent(dep);
      }
    }
    // Now generate this component's code
    if (comp.type === "container") {
      const id = comp.fields.id.trim();
      const color = (comp.fields.color || "").trim();
      const spoiler = comp.fields.spoiler;
      let params = trimParams([id, color, spoiler ? "true" : ""], 1);
      lines.push(`$addContainer[${params.join(";")}]`);
    } else if (comp.type === "textdisplay") {
      const content = comp.fields.content || "";
      const target = comp.fields.container || "";
      let params = trimParams([content, target], 1);
      lines.push(`$addTextDisplay[${params.join(";")}]`);
    } else if (comp.type === "separator") {
      const divider = comp.fields.divider !== false ? "true" : "false";
      const spacing = comp.fields.spacing || "";
      const cid = comp.fields.container || "";
      let params = trimParams([divider, spacing, cid], 0);
      if (params.length === 1 && params[0] === "true") params = [];
      lines.push(`$addSeparator[${params.join(";")}]`);
    } else if (comp.type === "section") {
      const name = comp.fields.name.trim();
      const cid = comp.fields.container || "";
      let params = trimParams([name, cid], 1);
      lines.push(`$addSection[${params.join(";")}]`);
    } else if (comp.type === "thumbnail") {
      const url = comp.fields.url.trim();
      const desc = comp.fields.description || "";
      const spoiler = comp.fields.spoiler ? "true" : "";
      const sectionName = comp.fields.container.trim();
      const params = trimParams([url, desc, spoiler, sectionName], 4);
      lines.push(`$addThumbnail[${params.join(";")}]`);
    } else if (comp.type === "mediagallery") {
      const gid = comp.fields.galleryId.trim();
      const cid = comp.fields.container || "";
      let params = trimParams([gid, cid], 1);
      lines.push(`$addMediaGallery[${params.join(";")}]`);
    } else if (comp.type === "mediagalleryitem") {
      const url = comp.fields.url.trim();
      const desc = comp.fields.description || "";
      const spoiler = comp.fields.spoiler ? "true" : "";
      const gid = comp.fields.galleryId.trim();
      const params = trimParams([url, desc, spoiler, gid], 4);
      lines.push(`$addMediaGalleryItem[${params.join(";")}]`);
    } else if (comp.type === "actionrow") {
      const rid = comp.fields.rowId.trim();
      const cid = comp.fields.container || "";
      let params = trimParams([rid, cid], 1);
      lines.push(`$addActionRow[${params.join(";")}]`);
    } else if (comp.type === "buttoncv2") {
      const id = comp.fields.id.trim();
      const label = comp.fields.label || "";
      const style = comp.fields.style || "";
      const disabled = comp.fields.disabled ? "true" : "";
      const emoji = comp.fields.emoji || "";
      const target = comp.fields.actionRowOrSection.trim();
      const params = trimParams([id, label, style, disabled, emoji, target], 6);
      lines.push(`$addButtonCV2[${params.join(";")}]`);
    } else if (
      comp.type === "userselect" ||
      comp.type === "roleselect" ||
      comp.type === "mentionableselect"
    ) {
      const id = comp.fields.id.trim();
      const placeholder = comp.fields.placeholder || "";
      const min = comp.fields.min || "";
      const max = comp.fields.max || "";
      const disabled = comp.fields.disabled ? "true" : "";
      const rowId = comp.fields.actionRowId.trim();
      const funcName =
        comp.type === "userselect"
          ? "$addUserSelect"
          : comp.type === "roleselect"
            ? "$addRoleSelect"
            : "$addMentionableSelect";
      const params = trimParams(
        [id, placeholder, min, max, disabled, rowId],
        6,
      );
      lines.push(`${funcName}[${params.join(";")}]`);
    } else if (comp.type === "stringselect") {
      const id = comp.fields.id.trim();
      const placeholder = comp.fields.placeholder || "";
      const min = comp.fields.min || "";
      const max = comp.fields.max || "";
      const disabled = comp.fields.disabled ? "true" : "";
      const rowId = comp.fields.actionRowId.trim();
      const params = trimParams(
        [id, placeholder, min, max, disabled, rowId],
        6,
      );
      lines.push(`$addStringSelect[${params.join(";")}]`);
      // Immediately output options for this string select
      if (comp.options && Array.isArray(comp.options)) {
        comp.options.forEach((opt) => {
          const label = (opt.label || "").trim();
          const value = (opt.value || "").trim();
          const description = (opt.description || "").trim();
          const emoji = (opt.emoji || "").trim();
          const defaultVal = opt.default ? "true" : "";
          const selectMenuID = id; // Parent string select ID
          const optParams = trimParams(
            [label, value, description, emoji, defaultVal, selectMenuID],
            6,
          );
          lines.push(`$addStringSelectOption[${optParams.join(";")}]`);
        });
      }
    }
  }
  // Generate all components in dependency order
  components.forEach((comp) => {
    generateComponent(comp);
  });
  return lines.join("\n");
}
document.getElementById("generate-btn").addEventListener("click", () => {
  const code = generateCode();
  if (code !== null) {
    document.getElementById("output-text").value = code;
    toast("Code generated!", "s");
  }
});
document.getElementById("copy-output").addEventListener("click", () => {
  const val = document.getElementById("output-text").value;
  if (!val) {
    toast("Nothing to copy", "e");
    return;
  }
  navigator.clipboard
    .writeText(val)
    .then(() => toast("Copied!", "s"))
    .catch(() => toast("Copy failed", "e"));
});
// ── Preset Management ──
const PRESETS_KEY = "bdtools_compv2_presets";
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
document.getElementById("save-preset").addEventListener("click", () => {
  syncAllFields();
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
  const preset = {
    id: Date.now(),
    name: name.trim(),
    date: new Date().toISOString(),
    data: {
      uidCounter,
      components: JSON.parse(JSON.stringify(components)),
    },
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
      const item = document.createElement("div");
      item.style.cssText =
        "background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:0.75rem;display:flex;align-items:center;justify-content:space-between;gap:0.5rem;";
      item.innerHTML = `
            <div style="flex:1;min-width:0;">
              <div style="font-size:0.875rem;font-weight:600;color:var(--text);margin-bottom:0.25rem;">${esc(preset.name)}</div>
              <div style="font-size:0.7rem;color:var(--text3);">${dateStr} • ${preset.data.components.length} component${preset.data.components.length !== 1 ? "s" : ""}</div>
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
          if (components.length > 0) {
            if (
              !confirm(
                "Loading this preset will replace your current work. Continue?",
              )
            ) {
              return;
            }
          }
          components = JSON.parse(JSON.stringify(preset.data.components));
          uidCounter = preset.data.uidCounter;
          renderBuilder();
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
          renderPresetList(filtered);
          toast(`Preset "${preset.name}" deleted`, "s");
          if (filtered.length === 0) {
            document.getElementById("no-presets").style.display = "block";
          }
        });
      list.appendChild(item);
    });
}
loadState();
renderBuilder();
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
