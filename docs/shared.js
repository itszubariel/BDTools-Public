// window.BYPASS_AUTH = true;

/* ── Theme Toggle ── */
function toggleTheme() {
  const html = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const label = document.getElementById("themeLabel");
  const isLight = html.classList.contains("light");

  if (isLight) {
    html.classList.replace("light", "dark");
    toggle.classList.add("on");
    label.textContent = "Dark Mode";
  } else {
    html.classList.replace("dark", "light");
    toggle.classList.remove("on");
    label.textContent = "Light Mode";
  }
  localStorage.setItem("theme", isLight ? "dark" : "light");
}

/* ── Apply saved theme preference on load ── */
(function () {
  const saved = localStorage.getItem("theme");
  if (saved === "light") {
    document.documentElement.classList.replace("dark", "light");
    const toggle = document.getElementById("themeToggle");
    const label = document.getElementById("themeLabel");
    if (toggle) toggle.classList.remove("on");
    if (label) label.textContent = "Light Mode";
  }
})();

/* ── Discord OAuth Configuration ── */
const DISCORD_CLIENT_ID = "1395739162635800789";
const REDIRECT_URI =
  window.DOCS_REDIRECT || window.location.origin + window.location.pathname;

/* ── Toast Notification ── */
let _tt;
function showToast(msg, color) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  const toastMsg = document.getElementById("toastMsg");
  if (toastMsg) toastMsg.textContent = msg;
  toast.style.background = color === "red" ? "#ef4444" : "#5865F2";
  toast.classList.add("show");
  clearTimeout(_tt);
  _tt = setTimeout(() => toast.classList.remove("show"), 2500);
}

/* ── API Key Management ── */
let _apiKey = "",
  _keyVisible = false;

function setStatus(msg) {
  const statusEl = document.getElementById("loginStatus");
  if (statusEl) statusEl.textContent = msg;
}

function showApp(user, apiKey) {
  _apiKey = apiKey;
  const loginOverlay = document.getElementById("loginOverlay");
  if (loginOverlay) loginOverlay.classList.add("hidden");

  const ui = document.getElementById("userInfo");
  if (ui) {
    ui.classList.remove("hidden");
    ui.classList.add("flex");
  }

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  const userAvatar = document.getElementById("userAvatar");
  const userName = document.getElementById("userName");
  if (userAvatar) userAvatar.src = avatarUrl;
  if (userName) userName.textContent = user.username;

  renderKey(false);

  // Call page-specific onAppReady hook if defined
  if (typeof window.onAppReady === "function") {
    window.onAppReady(user, apiKey);
  }
}

function renderKey(visible) {
  const el = document.getElementById("apiKeyDisplay");
  const btn = document.getElementById("toggleKeyBtn");
  if (!el || !btn) return;

  if (visible) {
    el.textContent = _apiKey;
    el.className =
      "font-mono text-sm text-green-400 tracking-widest truncate min-w-0";
    btn.textContent = "Hide";
  } else {
    el.textContent = "•".repeat(Math.min(_apiKey.length, 40));
    el.className =
      "font-mono text-sm text-gray-600 tracking-widest truncate min-w-0";
    btn.textContent = "Show";
  }
  _keyVisible = visible;
}

function toggleKeyVisibility() {
  renderKey(!_keyVisible);
}

function copyApiKey() {
  if (!_apiKey) {
    showToast("No key to copy", "red");
    return;
  }
  navigator.clipboard
    .writeText(_apiKey)
    .then(() => showToast("API key copied!"));
}

/* ── Logout ── */
function logout() {
  localStorage.removeItem("bdtools_session");
  location.reload();
}

function openLogoutModal() {
  const modal = document.getElementById("logoutModal");
  if (modal) modal.classList.remove("hidden");
}

function closeLogoutModal() {
  const modal = document.getElementById("logoutModal");
  if (modal) modal.classList.add("hidden");
}

/* ── Discord Login ── */
function loginDiscord() {
  const state = crypto.randomUUID();
  sessionStorage.setItem("oauth_state", state);
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "identify",
    state,
  });
  window.location.href =
    "https://discord.com/api/oauth2/authorize?" + params.toString();
}

/* ── OAuth Callback Handler ── */
async function handleOAuthCallback(code, state) {
  const savedState = sessionStorage.getItem("oauth_state");
  sessionStorage.removeItem("oauth_state");
  if (state && savedState && state !== savedState) {
    setStatus("❌ State mismatch — possible CSRF. Please try again.");
    return;
  }
  setStatus("Exchanging code with server…");
  try {
    const res = await fetch("/.netlify/functions/exchange-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      setStatus("❌ " + (data.error || "Login failed"));
      return;
    }
    localStorage.setItem(
      "bdtools_session",
      JSON.stringify({
        user: data.user,
        apiKey: data.apiKey,
        savedAt: Date.now(),
      }),
    );
    window.history.replaceState({}, "", window.location.pathname);
    showApp(data.user, data.apiKey);
    showToast("Welcome, " + data.user.username + "!");
  } catch (err) {
    setStatus("❌ Network error: " + err.message);
  }
}

/* ── Sidebar Scroll Spy ── */
function initScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const sideLinks = document.querySelectorAll(".sidebar-link");

  if (sections.length === 0 || sideLinks.length === 0) return;

  window.addEventListener("scroll", () => {
    let cur = "";
    sections.forEach((s) => {
      if (window.scrollY >= s.offsetTop - 120) cur = s.id;
    });
    sideLinks.forEach((l) => {
      const onclick = l.getAttribute("onclick");
      if (onclick && onclick.includes(`'${cur}'`)) {
        l.classList.add("active");
      } else {
        l.classList.remove("active");
      }
    });
  });
}

/* ── Initialization ── */
(function init() {
  if (window.BYPASS_AUTH) {
    showApp(
      { id: "000", username: "TestUser", avatar: null },
      "test-api-key-123",
    );
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");

  if (code) {
    handleOAuthCallback(code, state);
    return;
  }

  const raw = localStorage.getItem("bdtools_session");
  if (raw) {
    try {
      const session = JSON.parse(raw);
      if (Date.now() - session.savedAt < 30 * 24 * 60 * 60 * 1000) {
        showApp(session.user, session.apiKey);
        return;
      }
    } catch (_) {}
    localStorage.removeItem("bdtools_session");
  }

  // Initialize scroll spy after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScrollSpy);
  } else {
    initScrollSpy();
  }
})();

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll(".endpoint-section").forEach((section) => {
    section.classList.add("hidden");
  });

  // Show the selected section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.remove("hidden");
  }

  // Update active state in sidebar
  updateSidebarActive(sectionId);

  // Close mobile drawer if open
  closeMobileDrawer();

  // Scroll to top after DOM has reflowed (50ms delay)
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 50);
}

function updateSidebarActive(sectionId) {
  // Update left sidebar
  document
    .querySelectorAll(
      ".left-sidebar .sidebar-link, .mobile-drawer .sidebar-link",
    )
    .forEach((link) => {
      const onclick = link.getAttribute("onclick");
      if (onclick && onclick.includes(`'${sectionId}'`)) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
}

/* ── Mobile Drawer ── */
function toggleMobileDrawer() {
  const backdrop = document.getElementById("mobileDrawerBackdrop");
  const drawer = document.getElementById("mobileDrawer");
  const btn = document.getElementById("hamburgerBtn");

  if (backdrop && drawer && btn) {
    backdrop.classList.toggle("open");
    drawer.classList.toggle("open");
    btn.classList.toggle("open");
  }
}

function closeMobileDrawer() {
  const backdrop = document.getElementById("mobileDrawerBackdrop");
  const drawer = document.getElementById("mobileDrawer");
  const btn = document.getElementById("hamburgerBtn");

  if (backdrop && drawer && btn) {
    backdrop.classList.remove("open");
    drawer.classList.remove("open");
    btn.classList.remove("open");
  }
}

/* ── Scroll fade-in observer ── */
const scrollObserverOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      scrollObserver.unobserve(entry.target);
    }
  });
}, scrollObserverOptions);

window.addEventListener("load", () => {
  const fadeElements = document.querySelectorAll(".scroll-fade");
  fadeElements.forEach((el) => scrollObserver.observe(el));
});
