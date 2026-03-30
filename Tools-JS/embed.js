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

function sanitizeInput(input) {
  if (!input) return input; 
  return input
    .replace(/\\/g, '\\\\')  
    .replace(/\$/g, '%{DOL}%') 
    .replace(/;/g, '\\;')     
    .replace(/\]/g, '\\]');   
}

document.addEventListener('DOMContentLoaded', () => {
  const htmlTag = document.documentElement;
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const output = document.getElementById('output-text');
  const replaceBtn = document.getElementById('replace-btn');
  const copyBtn = document.getElementById('copy-output');
  const clearBtn = document.getElementById('clear-input');

  const fieldsContainer = document.getElementById('fields-container');
  const addFieldBtn = document.getElementById('add-field-btn');
  let fieldCount = 0;

  const buttonsContainer = document.getElementById('buttons-container');
  const addButtonBtn = document.getElementById('add-button-btn');
  let buttonCount = 0;

  const selectsContainer = document.getElementById('selects-container');
  const addSelectBtn = document.getElementById('add-selectmenu-btn');
  let selectCount = 0;
  let selectOptionCount = {};

  const modalsContainer = document.getElementById('modals-container');
  const addModalBtn = document.getElementById('add-modal-btn');
  let modalCount = 0;
  let modalInputCount = {}; 

  addFieldBtn.addEventListener('click', () => {
    showToast(`Added Field #${fieldCount + 1}`);
    const idx = fieldCount++;
    const div = document.createElement('div');
    div.className = 'flex flex-wrap gap-2 items-center bg-gray-100 dark:bg-[#2e3246] p-4 rounded-lg mb-4 fade-in';
    div.innerHTML = `
    <h4 class="text-lg font-semibold mb-2">Field #${idx + 1}</h4>
      <div class="flex flex-wrap gap-2 items-center mb-2">
      <label class="flex items-center gap-2 w-full sm:w-auto">
        <input type="checkbox" id="field-inline-${idx}" class="form-checkbox h-5 w-5 rounded dark:bg-[#2e3246]" /> Inline?
      </label>
      <input id="field-name-${idx}" placeholder="Field Name" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable flex-grow sm:flex-grow-0 w-full sm:w-auto" />
      <input id="field-value-${idx}" placeholder="Field Value" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable flex-grow sm:flex-grow-0 w-full sm:w-auto" />
      </div>
      <button data-idx="${idx}" class="remove-selectmenu text-red-500 hover:text-red-700 w-max mt-2 sm:mt-0">&times; Remove Field</button>
    `;
    fieldsContainer.appendChild(div);
    updatePreview();  
  });

  fieldsContainer.addEventListener('click', e => {
      if (e.target.matches('.remove-selectmenu')) {
        const el = e.target.closest('div');
        el.classList.add('fade-out');
        setTimeout(() => {
          el.remove();
          updatePreview(); 
          showToast(`Removed Field #${Number(e.target.dataset.idx) + 1}`);
        }, 400);
      }
  });

  addButtonBtn.addEventListener('click', () => {
    showToast(`Added Button #${buttonCount + 1}`);
    const idx = buttonCount++;
    const div = document.createElement('div');
   div.className = 'flex flex-wrap gap-2 items-center bg-gray-100 dark:bg-[#2e3246] p-4 rounded-lg mb-4 fade-in';
    div.innerHTML = `
      <h4 class="text-lg font-semibold mb-2">Button #${idx + 1}</h4>
      <div class="flex flex-wrap gap-2 items-center mb-2">
        <label class="flex items-center gap-2 w-full sm:w-auto">
          <input type="checkbox" id="button-newrow-${idx}" class="form-checkbox h-5 w-5 rounded dark:bg-[#2e3246]" /> New Row?
        </label>
        <label class="flex items-center gap-2 w-full sm:w-auto">
          <input type="checkbox" id="button-disable-${idx}" class="form-checkbox h-5 w-5 rounded dark:bg-[#2e3246]" /> Disable?
        </label>
        <input id="button-idlink-${idx}" placeholder="ID or URL" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <input id="button-label-${idx}" placeholder="Button" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <select id="button-style-${idx}" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto">
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="success">Success</option>
          <option value="danger">Danger</option>
          <option value="link">Link</option>
        </select>
        <input id="button-emoji-${idx}" placeholder="Emoji ID (optional)" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <input id="button-messageid-${idx}" placeholder="Message ID (optional)" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
      </div>
      <button data-idx="${idx}" class="remove-selectmenu text-red-500 hover:text-red-700 w-max mt-2 sm:mt-0">&times; Remove Button</button>
    `;
    buttonsContainer.appendChild(div);
    updatePreview();  
  });

  buttonsContainer.addEventListener('click', e => {
      if (e.target.matches('.remove-selectmenu')) {
        const el = e.target.closest('div');
        el.classList.add('fade-out');
        setTimeout(() => {
          el.remove();
          updatePreview();  
          showToast(`Removed Button #${Number(e.target.dataset.idx) + 1}`);
        }, 400);
      }
});

  addSelectBtn.addEventListener('click', () => {
    showToast(` Added Select Menu #${selectCount + 1}`);
    const idx = selectCount++;
selectOptionCount[idx] = 0;
    const div = document.createElement('div');
    div.className = 'flex flex-wrap gap-2 items-center bg-gray-100 dark:bg-[#2e3246] p-4 rounded-lg mb-4 fade-in';
    div.innerHTML = `
      <h4 class="text-lg font-semibold mb-2">Select Menu #${idx + 1}</h4>
      <div class="flex flex-wrap gap-2 items-center mb-2">
        <input id="select-id-${idx}" placeholder="Menu ID" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <input id="select-min-${idx}" placeholder="Min Selections" type="number" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <input id="select-max-${idx}" placeholder="Max Selections" type="number" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <input id="select-placeholder-${idx}" placeholder="Placeholder (optional)" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <input id="select-messageid-${idx}" placeholder="Message ID (optional)" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
      </div>
      <div id="select-options-${idx}" class="flex flex-col gap-2 mt-4"></div>
      <button data-idx="${idx}" class="add-select-option bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow w-max mb-2">+ Add Option</button>
      <button data-idx="${idx}" class="remove-selectmenu text-red-500 hover:text-red-700 w-max">× Remove Menu</button>
    `;
    selectsContainer.appendChild(div);
  });

  selectsContainer.addEventListener('click', (e) => {
    const idx = e.target.dataset.idx;
      if (e.target.matches('.remove-selectmenu')) {
    const el = e.target.closest('div');
    el.classList.add('fade-out');
    setTimeout(() => {
      el.remove();
      updatePreview();
      showToast(`Removed Select Menu #${Number(e.target.dataset.idx) + 1}`);
      delete selectOptionCount[idx];
    }, 400);
  } else if (e.target.matches('.add-select-option')) {
      const idx = e.target.dataset.idx;
      const container = document.getElementById(`select-options-${idx}`);
      const optionIdx = selectOptionCount[idx]++;
      const div = document.createElement('div');
       div.className = 'select-option flex flex-wrap gap-2 items-center bg-gray-200 dark:bg-[#3a3f5a] p-3 rounded-md fade-in';

      div.innerHTML = `
              <label class="flex items-center gap-2 w-full sm:w-auto">
          <input type="checkbox" id="select-option-default-${idx}-${optionIdx}" class="form-checkbox h-5 w-5 rounded dark:bg-[#2e3246]" /> Default?
        </label>
        <input id="select-option-id-${idx}-${optionIdx}" placeholder="Option ID" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <input id="select-option-label-${idx}-${optionIdx}" placeholder="Label" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <input id="select-option-value-${idx}-${optionIdx}" placeholder="Value" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <input id="select-option-description-${idx}-${optionIdx}" placeholder="Description" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <input id="select-option-emoji-${idx}-${optionIdx}" placeholder="Emoji (optional)" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <input id="select-option-messageid-${idx}-${optionIdx}" placeholder="Message ID (optional)" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <button data-idx="${idx}" data-optidx="${optionIdx}" class="remove-select-option text-red-500 hover:text-red-700 w-max mt-2 sm:mt-0">× Remove Option</button>
      `;
      container.appendChild(div);
      showToast(`Added Select Menu Option #${Number(optionIdx) + 1} to Menu #${Number(idx) + 1}`);

} else if (e.target.matches('.remove-select-option')) {
  const btn = e.target.closest('.remove-select-option');
  const el = btn.closest('div');
  el.classList.add('fade-out');
  setTimeout(() => {
    el.remove();
    updatePreview();
    showToast(`Removed Select Menu Option #${Number(btn.dataset.optidx) + 1} from Menu #${Number(btn.dataset.idx) + 1}`);
  }, 400);
}
});

  addModalBtn.addEventListener('click', () => {
    showToast(`Added Modal #${modalCount + 1}`);
    const idx = modalCount++;
    modalInputCount[idx] = 0; 
    const div = document.createElement('div');
    div.className = 'flex flex-wrap gap-2 items-center bg-gray-100 dark:bg-[#2e3246] p-4 rounded-lg mb-4 fade-in';

    div.innerHTML = `
      <h4 class="text-lg font-semibold mb-2">Modal #${idx + 1}</h4>
      <div class="flex flex-wrap gap-2 items-center mb-2">
        <input id="modal-id-${idx}" placeholder="Modal ID" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <input id="modal-title-${idx}" placeholder="Modal Title" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
      </div>
      <div id="modal-textinputs-${idx}" class="flex flex-col gap-2 mt-4"></div>
      <button data-idx="${idx}" class="add-textinput bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow w-max mb-2">+ Add Text Input</button>
      <button data-idx="${idx}" class="remove-selectmenu text-red-500 hover:text-red-700 w-max">× Remove Modal</button>
    `;
    modalsContainer.appendChild(div);
  });

  modalsContainer.addEventListener('click', (e) => {
    const idx = e.target.dataset.idx;
   if (e.target.matches('.remove-selectmenu')) {
    const el = e.target.closest('div');
    el.classList.add('fade-out');
    setTimeout(() => {
      el.remove();
      showToast(`Removed Modal #${Number(e.target.dataset.idx) + 1}`);
    }, 400);
    } else if (e.target.matches('.add-textinput')) {
      const idx = e.target.dataset.idx;
      const container = document.getElementById(`modal-textinputs-${idx}`);
      const inputIdx = modalInputCount[idx]++;
      const div = document.createElement('div');
      div.className = 'select-option flex flex-wrap gap-2 items-center bg-gray-200 dark:bg-[#3a3f5a] p-3 rounded-md fade-in';

      div.innerHTML = `
              <label class="flex items-center gap-2 w-full sm:w-auto">
          <input type="checkbox" id="modal-text-required-${idx}-${inputIdx}" class="form-checkbox h-5 w-5 rounded dark:bg-[#2e3246]" /> Required?
        </label>
        <input id="modal-text-id-${idx}-${inputIdx}" placeholder="Text Input ID" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <select id="modal-text-style-${idx}-${inputIdx}" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto">
          <option value="short">Short</option>
          <option value="paragraph">Paragraph</option>
        </select>
        <input id="modal-text-label-${idx}-${inputIdx}" placeholder="Label" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <input id="modal-text-min-${idx}-${inputIdx}" type="number" placeholder="Min Length (optional)" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <input id="modal-text-max-${idx}-${inputIdx}" type="number" placeholder="Max Length (optional)" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <input id="modal-text-value-${idx}-${inputIdx}" placeholder="Default Value (optional)" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <input id="modal-text-placeholder-${idx}-${inputIdx}" placeholder="Placeholder (optional)" class="p-2 border rounded-lg dark:bg-[#2e3246] dark:text-white focusable w-full sm:w-auto" />
        <button data-idx="${idx}" data-optidx="${inputIdx}" class="remove-select-option text-red-500 hover:text-red-700 w-max mt-2 sm:mt-0">× Remove Text Input</button>
      `;
      container.appendChild(div);
      showToast(`Added Text Input #${Number(inputIdx) + 1} to Modal #${Number(idx) + 1}`);
    } else if (e.target.matches('.remove-select-option')) {
    const el = e.target.closest('div');
    el.classList.add('fade-out');
    setTimeout(() => {
      el.remove();
      showToast(`Removed Text Input #${Number(e.target.dataset.optidx) + 1} from Modal #${Number(e.target.dataset.idx) + 1}`);
    }, 400);
  }
});

  clearBtn.addEventListener('click', () => {
    const clearIds = [
      'author-input', 'author-icon-input', 'author-url-input',
      'title-input', 'title-url-input',
      'description-input',
      'thumbnail-input', 'image-input', 'color-input',
      'footer-input', 'footer-icon-input'
    ];
    clearIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    showToast('Cleared All Inputs', 'success');

    document.getElementById('timestamp-input').checked = false;

    fieldsContainer.innerHTML = '';
    buttonsContainer.innerHTML = '';
    selectsContainer.innerHTML = '';
    modalsContainer.innerHTML = '';

    fieldCount = 0;
    buttonCount = 0;
    selectCount = 0;
    modalCount = 0;

    selectOptionCount = {};
    modalInputCount = {};
    output.value = '';

    updatePreview();
  });

  function getAllComponentIds() {
  const ids = new Set();

  for (let i = 0; i < buttonCount; i++) {
    const idEl = document.getElementById(`button-idlink-${i}`);
    if (idEl && idEl.value.trim()) {
      ids.add(idEl.value.trim());
    }
  }

  for (let i = 0; i < selectCount; i++) {
    const idEl = document.getElementById(`select-id-${i}`);
    if (idEl && idEl.value.trim()) {
      ids.add(idEl.value.trim());
    }
  }

  return ids;
}

  replaceBtn.addEventListener('click', () => {
errorFlag = false;
    const author = sanitizeInput(document.getElementById('author-input').value.trim());
    const authorIcon = sanitizeInput(document.getElementById('author-icon-input').value.trim());
    const authorURL = sanitizeInput(document.getElementById('author-url-input').value.trim());

    const title = sanitizeInput(document.getElementById('title-input').value.trim());
    const titleURL = sanitizeInput(document.getElementById('title-url-input').value.trim());

    const description = sanitizeInput(document.getElementById('description-input').value.trim());

    const thumbnail = sanitizeInput(document.getElementById('thumbnail-input').value.trim());
    const image = sanitizeInput(document.getElementById('image-input').value.trim());
    const color = sanitizeInput(document.getElementById('color-input').value.trim());

    const footer = sanitizeInput(document.getElementById('footer-input').value.trim());
    const footerIcon = sanitizeInput(document.getElementById('footer-icon-input').value.trim());

    if (!author && (authorIcon || authorURL)) {
      showToast("You can't have Author Icon or URL without Author Name.", 'error');
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

    let code = '$nomention\n';

    if (author) code += `$author[${author}]\n`;
    if (authorIcon) code += `$authorIcon[${authorIcon}]\n`;
    if (authorURL) code += `$authorURL[${authorURL}]\n`;

    if (title) code += `$title[${title}]\n`;
    if (titleURL) code += `$embeddedURL[${titleURL}]\n`;

    if (description) code += `$description[${description}]\n`;

    if (thumbnail) code += `$thumbnail[${thumbnail}]\n`;
    if (image) code += `$image[${image}]\n`;
    if (color) code += `$color[${color}]\n`;

    if (footer) code += `$footer[${footer}]\n`;
    if (footerIcon) code += `$footerIcon[${footerIcon}]\n`;

    const timestamp = document.getElementById('timestamp-input').checked;
    if (timestamp) code += `$addTimestamp\n`;

const fieldElems = document.querySelectorAll('#fields-container > div');
fieldElems.forEach((fieldDiv, i) => {
  const name = sanitizeInput(fieldDiv.querySelector('input[id^="field-name-"]').value.trim());
  const value = sanitizeInput(fieldDiv.querySelector('input[id^="field-value-"]').value.trim());
  const inline = fieldDiv.querySelector('input[id^="field-inline-"]').checked ? 'yes' : 'no';

  if (!name || !value) {
    showToast(`Field ${i + 1}: Name and Value cannot be empty.`, 'error');
    errorFlag = true;
    return;
  }

  if (name === value) {
    showToast(`Field ${i + 1}: Name and Value cannot be the same.`, 'error');
    errorFlag = true;
    return;
  }

  code += `$addField[${name};${value};${inline}]\n`;
});

    const buttonElems = document.querySelectorAll('#buttons-container > div');
    buttonElems.forEach((buttonDiv, index) => {
      const idlink = sanitizeInput(buttonDiv.querySelector('input[id^="button-idlink-"]').value.trim());
      const label = sanitizeInput(buttonDiv.querySelector('input[id^="button-label-"]').value.trim());
      const style = buttonDiv.querySelector('select').value.trim();
      const newRow = buttonDiv.querySelector('input[id^="button-newrow-"]').checked ? 'yes' : 'no';
      const disable = buttonDiv.querySelector('input[id^="button-disable-"]').checked ? 'yes' : '';
      const emoji = sanitizeInput(buttonDiv.querySelector('input[id^="button-emoji-"]').value.trim());
      const msgid = sanitizeInput(buttonDiv.querySelector('input[id^="button-messageid-"]').value.trim());
      if (!idlink) { showToast(`Button ${index + 1}: Button ID/URL is required`, 'error'); return; }
      if (!label) { showToast(`Button ${index + 1}: Button Label is required`, 'error'); return; }
      code += `$addButton[${newRow};${idlink};${label};${style};${disable};${emoji};${msgid}]\n`;
    });

  const selectElems = document.querySelectorAll('#selects-container > div');
  selectElems.forEach((selectDiv, i) => {
    const menuId = sanitizeInput(selectDiv.querySelector('input[id^="select-id-"]').value.trim());
    const min = Number(selectDiv.querySelector('input[id^="select-min-"]').value);
    const max = Number(selectDiv.querySelector('input[id^="select-max-"]').value);
    const placeholder = sanitizeInput(selectDiv.querySelector('input[id^="select-placeholder-"]').value.trim());
    const msgid = sanitizeInput(selectDiv.querySelector('input[id^="select-messageid-"]').value.trim());

    if (!menuId) {
      showToast(`Select Menu ${i + 1}: Menu ID is required.`, 'error');
      errorFlag = true;
      return;
    }
    const optionElems = selectDiv.querySelectorAll('.select-option');
    console.log(`${optionElems.length}`);
    if (optionElems.length === 0) {
      showToast(`Select Menu ${i + 1}: You must add at least one option.`, 'error');
      errorFlag = true;
      return;
    }

    code += `$newSelectMenu[${menuId};${min};${max};${placeholder};${msgid}]\n`;

    optionElems.forEach((optDiv, j) => {
      const optIdInput = optDiv.querySelector('input[id^="select-option-id-"]');
      if (!optIdInput) {
        console.warn(`Select Menu ${i + 1} Option ${j + 1}: Option ID input missing`, optDiv);
        return;
      }

      const optId = sanitizeInput(optIdInput.value.trim());
      const label = sanitizeInput(optDiv.querySelector('input[id^="select-option-label-"]').value.trim());
      const value = sanitizeInput(optDiv.querySelector('input[id^="select-option-value-"]').value.trim());
      const desc = sanitizeInput(optDiv.querySelector('input[id^="select-option-description-"]').value.trim());
      const isDefault = optDiv.querySelector('input[id^="select-option-default-"]').checked ? 'yes' : '';
      const emoji = sanitizeInput(optDiv.querySelector('input[id^="select-option-emoji-"]').value.trim());
      const optMsgId = sanitizeInput(optDiv.querySelector('input[id^="select-option-messageid-"]').value.trim());

      if (!optId || !label || !value || !desc) {
        showToast(`Select Menu ${i + 1} Option ${j + 1}: Required fields missing.`, 'error');
        errorFlag = true;
        return;
      }

      if (optId !== menuId) {
        showToast(`Select Menu ${i + 1} Option ${j + 1}: Option ID must match Menu ID.`, 'error');
        errorFlag = true;
        return;
      }

      code += `$addSelectMenuOption[${optId};${label};${value};${desc};${isDefault};${emoji};${optMsgId}]\n`;
    });
  });

const modalElems = document.querySelectorAll('#modals-container > div');
modalElems.forEach((modalDiv, i) => {
  const modalId = sanitizeInput(modalDiv.querySelector('input[id^="modal-id-"]').value.trim());
  const modalTitle = sanitizeInput(modalDiv.querySelector('input[id^="modal-title-"]').value.trim());

  if (!modalId || !modalTitle) {
    showToast(`Modal ${i + 1}: ID and Title are required.`, 'error');
    errorFlag = true;
    return;
  }

  code += `$newModal[${modalId};${modalTitle}]\n`;

  const inputElements = modalDiv.querySelectorAll('input[id^="modal-text-id-"]');
  console.log(`modal input elements: ${inputElements.length}`);

  if (inputElements.length === 0) {
    showToast(`Modal ${i + 1}: You must add at least one input field.`, 'error');
    errorFlag = true;
    return;
  }

  let validInputCount = 0;

  inputElements.forEach((inputElem, j) => {
    const inputId = sanitizeInput(inputElem.value.trim());

    if (!inputId) {
      console.log(`Skipping empty input #${j + 1} in Modal ${i + 1}`);
      return;
    }

    validInputCount++;

    const styleSelect = modalDiv.querySelector(`select[id="modal-text-style-${i}-${j}"]`);
    const style = styleSelect ? styleSelect.value.trim() : '';

    const labelInput = modalDiv.querySelector(`input[id="modal-text-label-${i}-${j}"]`);
    const label = labelInput ? sanitizeInput(labelInput.value.trim()) : '';

    const minInput = modalDiv.querySelector(`input[id="modal-text-min-${i}-${j}"]`);
    const min = minInput ? Number(minInput.value) : '';

    const maxInput = modalDiv.querySelector(`input[id="modal-text-max-${i}-${j}"]`);
    const max = maxInput ? Number(maxInput.value) : '';

    const requiredCheckbox = modalDiv.querySelector(`input[id="modal-text-required-${i}-${j}"]`);
    const required = requiredCheckbox && requiredCheckbox.checked ? 'true' : 'false';

    const valueInput = modalDiv.querySelector(`input[id="modal-text-value-${i}-${j}"]`);
    const value = valueInput ? sanitizeInput(valueInput.value.trim()) : '';

    const placeholderInput = modalDiv.querySelector(`input[id="modal-text-placeholder-${i}-${j}"]`);
    const placeholder = placeholderInput ? sanitizeInput(placeholderInput.value.trim()) : '';

    if (!label) {
      showToast(`Modal ${i + 1} Input ${j + 1}: Label is required.`, 'error');
      errorFlag = true;
      return;
    }
    if (max < 0) {
      showToast(`Modal ${i + 1} Input ${j + 1}: Max length cannot be negative.`, 'error');
      errorFlag = true;
      return;
    }
    if (max > 4000) {
      showToast(`Modal ${i + 1} Input ${j + 1}: Max length cannot exceed 4000.`, 'error');
      errorFlag = true;
      return;
    }
    if (min < 0) {
      showToast(`Modal ${i + 1} Input ${j + 1}: Min length cannot be negative.`, 'error');
      errorFlag = true;
      return;
    }
    if (min > 4000) {
      showToast(`Modal ${i + 1} Input ${j + 1}: Min length cannot exceed 4000.`, 'error');
      errorFlag = true;
      return;
    }
    if (max < min) {
      showToast(`Modal ${i + 1} Input ${j + 1}: Max length cannot be less than Min length.`, 'error');
      errorFlag = true;
      return;
    }
    if (label.length > 45) {
      showToast(`Modal ${i + 1} Input ${j + 1}: Label cannot exceed 45 characters.`, 'error');
      errorFlag = true;
      return;
    }
    if (value !== '') {
      if (value.length > 4000) {
        showToast(`Modal ${i + 1} Input ${j + 1}: Default value cannot exceed 4000 characters.`, 'error');
        errorFlag = true;
        return;
      }
      if (value.length < min) {
        showToast(`Modal ${i + 1} Input ${j + 1}: Default value cannot be shorter than Min length.`, 'error');
        errorFlag = true;
        return;
      }
      if (value.length > max) {
        showToast(`Modal ${i + 1} Input ${j + 1}: Default value cannot exceed Max length.`, 'error');
        errorFlag = true;
        return;
      }
    }
    if (placeholder.length > 100) {
      showToast(`Modal ${i + 1} Input ${j + 1}: Placeholder cannot exceed 100 characters.`, 'error');
      errorFlag = true;
      return;
    }

    code += `$addTextInput[${inputId};${style};${label};${min};${max};${required};${value};${placeholder}]\n`;
  });

  if (validInputCount === 0) {
    showToast(`Modal ${i + 1}: You must add at least one valid input field.`, 'error');
    errorFlag = true;
    return;
  }
});

if (errorFlag) return; 

output.value = code.trim();
showToast('Successfully Generated Embed Code', 'success');
updatePreview();
  });

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

  document.querySelectorAll('.focusable').forEach(input => {
    input.addEventListener('focus', e => {
      e.target.style.outlineColor = htmlTag.classList.contains('dark') ? '#fff' : '#000';
    });
    input.addEventListener('blur', e => {
      e.target.style.outlineColor = '';
    });
  });

  function updatePreview() {
    const author = document.getElementById('author-input').value.trim();
    const authorIcon = document.getElementById('author-icon-input').value.trim();
    const authorURL = document.getElementById('author-url-input').value.trim();
    const title = document.getElementById('title-input').value.trim();
    const titleURL = document.getElementById('title-url-input').value.trim();
    const description = document.getElementById('description-input').value.trim();
    const thumbnail = document.getElementById('thumbnail-input').value.trim();
    const image = document.getElementById('image-input').value.trim();
    const color = document.getElementById('color-input').value.trim() || '#ffffff';
    const footer = document.getElementById('footer-input').value.trim();
    const footerIcon = document.getElementById('footer-icon-input').value.trim();
    const timestamp = document.getElementById('timestamp-input').checked;

    let fieldsHTML = '';
    const fieldElements = document.querySelectorAll('#fields-container > div');

    fieldElements.forEach((fieldDiv, i) => {

      const nameEl = document.getElementById(`field-name-${i}`);
      const valueEl = document.getElementById(`field-value-${i}`);
      const inlineEl = document.getElementById(`field-inline-${i}`);
      if (nameEl && valueEl && inlineEl) {
        const name = nameEl.value.trim() || 'Field Title';
        const value = valueEl.value.trim() || 'Field Value';
        const inline = inlineEl.checked;
        const widthClass = inline ? 'w-[47%]' : 'w-full';
        fieldsHTML += `
          <div class="${widthClass}">
            <div class="preview-field-name">${name}</div>
            <div class="preview-field-value">${value}</div>
          </div>
        `;
      }
    });
    let buttonsHTML = '';
    const buttonElements = document.querySelectorAll('#buttons-container > div');
    buttonElements.forEach(buttonDiv => {

      const labelEl = buttonDiv.querySelector('input[id^="button-label-"]');
      const styleEl = buttonDiv.querySelector('select');
      if (labelEl && styleEl) {
        const label = labelEl.value.trim() || 'Button';
        const style = styleEl.value;
        let buttonClass = '';
        switch(style) {
          case 'primary': buttonClass = 'bg-[#4752c4]'; break;
          case 'secondary': buttonClass = 'bg-[#4f545c]'; break;
          case 'success': buttonClass = 'bg-[#3ba55c]'; break;
          case 'danger': buttonClass = 'bg-[#ed4245]'; break;
          case 'link': buttonClass = 'bg-[#4f545c] hover:underline'; break;
          default: buttonClass = 'bg-[#4752c4]';
        }
        if (buttonClass === 'bg-[#4f545c] hover:underline') {
          buttonsHTML += `
            <button class="${buttonClass} text-white text-sm px-3 py-1.5 rounded font-medium transition-colors">
              ${label} <i class="fa-solid fa-up-right-from-square"></i>
            </button>`;
        } else {
          buttonsHTML += `
            <button class="${buttonClass} text-white text-sm px-3 py-1.5 rounded font-medium transition-colors">
              ${label}
            </button>`;
        }
      }
    });

    let selectHTML = '';
    const selectElements = document.querySelectorAll('#selects-container > div');
    if (selectElements.length > 0) {
      selectHTML = `
        <div class="mt-2">
          <select class="w-full px-3 py-2 bg-[#202225] text-[#dcddde] text-sm rounded border border-[#3e4147] focus:outline-none focus:border-[#00b0f4] transition-colors">
            <option disabled selected>Choose an option...</option>
      `;

      const firstSelectDiv = selectElements[0];
      const firstOptionsContainer = firstSelectDiv.querySelector('[id^="select-options-"]');
      if (firstOptionsContainer) {
        const optionDivs = firstOptionsContainer.querySelectorAll('div');
        optionDivs.forEach(optionDiv => {
          const labelEl = optionDiv.querySelector('input[placeholder="Label"]');
          if (labelEl) {
            const label = labelEl.value.trim();
            if (label) {
              selectHTML += `<option>${label}</option>`;
            }
          }
        });
      }
      selectHTML += `</select></div>`;
    }

    let modalsHTML = '';
    const modalElements = document.querySelectorAll('#modals-container > div');
    modalElements.forEach(modalDiv => {
      const modalIdEl = modalDiv.querySelector('input[placeholder="Modal ID"]');
      const modalTitleEl = modalDiv.querySelector('input[placeholder="Modal Title"]');
      if (modalIdEl && modalTitleEl) {
        const modalId = modalIdEl.value.trim();
        const modalTitle = modalTitleEl.value.trim();
        if (modalId && modalTitle) {
          modalsHTML += `<div class="mb-2"><strong>${modalTitle}</strong> (ID: ${modalId})</div>`;
        }
      }
    });

    const botProfiles = [
      { name: "Auora", avatar: "https://auora.live/auora_logo.png" },
      { name: "Auora", avatar: "https://auora.live/auora_logo.png" },
      { name: "Auora", avatar: "https://auora.live/auora_logo.png" },
      { name: "Auora", avatar: "https://auora.live/auora_logo.png" },
      { name: "Auora", avatar: "https://auora.live/auora_logo.png" },
      { name: "Auora", avatar: "https://auora.live/auora_logo.png" },
      { name: "Server Maker", avatar: "https://www.servermaker.xyz/img/ServerMakerIcon.jpg" },
      { name: "Server Maker", avatar: "https://www.servermaker.xyz/img/ServerMakerIcon.jpg" },
      { name: "Battle Shounen", avatar: "https://images-ext-1.discordapp.net/external/yH2YKRxs05C_ig-ZpavQNIxfGi2BmLz6xDy2vyPyzys/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/1356575034331889937/de53bf04eca7d0c2fd3034171c5c0d12.png?format=webp&quality=lossless&width=828&height=828" },
      { name: "Moon-Bot", avatar: "https://images-ext-1.discordapp.net/external/LdbO4DR3IU9zWa3MDyJwRLeQ8TZEt6iS9OzU3c13Buc/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/1043244110317891634/e82a8ca7a40b1657431e9553c513e127.png?format=webp&quality=lossless&width=828&height=828" }
    ];
    const randomProfile = botProfiles[Math.floor(Math.random() * botProfiles.length)];

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const dateString = 'Today at ' + timeString;

    const previewHTML = `
      <!-- Message Container -->
      <div class="relative max-w-lg mx-auto">
        <!-- Avatar -->
        <div class="absolute -top-0">
          <img id="bot-avatar" src="${randomProfile.avatar}" alt="Avatar" class="w-10 h-10 rounded-full">
        </div>

        <!-- Message Content -->
        <div class="ml-4 pl-9 space-y-1">
          <!-- Username & Timestamp -->
          <div class="flex items-center gap-1 text-sm">
            <span id="bot-name" class="text-white font-semibold">${randomProfile.name}</span>
            <span class="bg-indigo-500 text-white text-[10px] px-1.5 py-[1px] rounded">BOT</span>
            <span class="text-xs text-gray-400 ml-1">${dateString}</span>
          </div>

          <!-- Embed -->
          <div class="flex bg-[#2f3136] border-l-4" style="border-left-color: ${color}" rounded-md overflow-hidden relative">
            <div class="p-3 pr-28 w-full relative">
              <!-- Author -->
              ${author ? `
                <div class="flex items-center gap-2 text-sm mb-1">
                  ${authorIcon ? `<img src="${authorIcon}" class="w-5 h-5 rounded-full" onerror="this.style.display='none'">` : ''}
                  ${authorURL ? `<a href="${authorURL}" class="text-[#00b0f4] font-medium hover:underline">${author}</a>` : 
                    `<span class="text-[#00b0f4] font-medium">${author}</span>`}
                </div>
              ` : ''}

${title ? `<div class="text-[#00b0f4] font-semibold text-base mb-0">${titleURL ? `<a href="${titleURL}" class="hover:underline">${title}</a>` : title}</div>` : ''}

${description ? `<div class="text-sm text-[#dcddde] leading-snug preview-description mb-3">${description}</div>` : ''}

              <!-- Fields -->
              ${fieldsHTML ? `
                <div class="flex flex-wrap gap-3 mb-3">
                  ${fieldsHTML}
                </div>
              ` : ''}

              <!-- Main Image -->
              ${image ? `
                <div class="w-full max-h-[320px] overflow-hidden rounded mb-3 flex items-center justify-center">
                  <img src="${image}" alt="Main Image" class="max-w-full max-h-[320px] object-contain" onerror="this.style.display='none'">
                </div>
              ` : ''}

              <!-- Footer -->
              ${footer ? `
                <div class="flex items-center gap-2 text-xs text-[#72767d] mt-2">
                  ${footerIcon ? `<img src="${footerIcon}" alt="Footer Icon" class="w-5 h-5 rounded-full" onerror="this.style.display='none'">` : ''}
                  <span>${footer}${timestamp ? ` • ${dateString}` : ''}</span>
                </div>
              ` : timestamp ? `
                <div class="flex items-center gap-2 text-xs text-[#72767d] mt-2">
                  <span>${dateString}</span>
                </div>
              ` : ''}

              <!-- Thumbnail -->
              ${thumbnail ? `
                <img src="${thumbnail}" class="absolute top-3 right-3 w-20 h-20 rounded object-cover" alt="Thumbnail" onerror="this.style.display='none'">
              ` : ''}
            </div>
          </div>

          <!-- Buttons -->
          ${buttonsHTML ? `
            <div class="flex gap-2">
              ${buttonsHTML}
            </div>
          ` : ''}

          <!-- Select Menu -->
          ${selectHTML ? `
            <div class="mt-2">
              <select class="w-full px-3 py-2 bg-[#202225] text-[#dcddde] text-sm rounded border border-[#3e4147] focus:outline-none focus:border-[#00b0f4] transition-colors">
                <option disabled selected>Choose an option...</option>

              </select>
            </div>
          ` : ''}
        </div>
      </div>
    `;

        document.getElementById('embed-preview').innerHTML = previewHTML;
  }

  function setupPreviewListeners() {
    const inputsToWatch = [
      'author-input', 'author-icon-input', 'author-url-input',
      'title-input', 'title-url-input',
      'description-input',
      'thumbnail-input', 'image-input', 'color-input',
      'footer-input', 'footer-icon-input',
      'timestamp-input'
    ];

    inputsToWatch.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('input', updatePreview);
        if (element.type === 'checkbox') {
          element.addEventListener('change', updatePreview);
        }
      }
    });

    addFieldBtn.addEventListener('click', () => {
      setTimeout(updatePreview, 100); 
    });

    addButtonBtn.addEventListener('click', () => {
      setTimeout(updatePreview, 100);
    });

    addSelectBtn.addEventListener('click', () => {
      setTimeout(updatePreview, 100);
    });

    addModalBtn.addEventListener('click', () => {
      setTimeout(updatePreview, 100);
    });

    fieldsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-selectmenu')) {
        setTimeout(updatePreview, 100);
      }
    });

    buttonsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-selectmenu')) {
        setTimeout(updatePreview, 100);
      }
    });

    selectsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-selectmenu') || 
          e.target.classList.contains('remove-select-option')) {
        setTimeout(updatePreview, 100);
      }
    });

    modalsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-selectmenu') || 
          e.target.classList.contains('remove-select-option')) {
        setTimeout(updatePreview, 100);
      }
    });
  }

  setupPreviewListeners();
  updatePreview();
});

  function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.innerText = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }
