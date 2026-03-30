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

  
    tailwind.config = {
      darkMode: 'class',
    }
  

const bdtoolsDots = document.getElementById("bdtools-dots");
let dotCount = 0;
let bdtoolsDotInterval;

function showNextDot() {
  dotCount = (dotCount + 1) % 4; // cycle 0 -> 1 -> 2 -> 3 -> 0
  bdtoolsDots.textContent = ".".repeat(dotCount);
}

// First dot shows quickly (80ms)
setTimeout(() => {
  showNextDot();
  bdtoolsDotInterval = setInterval(showNextDot, 350); // Smooth pace
}, 80);

window.addEventListener("load", () => {
  setTimeout(() => {
    const loader = document.getElementById("bdtools-loader");
    loader.classList.add("bdtools-fade-out");
    setTimeout(() => loader.style.display = "none", 500);
    clearInterval(bdtoolsDotInterval);
  }, 1200); // Ensure at least one cycle of . .. ...
});


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

  // Update button on page load to match current mode
  updateButton();

  toggleBtn.addEventListener('click', () => {
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    updateButton();
  });
});

  function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.innerText = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

const CLIENT_ID = "1395739162635800789";
const REDIRECT_URI = "https://bdtools.netlify.app/api";
  const SCOPE = "identify";

  // Initialize login buttons
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${SCOPE}`;
  document.getElementById('header-login-btn').href = discordAuthUrl;
  document.getElementById('main-login-btn').href = discordAuthUrl;

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  async function handleAuthCode() {
    if (!code) {
      displayDashboard();
      return;
    }

    // Prevent repeated use of the same code
    if (localStorage.getItem('codeUsed') === code) {
      displayDashboard();
      return;
    }

    try {
      console.log('OAuth code:', code);
      
      // Clear the code from URL immediately so this doesn't run again on reload
      window.history.replaceState({}, document.title, '/api');

      const response = await fetch('/.netlify/functions/exchange-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.apiKey && data.user) {
        localStorage.setItem('apiKey', data.apiKey);
        localStorage.setItem('discordUser', JSON.stringify(data.user));
        localStorage.setItem('codeUsed', code); // mark this code as used
        showToast('Login successful!', 'success');
        displayDashboard();
      } else {
        console.error('Exchange-code error:', data);
        showToast(`Error during login: ${data.error || 'Unknown error'}`, 'error');
        displayDashboard();
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Error during login', 'error');
      displayDashboard();
    }
  }

  function displayDashboard() {
    const user = JSON.parse(localStorage.getItem('discordUser'));
    const apiKey = localStorage.getItem('apiKey');
    const loginCard = document.getElementById('login-container');
    const dashboard = document.getElementById('dashboard-container');

    if (user && apiKey) {
      // Show dashboard
      loginCard.classList.add('hidden');
      dashboard.classList.remove('hidden');
      
      // Update user info
      document.getElementById('avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
      
      // Show profile in header
      document.getElementById('header-login-btn').classList.add('hidden');
      document.getElementById('profile').classList.remove('hidden');
      
    } else {
      // Show login
      loginCard.classList.remove('hidden');
      dashboard.classList.add('hidden');
      document.getElementById('header-login-btn').classList.remove('hidden');
      document.getElementById('profile').classList.add('hidden');
    }
  }

  // API Key buttons
  let isKeyRevealed = false;
  document.getElementById('revealBtn')?.addEventListener('click', () => {
    const apiKey = localStorage.getItem('apiKey');
    const apiKeyElement = document.getElementById('apiKey');
    const revealBtn = document.getElementById('revealBtn');
    
    if (apiKey) {
      if (isKeyRevealed) {
        apiKeyElement.textContent = "•••••••••••••••";
        revealBtn.innerHTML = '<i class="fas fa-eye"></i>';
      } else {
        apiKeyElement.textContent = apiKey;
        revealBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
      }
      isKeyRevealed = !isKeyRevealed;
    } else {
      showToast('No API Key found', 'error');
    }
  });

  document.getElementById('copyBtn')?.addEventListener('click', () => {
    const apiKey = localStorage.getItem('apiKey');
    if (apiKey) {
      navigator.clipboard.writeText(apiKey).then(() => {
        const original = document.getElementById('copyBtn').innerHTML;
        document.getElementById('copyBtn').innerHTML = '<i class="fas fa-check mr-2"></i> Copied!';
        showToast('API Key copied!', 'success');
        setTimeout(() => {
          document.getElementById('copyBtn').innerHTML = original;
        }, 2000);
      }).catch(err => {
        console.error('Copy failed:', err);
        showToast('Failed to copy', 'error');
      });
    } else {
      showToast('No API Key found', 'error');
    }
  });
function attachCopyButton(buttonId, targetId, successMsg = 'Copied!') {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  btn.addEventListener('click', () => {
    const codeText = document.getElementById(targetId)?.innerText;
    if (!codeText) {
      showToast('No code found!', 'error');
      return;
    }

    navigator.clipboard.writeText(codeText).then(() => {
      const original = btn.innerHTML;
      btn.innerHTML = `<i class="fas fa-check mr-2"></i> ${successMsg}`;
      showToast(successMsg, 'success');
      setTimeout(() => (btn.innerHTML = original), 2000);
    }).catch(err => {
      console.error('Copy failed:', err);
      showToast('Failed to copy code', 'error');
    });
  });
}

// Attach to both buttons
attachCopyButton('copyBtn1', 'exampleCode', 'Code Copied!');
attachCopyButton('copyBtn2', 'exampleResponse', 'Response Copied!');

// API Tester
/*
document.getElementById('test-api-btn')?.addEventListener('click', async () => {
  const endpoint = document.getElementById('endpoint-input').value.trim();
  const requestBody = document.getElementById('request-body').value.trim();
  const apiKey = localStorage.getItem('apiKey');
  const responseElement = document.getElementById('api-response');

  if (!endpoint) {
    showToast('Please enter an endpoint', 'error');
    return;
  }

  if (!apiKey) {
    showToast('No API Key found', 'error');
    return;
  }

  try {
    showToast('Sending request...', 'success');
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    if (requestBody) {
      options.method = 'POST';
      options.body = requestBody;
    }

    const response = await fetch(endpoint, options);
    const data = await response.json();

    responseElement.textContent = JSON.stringify(data, null, 2);
    showToast('Request successful!', 'success');
  } catch (error) {
    console.error('API test error:', error);
    responseElement.textContent = `Error: ${error.message}`;
    showToast('Request failed', 'error');
  }
});
handleAuthCode();
*/
// Initialize the page

const exampleCode = document.getElementById("exampleCode");
const exampleResponse = document.getElementById("exampleResponse");
const endpointSelect = document.getElementById("endpoint");

const endpointExamples = {
  "submit-server": {
    code: `$nomention
$httpAddHeader[Content-Type;application/json]
$httpPost[https://api-bdtools.netlify.app/.netlify/functions/submit-server;{
  "authorId": "$authorID",
  "servers": ["server1","server2"]
}]
$httpResult`,
    response: `{
  "status": "success",
  "message": "Server submitted successfully"
}`
  },
  "get-servers": {
    code: `$nomention
$httpGet[https://api-bdtools.netlify.app/.netlify/functions/get-servers]
$httpResult`,
    response: `{
  "status": "success",
  "servers": ["server1", "server2"]
}`
  },
  "delete-server": {
    code: `$nomention
$httpDelete[https://api-bdtools.netlify.app/.netlify/functions/delete-server;{
  "serverId": "server1"
}]
$httpResult`,
    response: `{
  "status": "success",
  "message": "Server deleted successfully"
}`
  }
};

endpointSelect.addEventListener("change", () => {
  const selected = endpointSelect.value;
  exampleCode.textContent = endpointExamples[selected].code;
  exampleResponse.textContent = endpointExamples[selected].response;

  applyHighlighting('bdscript-example');
exampleResponse.textContent = endpointExamples[selected].response;
Prism.highlightElement(exampleResponse);

});

handleAuthCode();
