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

function updateCount() {
  const v = document.getElementById("inputArea").value;
  document.getElementById("inlines").textContent =
    (v ? v.split("\n").length : 0) + " lines";
}

function runIndent() {
  const raw = document.getElementById("inputArea").value;
  if (!raw.trim()) {
    toast("Nothing to indent", "e");
    return;
  }
  const sizeVal = document.getElementById("indentSize").value;
  const unit = sizeVal === "tab" ? "\t" : " ".repeat(Number(sizeVal));
  const opens = [
    "$if[",
    "$elseif[",
    "$else",
    "$loop[",
    "$try",
    "$switch[",
    "$case[",
  ];
  const closes = ["$endif", "$endloop", "$endtry", "$endswitch", "$break"];
  const mids = ["$elseif[", "$else", "$catch", "$case["];
  const lines = raw.split("\n");
  let level = 0;
  const result = lines.map((line) => {
    const trimmed = line.trim();
    const lc = trimmed.toLowerCase();
    const isClose = closes.some((t) => lc.startsWith(t.toLowerCase()));
    const isMid = mids.some((t) => lc.startsWith(t.toLowerCase()));
    if (isClose || isMid) level = Math.max(0, level - 1);
    const indented = unit.repeat(level) + trimmed;
    const isOpen = opens.some((t) => lc.startsWith(t.toLowerCase()));
    if (isOpen || isMid) level++;
    return indented;
  });
  document.getElementById("outputArea").value = result.join("\n");
  toast("Code indented", "s");
}

document.getElementById("indent-btn").addEventListener("click", runIndent);
document.getElementById("copy-btn").addEventListener("click", () => {
  const v = document.getElementById("outputArea").value;
  if (!v) {
    toast("Nothing to copy", "e");
    return;
  }
  navigator.clipboard
    .writeText(v)
    .then(() => toast("Copied", "s"))
    .catch(() => toast("Copy failed", "e"));
});
document.getElementById("clear-btn").addEventListener("click", () => {
  document.getElementById("inputArea").value = "";
  document.getElementById("outputArea").value = "";
  updateCount();
  toast("Cleared", "s");
});

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
