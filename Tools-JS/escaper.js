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

  
    window.addEventListener('load', () => {
  if (!localStorage.getItem('visited')) {
    showToast('Welcome User, It\'s me Auora the AI behind this page.', 'success');
    localStorage.setItem('visited', 'true');
  }
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

    document.addEventListener('DOMContentLoaded', function () {
      const htmlTag = document.documentElement;
      const darkModeToggle = document.getElementById('dark-mode-toggle');
      const inputText = document.getElementById('input-text');
      const outputText = document.getElementById('output-text');
      const replaceBtn = document.getElementById('replace-btn');
      const copyOutputBtn = document.getElementById('copy-output');
      const clearInputBtn = document.getElementById('clear-input');

      function replaceText(text) {
        return text
          .replace(/\\/g, '\\\\')
          .replace(/\$/g, '%{DOL}%')
          .replace(/\]/g, '\\]')
          .replace(/;/g, '\\;');
      }

      replaceBtn.addEventListener('click', () => {
            const val = inputText.value.trim();
  if (val === 'Zubariel' || val === 'Zub' || val === 'zubariel' || val === 'zub') {
    showToast('Hello there, Zubariel is one of the contributors of this page.', 'success');
    return;
  }
  if (val === 'Auora' || val === 'auora') {
    window.open('https://www.auora.live', '_blank');;
    return;
  }

  if (val.includes('$let') || val.includes('$set') || val.includes('$get') || val.includes('$for') || val.includes('$forEach') || val.includes('$while') || val.includes('$wait') || val.includes('$repeat') || val.includes('$switch') || val.includes('$loop') || val.includes('$wait') || val.includes('&&') || val.includes('||')) {
    showToast('pssh DON\'T USE AI FOR BDFD CODES!!!', 'error');
  }

    const text = inputText.value;
        if (!text.trim()) showToast('No Code to Escape', 'error');
        else{
        outputText.value = replaceText(text);
        replaceBtn.classList.add('animate-pulse');
        setTimeout(() => replaceBtn.classList.remove('animate-pulse'), 300);
        showToast('Successfully Escaped Code', 'success');
      }
      });

      const copyBtn = document.getElementById('copy-output');
  const output = document.getElementById('output-text');

copyBtn.addEventListener('click', () => {
  if (!output.value.trim()) {
    showToast('No Code to Copy', 'error');
    return;
  }

  if (navigator.clipboard) {
    navigator.clipboard.writeText(output.value).then(() => {
      const original = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check mr-1"></i> Copied!';
      showToast('Successfully Copied Code', 'success');
      setTimeout(() => (copyBtn.innerHTML = original), 2000);
    }).catch(() => {
      showToast('Failed to copy!', 'error');
    });
  } else {

    output.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        const original = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check mr-1"></i> Copied!';
        showToast('Successfully Copied Code', 'success');
        setTimeout(() => (copyBtn.innerHTML = original), 2000);
      } else {
        showToast('Failed to copy!', 'error');
      }
    } catch {
      showToast('Failed to copy!', 'error');
    }
    window.getSelection().removeAllRanges(); 
  }
});

      clearInputBtn.addEventListener('click', () => {
        inputText.value = '';
        outputText.value = '';
        showToast('Cleared all Inputs', 'success');
      });

      inputText.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault();
          replaceBtn.click();
        }
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
  