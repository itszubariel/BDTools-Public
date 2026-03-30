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

// ========== Highlighter Logic ==========
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
  applyHighlighting('bdscript-example'); // ID of your wrapper div
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

document.querySelectorAll('.bdscript-example').forEach(el => {
  const rawCode = el.textContent.trim();
  const highlighted = BDScriptHighlighter.highlight(rawCode, myTheme);
  el.innerHTML = highlighted;
});

function sanitizeInput(str) {
  return str
    .replace(/\\/g, '\\\\')  
    .replace(/\$/g, '%{DOL}%') 
    .replace(/;/g, '\\;')    
    .replace(/]/g, '\\]');   
}

  function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.innerText = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

  function updatePreview() {
  const author = document.getElementById('author-input').value.trim();
  const authorIcon = document.getElementById('author-icon-input').value.trim();
  const title = document.getElementById('title-input').value.trim();
  const titleURL = document.getElementById('title-url-input').value.trim();
  const description = document.getElementById('description-input').value.trim();
  const thumbnail = document.getElementById('thumbnail-input').value.trim();
  const image = document.getElementById('image-input').value.trim();
  const color = document.getElementById('color-input').value.trim() || '#ffffff'; 
  const footer = document.getElementById('footer-input').value.trim();
  const footerIcon = document.getElementById('footer-icon-input').value.trim();
  const timestampChecked = document.getElementById('timestamp-input')?.checked ? 'yes' : 'no';
  const returnID = document.getElementById('messageID-input')?.checked ? 'yes' : 'no';

  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const dateString = 'Today at ' + timeString;

  const botName = 'Auora';
  const botAvatarURL = 'https://auora.live/auora_logo.png';

  const previewHTML = `
    <div class="relative max-w-lg mx-auto">
      <div class="absolute -top-0">
        <img src="${botAvatarURL}" alt="Bot Avatar" class="w-10 h-10 rounded-full" />
      </div>
      <div class="ml-4 pl-9 space-y-1">
        <div class="flex items-center gap-1 text-sm">
          <span class="text-white font-semibold">${botName}</span>
          <span class="bg-indigo-500 text-white text-[10px] px-1.5 py-[1px] rounded">BOT</span>
          <span class="text-xs text-gray-400 ml-1">${timestampChecked ? dateString : 'yes'}</span>
        </div>

        <div class="flex bg-[#2f3136] border-l-4 rounded-md overflow-hidden" style="border-left-color: ${color}">
          <div class="p-3 pr-28 w-full relative">
            ${author ? `
              <div class="flex items-center gap-2 text-sm mb-1">
                ${authorIcon ? `<img src="${authorIcon}" class="w-5 h-5 rounded-full" onerror="this.style.display='none'">` : ''}
                ${titleURL ? `<a href="${titleURL}" class="text-[#00b0f4] font-medium hover:underline">${author}</a>` : `<span class="text-[#00b0f4] font-medium">${author}</span>`}
              </div>
            ` : ''}

            ${title ? `<div class="text-[#00b0f4] font-semibold text-base mb-0">${titleURL ? `<a href="${titleURL}" class="hover:underline">${title}</a>` : title}</div>` : ''}

            ${description ? `<div class="text-sm text-[#dcddde] leading-snug preview-description mb-3">${description}</div>` : ''}

            ${image ? `
              <div class="w-full max-h-[320px] overflow-hidden rounded mb-3 flex items-center justify-center">
                <img src="${image}" alt="Main Image" class="max-w-full max-h-[320px] object-contain" onerror="this.style.display='none'">
              </div>
            ` : ''}

            ${footer ? `
              <div class="flex items-center gap-2 text-xs text-[#72767d] mt-2">
                ${footerIcon ? `<img src="${footerIcon}" alt="Footer Icon" class="w-5 h-5 rounded-full" onerror="this.style.display='none'">` : ''}
                <span>${footer}${timestampChecked ? ` • ${dateString}` : ''}</span>
              </div>
            ` : timestampChecked ? `
              <div class="flex items-center gap-2 text-xs text-[#72767d] mt-2">
                <span>${dateString}</span>
              </div>
            ` : ''}

            ${thumbnail ? `
              <img src="${thumbnail}" class="absolute top-3 right-3 w-20 h-20 rounded object-cover" alt="Thumbnail" onerror="this.style.display='none'">
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('embed-preview').innerHTML = previewHTML;
}

function generateEmbedCode() {
  const channelID = sanitizeInput(document.getElementById('channelID-input').value.trim());
  const content = sanitizeInput(document.getElementById('content-input').value.trim());

  const title = sanitizeInput(document.getElementById('title-input').value.trim());
  const titleURL = sanitizeInput(document.getElementById('title-url-input').value.trim());

  const description = sanitizeInput(document.getElementById('description-input').value.trim());

  const color = sanitizeInput(document.getElementById('color-input').value.trim());

  const author = sanitizeInput(document.getElementById('author-input').value.trim());
  const authorIcon = sanitizeInput(document.getElementById('author-icon-input').value.trim());

  const footer = sanitizeInput(document.getElementById('footer-input').value.trim());
  const footerIcon = sanitizeInput(document.getElementById('footer-icon-input').value.trim());

  const thumbnail = sanitizeInput(document.getElementById('thumbnail-input').value.trim());
  const image = sanitizeInput(document.getElementById('image-input').value.trim());

const timestampChecked = document.getElementById('timestamp-input')?.checked ? 'yes' : 'no';
const returnID = document.getElementById('messageID-input')?.checked ? 'yes' : 'no';


  if (!channelID) {
    showToast('Please enter a Channel ID', 'error');
    return '';
  }
   if (!author && authorIcon) {
      showToast("You can't have Author Icon without Author Name.", 'error');
      return;
    }
    if (!title && titleURL) {
      showToast("You can't have Title URL without Title.", 'error');
      return;
    }
    if (!footer && footerIcon) {
      showToast("You can't have Footer Icon without Footer text.", 'error');
      return;
    }

  const embedCode = `$sendEmbedMessage[${channelID};${content};${title};${titleURL};${description};${color};${author};${authorIcon};${footer};${footerIcon};${thumbnail};${image};${timestampChecked};${returnID}]`;

  return embedCode;
}

  document.addEventListener('DOMContentLoaded', () => {

    const inputsToWatch = [
      'author-input', 'author-icon-input', 'title-input', 'title-url-input', 'description-input',
      'thumbnail-input', 'image-input', 'color-input', 'footer-input', 'footer-icon-input', 'timestamp-input'
    ];

    inputsToWatch.forEach(id => {
      const el = document.getElementById(id);
      if(el) {
        el.addEventListener('input', updatePreview);
        if(el.type === 'checkbox') el.addEventListener('change', updatePreview);
      }
    });

    document.getElementById('clear-input').addEventListener('click', () => {
      [
        'channelID-input', 'content-input', 'author-input', 'author-icon-input',
        'title-input', 'title-url-input', 'description-input',
        'thumbnail-input', 'image-input', 'color-input',
        'footer-input', 'footer-icon-input'
      ].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = '';
      });
      ['timestamp-input', 'messageID-input'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.checked = false;
      });
      document.getElementById('output-text').value = '';
      showToast('Cleared All Inputs', 'success');
      updatePreview();
    });

    document.getElementById('replace-btn').addEventListener('click', () => {
  const channelID = document.getElementById('channelID-input').value.trim();

       if (!channelID) {
    showToast('Please enter a Channel ID', 'error');
    return; 
  }
  const embedCode = generateEmbedCode();
  const output = document.getElementById('output-text');

  output.value = embedCode;

  if(embedCode) {
    showToast('Successfully Generated Embed Code', 'success');
    updatePreview();
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

    updatePreview();
  });
