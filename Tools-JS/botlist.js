const myTheme = {
  defaultTextHighlight: { color: 4288341353, style: 0 },
  fallbackHighlight: { color: 4285791231, style: 0 },
  bracketHighlight: { color: 4294921292, style: 1 },
  semicolonHighlight: { color: 4294920266, style: 1 },
  functionsHighlights: {
    "$nomention": { color: 4294932473, style: 0 },
    "$catch":     { color: 4288905212, style: 0 },
    "$else":      { color: 4288905212, style: 0 },
    "$elseif":    { color: 4288905212, style: 0 },
    "$endif":     { color: 4288905212, style: 0 },
    "$endtry":    { color: 4288905212, style: 0 },
    "$error":     { color: 4288905212, style: 0 },
    "$if":        { color: 4288905212, style: 0 },
    "$try":       { color: 4288905212, style: 0 }
  }
};

const BDScriptHighlighter = (function () {
  function intToRgba(intColor) {
    if (typeof intColor !== 'number' || isNaN(intColor)) return 'rgba(228, 228, 231, 1)';
    const r = (intColor >> 16) & 0xFF;
    const g = (intColor >> 8) & 0xFF;
    const b = intColor & 0xFF;
    let a = ((intColor >> 24) & 0xFF);
    a = (isNaN(a) || a < 0 || a > 255) ? 255 : a;
    return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function safeGet(obj, path, defaultValue) {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (current === null || typeof current !== 'object' || !(key in current)) return defaultValue;
      current = current[key];
    }
    return current === undefined ? defaultValue : current;
  }

  function getStyleCss(colorInt, styleInt) {
    const color = intToRgba(colorInt);
    let fontWeight = 'normal';
    let fontStyle = 'normal';
    if (styleInt === 1 || styleInt === 3) fontWeight = 'bold';
    if (styleInt === 2 || styleInt === 3) fontStyle = 'italic';
    return `color: ${color}; font-weight: ${fontWeight}; font-style: ${fontStyle};`;
  }

  function processTextSegment(text, defaultStyleCss, bracketStyleCss, semicolonStyleCss) {
    let html = '';
    let buffer = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '[' || char === ']') {
        if (buffer) {
          html += `<span style="${defaultStyleCss}">${escapeHtml(buffer)}</span>`;
          buffer = '';
        }
        html += `<span style="${bracketStyleCss}">${escapeHtml(char)}</span>`;
      } else if (char === ';') {
        if (buffer) {
          html += `<span style="${defaultStyleCss}">${escapeHtml(buffer)}</span>`;
          buffer = '';
        }
        html += `<span style="${semicolonStyleCss}">${escapeHtml(char)}</span>`;
      } else {
        buffer += char;
      }
    }
    if (buffer) {
      html += `<span style="${defaultStyleCss}">${escapeHtml(buffer)}</span>`;
    }
    return html;
  }

  function highlight(code, themeConfig) {
    if (typeof code !== 'string') return '';
    if (typeof themeConfig !== 'object' || themeConfig === null) themeConfig = {};

    const defaultStyleCss = getStyleCss(safeGet(themeConfig, 'defaultTextHighlight.color'), safeGet(themeConfig, 'defaultTextHighlight.style'));
    const fallbackStyleCss = getStyleCss(safeGet(themeConfig, 'fallbackHighlight.color'), safeGet(themeConfig, 'fallbackHighlight.style'));
    const bracketStyleCss = getStyleCss(safeGet(themeConfig, 'bracketHighlight.color'), safeGet(themeConfig, 'bracketHighlight.style'));
    const semicolonStyleCss = getStyleCss(safeGet(themeConfig, 'semicolonHighlight.color'), safeGet(themeConfig, 'semicolonHighlight.style'));

    const functionsHighlights = safeGet(themeConfig, 'functionsHighlights', {});
    const functionMap = new Map();
    for (const funcName in functionsHighlights) {
      if (funcName.startsWith('$')) {
        functionMap.set(funcName, getStyleCss(functionsHighlights[funcName].color, functionsHighlights[funcName].style));
      }
    }

    let resultHtml = '';
    const functionRegex = /(\$[a-zA-Z0-9_]+)/g;
    let lastIndex = 0;

    code.replace(functionRegex, (match, funcName, offset) => {
      if (offset > lastIndex) {
        resultHtml += processTextSegment(code.substring(lastIndex, offset), defaultStyleCss, bracketStyleCss, semicolonStyleCss);
      }
      const funcStyleCss = functionMap.get(funcName) || fallbackStyleCss;
      resultHtml += `<span style="${funcStyleCss}">${escapeHtml(funcName)}</span>`;
      lastIndex = offset + funcName.length;
      return match;
    });

    if (lastIndex < code.length) {
      resultHtml += processTextSegment(code.substring(lastIndex), defaultStyleCss, bracketStyleCss, semicolonStyleCss);
    }

    return resultHtml;
  }

  return { highlight };
})();

function applyHighlighting(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const codeElement = container.querySelector('code');
  if (!codeElement) return;

  const rawCode = codeElement.textContent || '';
  const highlighted = BDScriptHighlighter.highlight(rawCode, myTheme);
  codeElement.innerHTML = highlighted;
}

document.addEventListener('DOMContentLoaded', () => {
  applyHighlighting('bdscript-example'); 
  applyHighlighting('output-text'); 
});

  
   document.querySelectorAll('.tooltip-container').forEach(container => {
    const icon = container.querySelector('.info-icon');

    icon.addEventListener('click', e => {
      e.stopPropagation();
      const isActive = container.classList.contains('active');

      document.querySelectorAll('.tooltip-container').forEach(c => c.classList.remove('active'));
      if (!isActive) container.classList.add('active');
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.tooltip-container').forEach(c => c.classList.remove('active'));
  });


const bdtoolsDots = document.getElementById("bdtools-dots");
let dotCount = 0;
let bdtoolsDotInterval;

function showNextDot() {
  dotCount = (dotCount + 1) % 4;
  bdtoolsDots.textContent = ".".repeat(dotCount);
}

// First dot shows quickly (80ms)
setTimeout(() => {
  showNextDot();
  bdtoolsDotInterval = setInterval(showNextDot, 350); 
}, 80);

window.addEventListener("load", () => {
  setTimeout(() => {
    const loader = document.getElementById("bdtools-loader");
    loader.classList.add("bdtools-fade-out");
    setTimeout(() => loader.style.display = "none", 500);
    clearInterval(bdtoolsDotInterval);
  }, 1200);
});


    // Dark Mode Toggle
document.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;
  const toggleBtn = document.getElementById('dark-mode-toggle');
  const icon = toggleBtn.querySelector('i');
  const textSpan = toggleBtn.querySelector('.toggle-text');

  function updateButton() {
    if (html.classList.contains('dark')) {
      icon.className = 'fas fa-sun';
      textSpan.textContent = 'Light Mode';
    } else {
      icon.className = 'fas fa-moon';
      textSpan.textContent = 'Dark Mode';
    }
  }
  updateButton();

  toggleBtn.addEventListener('click', () => {
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    updateButton();
  });
});

// Toast
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

let serversData = [];
let currentPage = 1;
let serversPerPage = window.innerWidth < 640 ? 10 : 18;

let lastFilter = 'none';
let lastSearch = '';
let lastFilterValue = 'none';

// Handle resize without resetting pagination
window.addEventListener('resize', () => {
  serversPerPage = window.innerWidth < 640 ? 10 : 30;
  renderServers(getFilteredServers());
});

// Fetch Servers
async function fetchServers(apiKey) {
  const container = document.getElementById('server-list');
  container.innerHTML = `
    <div class="loading-placeholder h-32 rounded-lg"></div>
    <div class="loading-placeholder h-32 rounded-lg"></div>
    <div class="loading-placeholder h-32 rounded-lg"></div>
  `;

  try {
    const response = await fetch('https://api-bdtools.netlify.app/get-servers', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    if (!response.ok) {
      const msg = response.status === 401
        ? 'Invalid API Key'
        : response.status === 404
          ? 'No servers found for this API Key'
          : 'Something went wrong';
      showToast(msg, 'error');
      container.innerHTML = `<p class="text-center text-red-500">${msg}</p>`;
      return;
    }

    const data = await response.json();
    serversData = data.servers || [];
    currentPage = 1;
    renderServers(getFilteredServers());
    localStorage.setItem('apiKey', apiKey);

    showToast(`Fetched ${serversData.length} servers.`, 'success');
  } catch (e) {
    console.error(e);
    container.innerHTML = `<p class="text-center text-red-500">Failed to load servers.</p>`;
    showToast('Failed to load servers.', 'error');
  }
}

// Get filtered & sorted servers
function getFilteredServers() {
  const searchValue = document.getElementById('searchInput').value.toLowerCase();
  const filter = document.getElementById('filterSelect').value;

  let filtered = serversData.filter(s => s.name.toLowerCase().includes(searchValue));
  if (filter === 'az') filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (filter === 'members') filtered.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));

  return filtered;
}

// Render Server Cards with Pagination
function renderServers(servers) {
  const container = document.getElementById('server-list');
  container.innerHTML = '';

  if (!servers || servers.length === 0) {
    container.innerHTML = `
      <p class="text-center col-span-full text-gray-500 dark:text-gray-400">
        Can't find a server with that name.
      </p>`;
    return;
  }

  const totalPages = Math.ceil(servers.length / serversPerPage);
  if (currentPage > totalPages) currentPage = totalPages; // Avoid overflow pages

  const start = (currentPage - 1) * serversPerPage;
  const end = start + serversPerPage;
  const paginatedServers = servers.slice(start, end);

  // Render server cards
  paginatedServers.forEach(server => {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-[#26293a] rounded-md shadow-lg hover:shadow-md p-4 flex flex-col items-center text-center hover:scale-105 transition-transform duration-200';

    card.innerHTML = `
      <img src="${server.icon || 'https://bdtools.netlify.app/images/bdfd_logo.png'}" 
           class="h-16 w-16 rounded-full mb-3" alt="${server.name}" />
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">${server.name}</h3>
      <p class="text-gray-500 dark:text-gray-400 text-sm mb-2">${server.description || 'No description'}</p>
      <div class="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
        <span class="flex items-center gap-1">
          <i class="fas fa-users"></i> ${server.memberCount || "null"}
        </span>
        <span class="flex items-center gap-1 text-green-500">
          <i class="fas fa-circle"></i> ${server.presenceCount || "null"}
        </span>
      </div>
      <div class="flex gap-2 mt-3">
        <button class="server-id-btn px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition text-xs">
          Server ID: ${server.id || 'Unknown'} <i class="fas fa-copy ml-1"></i>
        </button>
        <button class="owner-id-btn px-3 py-1 bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-700 transition text-xs">
          Owner ID: ${server.ownerId || 'Unknown'} <i class="fas fa-copy ml-1"></i>
        </button>
      </div>
    `;

    container.appendChild(card);

    // Add copy listeners
    card.querySelector('.server-id-btn').addEventListener('click', () => copyToClipboard(server.id, 'Server ID'));
    card.querySelector('.owner-id-btn').addEventListener('click', () => copyToClipboard(server.ownerId, 'Owner ID'));
  });

  renderPagination(totalPages, servers);
}

// Copy to clipboard
function copyToClipboard(text, label) {
  if (!text || text === 'Unknown') {
    showToast(`${label} not available`, 'error');
    return;
  }
  navigator.clipboard.writeText(text)
    .then(() => showToast(`${label} copied to clipboard!`, 'success'))
    .catch(() => showToast(`Failed to copy ${label}`, 'error'));
}

// Pagination
function renderPagination(totalPages, servers) {
  let paginationContainer = document.getElementById('pagination-container');
  if (!paginationContainer) {
    paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination-container';
    paginationContainer.className = 'flex justify-center items-center gap-2 mt-8 flex-wrap';
    document.querySelector('#pagination').appendChild(paginationContainer);
  }
  paginationContainer.innerHTML = '';

  if (totalPages > 1) {
    const createBtn = (text, onClick, isActive = false) => {
      const btn = document.createElement('button');
      btn.textContent = text;
      btn.className = `px-3 py-1 rounded-md text-sm ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-[#2e3246] text-gray-800 dark:text-gray-100'}`;
      btn.addEventListener('click', () => { onClick(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
      return btn;
    };

    if (currentPage > 1) {
      paginationContainer.appendChild(createBtn('First', () => { currentPage = 1; renderServers(servers); }));
      paginationContainer.appendChild(createBtn('Prev', () => { currentPage--; renderServers(servers); }));
    }

    for (let i = 1; i <= totalPages; i++) {
      paginationContainer.appendChild(createBtn(i, () => { currentPage = i; renderServers(servers); }, i === currentPage));
    }

    if (currentPage < totalPages) {
      paginationContainer.appendChild(createBtn('Next', () => { currentPage++; renderServers(servers); }));
      paginationContainer.appendChild(createBtn('Last', () => { currentPage = totalPages; renderServers(servers); }));
    }
  }
}

// Filter with prevention of false resets
function handleFilterChange() {
  const filterSelect = document.getElementById('filterSelect');
  if (filterSelect.value === lastFilterValue) return; // Ignore false triggers
  lastFilterValue = filterSelect.value;
  currentPage = 1;
  renderServers(getFilteredServers());
}

// Search Input
document.getElementById('searchInput').addEventListener('input', () => {
  currentPage = 1;
  renderServers(getFilteredServers());
});

// Filter Select
document.getElementById('filterSelect').addEventListener('change', handleFilterChange);

// Show Servers
document.getElementById('showServersBtn').addEventListener('click', () => {
  const apiKey = document.getElementById('apiKeyInput').value.trim();
  if (!apiKey) {
    showToast('Please enter your API Key', 'error');
    return;
  }
  fetchServers(apiKey);
});

// Auto-load API Key
window.addEventListener('DOMContentLoaded', () => {
  const savedKey = localStorage.getItem('apiKey');
  if (savedKey) {
    document.getElementById('apiKeyInput').value = savedKey;
    fetchServers(savedKey);
  }
});
