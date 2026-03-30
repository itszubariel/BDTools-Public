const bdtoolsDots = document.getElementById("bdtools-dots");
let dotCount = 0;
let bdtoolsDotInterval;

function showNextDot() {
  dotCount = (dotCount + 1) % 4; 
  bdtoolsDots.textContent = ".".repeat(dotCount);
}


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



const myTheme = {
  defaultTextHighlight: { color: 4288341353, style: 0 },
  fallbackHighlight: { color: 4285791231, style: 0 },
  numberHighlight: { color: 4285791231, style: 0 },
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
    "$if":        { color: 4288905212, style: 0 }
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
    const numberStyleCss = getStyleCss(safeGet(themeConfig, 'numberHighlight.color'), safeGet(themeConfig, 'numberHighlight.style'));

    const functionsHighlights = safeGet(themeConfig, 'functionsHighlights', {});
    const functionMap = new Map();
    for (const funcName in functionsHighlights) {
      if (funcName.startsWith('$')) {
        functionMap.set(funcName, getStyleCss(functionsHighlights[funcName].color, functionsHighlights[funcName].style));
      }
    }

    // First pass: highlight numbers
    let resultHtml = '';
    const numberRegex = /(-?\d*\.?\d+)/g;
    let numLastIndex = 0;
    let tempHtml = '';

    code.replace(numberRegex, (match, number, offset) => {
      if (offset > numLastIndex) {
        tempHtml += code.substring(numLastIndex, offset);
      }
      tempHtml += `<span style="${numberStyleCss}">${escapeHtml(number)}</span>`;
      numLastIndex = offset + number.length;
      return match;
    });
    if (numLastIndex < code.length) {
      tempHtml += code.substring(numLastIndex);
    }

    // Second pass on tempHtml: highlight functions, brackets, semicolons
    const functionRegex = /(\$[a-zA-Z0-9_]+)/g;
    let lastIndex = 0;

    tempHtml.replace(functionRegex, (match, funcName, offset) => {
      if (offset > lastIndex) {
        resultHtml += processTextSegment(tempHtml.substring(lastIndex, offset), defaultStyleCss, bracketStyleCss, semicolonStyleCss);
      }
      const funcStyleCss = functionMap.get(funcName) || fallbackStyleCss;
      resultHtml += `<span style="${funcStyleCss}">${escapeHtml(funcName)}</span>`;
      lastIndex = offset + funcName.length;
      return match;
    });

    if (lastIndex < tempHtml.length) {
      resultHtml += processTextSegment(tempHtml.substring(lastIndex), defaultStyleCss, bracketStyleCss, semicolonStyleCss);
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

    updateButton();

    toggleBtn.addEventListener('click', () => {
      const isDark = html.classList.toggle('dark');
      localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
      updateButton();
    });
  });
  
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
    { name: "$if", color: "#8b5cf6", style: 0 }
  ];
  
  const allPossibleFunctions = [
      "$addButton[]","$addCmdReactions[]","$addEmoji[]","$addField[]","$addMessageReactions[]","$addReactions[]",
      "$addSelectMenuOption[]","$addTextInput[]","$addTimestamp","$addTimestamp[]","$afkChannelID","$afkTimeout[]",
      "$aiQuota","$ai[]","$allMembersCount","$allowMention","$allowRoleMentions[]","$allowUserMentions[]",
      "$alternativeParsing","$and[]","$appendOptionSuggestion[]","$argCount[]","$argsCheck[]","$async[]",
      "$authorAvatar","$authorID","$authorIcon[]","$authorOfMessage[]","$authorURL[]","$author[]",
      "$autoCompleteOptionName","$autoCompleteOptionValue","$awaitFunc[]","$awaitReactions[]","$await[]","$ban",
      "$banID","$banID[]","$ban[]","$blackListIDs[]","$blackListRolesIDs[]","$blackListRoles[]","$blackListServers[]",
      "$blackListUsers[]","$boostCount","$boostCount[]","$boostLevel","$botCommands[]","$botID","$botLeave",
      "$botLeave[]","$botListDescription[]","$botListHide","$botNode","$botOwnerID","$botTyping","$byteCount[]",
      "$c[]","$calculate[]","$catch","$categoryChannels[]","$categoryCount","$categoryCount[]","$categoryID[]",
      "$ceil[]","$changeCooldownTime[]","$changeUsernameWithID[]","$changeUsername[]","$channelCount",
      "$channelExists[]","$channelID","$channelIDFromName[]","$channelID[]","$channelName[]","$channelNames[]",
      "$channelPosition","$channelPosition[]","$channelSendMessage[]","$channelTopic","$channelTopic[]",
      "$channelType[]","$charCount[]","$checkCondition[]","$checkContains[]","$checkUserPerms[]","$clear",
      "$clearReactions[]","$clear[]","$closeTicket[]","$colorRole[]","$color[]","$commandFolder","$commandName",
      "$commandTrigger","$commandsCount","$cooldown[]","$createChannel[]","$createRole[]","$creationDate[]",
      "$cropText[]","$customEmoji[]","$customID","$customImage[]","$date","$day","$defer","$deleteChannelsByName[]",
      "$deleteChannels[]","$deleteIn[]","$deleteMessage[]","$deleteRole[]","$deletecommand","$description[]",
      "$disableInnerSpaceRemoval","$disableSpecialEscaping","$discriminator[]","$displayName","$displayName[]",
      "$divide[]","$dm","$dmChannelID[]","$dm[]","$editButton[]","$editChannelPerms[]","$editEmbedIn[]","$editIn[]",
      "$editMessage[]","$editSelectMenuOption[]","$editSelectMenu[]","$editSplitText[]","$editThread[]","$else",
      "$elseif[]","$embedSuppressErrors[]","$embeddedURL[]","$emojiExists[]","$emojiName[]","$emoteCount",
      "$enableDecimals[]","$enabled[]","$endasync","$endif","$endtry","$ephemeral","$error[]","$eval[]",
      "$executionTime","$findChannel[]","$findRole[]","$findUser[]","$floor[]","$footerIcon[]","$footer[]",
      "$getAttachments[]","$getBanReason[]","$getBotInvite","$getChannelVar[]","$getCooldown[]","$getCustomStatus[]",
      "$getEmbedData[]","$getInviteInfo[]","$getLeaderboardPosition[]","$getLeaderboardValue[]","$getMessage[]",
      "$getReactions[]","$getRoleColor[]","$getServerInvite","$getServerInvite[]","$getServerVar[]","$getSlowmode[]",
      "$getTextSplitIndex[]","$getTextSplitLength","$getTimestamp","$getTimestamp[]","$getUserStatus[]",
      "$getUserVar[]","$getVar[]","$giveRole[]","$globalCooldown[]","$globalUserLeaderboard[]","$guildBanner[]",
      "$guildExists[]","$guildID","$guildID[]","$hasRole[]","$highestRole","$highestRoleWithPerms[]",
      "$highestRole[]","$hostingExpireTime","$hostingExpireTime[]","$hour","$httpAddHeader[]","$httpDelete[]",
      "$httpGetHeader[]","$httpGet[]","$httpPatch[]","$httpPost[]","$httpPut[]","$httpRemoveHeader[]","$httpResult",
      "$httpResult[]","$httpStatus","$hypesquad[]","$if[]","$ignoreChannels[]","$ignoreLinks","$ignoreTriggerCase",
      "$image[]","$input[]","$isAdmin[]","$isBanned[]","$isBoolean[]","$isBooster[]","$isBot[]","$isEmojiAnimated[]",
      "$isHoisted[]","$isInteger[]","$isMentionable[]","$isMentioned[]","$isMessageEdited[]","$isNSFW[]",
      "$isNumber[]","$isSlash","$isTicket[]","$isTimedOut[]","$isUserDMEnabled[]","$isValidHex[]","$joinSplitText[]",
      "$jsonArrayAppend[]","$jsonArrayCount[]","$jsonArrayIndex[]","$jsonArrayPop[]","$jsonArrayReverse[]",
      "$jsonArrayShift[]","$jsonArraySort[]","$jsonArrayUnshift[]","$jsonArray[]","$jsonClear","$jsonExists[]",
      "$jsonJoinArray[]","$jsonParse[]","$jsonPretty[]","$jsonSetString[]","$jsonSet[]","$jsonStringify","$jsonUnset[]",
      "$json[]","$kick","$kickMention","$kickMention[]","$kick[]","$lastMessageID","$lastPinTimestamp",
      "$linesCount[]","$logQuota","$log[]","$lowestRole","$lowestRoleWithPerms[]","$lowestRole[]","$max[]",
      "$membersCount","$membersCount[]","$mentionedChannels[]","$mentionedRoles[]","$mentioned[]","$message",
      "$messageEditedTimestamp[]","$messageID","$message[]","$min[]","$minute","$modifyChannelPerms[]",
      "$modifyChannel[]","$modifyRolePerms[]","$modifyRole[]","$modulo[]","$month","$multi[]","$mute[]",
      "$newModal[]","$newSelectMenu[]","$newTicket[]","$nickname","$nickname[]","$noMentionMessage",
      "$noMentionMessage[]","$nodeVersion","$nodeVersion[]","$nomention","$numberSeparator[]","$onlyAdmin[]",
      "$onlyBotChannelPerms[]","$onlyBotPerms[]","$onlyForCategories[]","$onlyForChannels[]","$onlyForIDs[]",
      "$onlyForRoleIDs[]","$onlyForRoles[]","$onlyForServers[]","$onlyForUsers[]","$onlyIfMessageContains[]",
      "$onlyIf[]","$onlyNSFW[]","$onlyPerms[]","$optOff[]","$or[]","$parentID","$parentID[]","$pinMessage",
      "$pinMessage[]","$ping","$premiumExpireTime","$premiumExpireTime[]","$publishMessage[]","$random",
      "$randomCategoryID[]","$randomChannelID","$randomGuildID","$randomMention","$randomRoleID[]","$randomString[]",
      "$randomText[]","$randomUser","$randomUserID","$random[]","$registerGuildCommands","$registerGuildCommands[]",
      "$removeAllComponents","$removeAllComponents[]","$removeButtons","$removeButtons[]","$removeComponent[]",
      "$removeContains[]","$removeEmoji[]","$removeLinks","$removeLinks[]","$removeSplitTextElement[]",
      "$repeatMessage[]","$replaceText[]","$repliedMessageID","$repliedMessageID[]","$reply","$replyIn[]","$reply[]",
      "$resetChannelVar[]","$resetServerVar[]","$resetUserVar[]","$roleCount","$roleExists[]","$roleGrant[]",
      "$roleID[]","$roleInfo[]","$roleName[]","$roleNames","$rolePerms[]","$rolePosition[]","$round[]",
      "$rulesChannelID[]","$scriptLanguage","$second","$sendEmbedMessage[]","$sendMessage[]","$sendNotification[]",
      "$serverChannelExists[]","$serverCooldown[]","$serverCount","$serverDescription","$serverDescription[]",
      "$serverEmojis[]","$serverIcon","$serverIcon[]","$serverInfo[]","$serverLeaderboard[]","$serverName[]",
      "$serverNames","$serverNames[]","$serverOwner","$serverOwner[]","$serverRegion","$serverVerificationLvl",
      "$setChannelVar[]","$setServerVar[]","$setUserRoles[]","$setUserVar[]","$setVar[]","$shardID","$shardID[]",
      "$slashCommandsCount","$slashID","$slashID[]","$slowmode[]","$sort[]","$splitText[]","$sqrt[]","$startThread[]",
      "$stop","$sub[]","$sum[]","$suppressErrorLogging","$suppressErrors","$suppressErrors[]","$systemChannelID",
      "$takeRole[]","$textSplit[]","$threadAddMember[]","$threadMessageCount","$threadRemoveMember[]",
      "$threadUserCount","$thumbnail[]","$time[]","$timeout[]","$title[]","$toLowercase[]","$toTitleCase[]",
      "$toUppercase[]","$trimContent","$trimSpace[]","$try","$tts","$unban","$unbanID","$unbanID[]","$unescape[]",
      "$unmute[]","$unpinMessage[]","$unregisterGuildCommands","$unregisterGuildCommands[]","$untimeout[]",
      "$uptime","$url[]","$useChannel[]","$usedEmoji","$userAvatar[]","$userBadges[]","$userBannerColor[]",
      "$userBanner[]","$userExists[]","$userID[]","$userInfo[]","$userJoinedDiscord[]","$userJoined[]",
      "$userLeaderboard[]","$userPerms[]","$userReacted[]","$userRoles[]","$userServerAvatar[]","$username",
      "$username[]","$varExistError[]","$varExists[]","$var[]","$variablesCount[]","$voiceUserLimit[]",
      "$webhookAvatarURL[]","$webhookColor[]","$webhookContent[]","$webhookCreate[]","$webhookDelete[]",
      "$webhookDescription[]","$webhookFooter[]","$webhookSend[]","$webhookTitle[]","$webhookUsername[]","$year"
    ];

 const savedTheme = localStorage.getItem('savedTheme');
 const theme = {};

 if (savedTheme) { 
  Object.assign(theme, JSON.parse(savedTheme));
 } else {
  baseItems.forEach((item) => (theme[item.name] = { color: item.color, style: item.style }));
 }

  const listContainer = document.getElementById("functions-list");
  const modal = document.getElementById("edit-modal");
  const colorPickerDiv = document.getElementById("color-picker");
  const hexInput = document.getElementById("hex-input");
  const preview = document.getElementById("preview");
  const styleButtons = document.querySelectorAll(".style-btn");
  const deleteModal = document.getElementById("delete-modal");
  const cancelDeleteBtn = document.getElementById("cancel-delete");
  const confirmDeleteBtn = document.getElementById("confirm-delete");
  const generateCodeBtn = document.getElementById("generate-code-btn");
  const generatedCodeTextarea = document.getElementById("generated-code");

  let currentFn = null;
  let fnToDelete = null;
  let tempStyle = 0; // Track currently selected style in modal BEFORE saving

  const pickr = Pickr.create({
    el: colorPickerDiv,
    theme: "classic",
    default: "#8b5cf6",
    components: {
      preview: true,
      opacity: false,
      hue: true,
      interaction: {
        hex: true,
        input: true,
        clear: false,
        save: false,
      },
    },
  });

  // Sync color picker and hex input, update theme & preview live
  pickr.on("change", (color) => {
    const hex = color.toHEXA().toString();
    hexInput.value = hex;
    if (currentFn) {
      theme[currentFn].color = hex;
      updatePreview();
    }
    const pickrColorSwatch = document.querySelector('.pcr-button');
    if (pickrColorSwatch) {
      pickrColorSwatch.style.setProperty('--pcr-color', hex);
    }
  });

  hexInput.addEventListener("input", () => {
    if (!currentFn) return;
    let val = hexInput.value.toUpperCase().trim();
    if (!val.startsWith('#')) {
      val = '#' + val;
      hexInput.value = val;
    }
    if (val.length > 7) {
      val = val.substring(0, 7);
      hexInput.value = val;
    }
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      theme[currentFn].color = val;
      pickr.setColor(val);
      updatePreview();
    }
  });

  function renderList() {
    listContainer.innerHTML = "";
    Object.keys(theme).forEach((fn, idx) => createFunctionCard(fn, idx));
  }

  function createFunctionCard(fn, idx) {
    const div = document.createElement("div");
    div.className =
      "p-4 bg-white dark:bg-[#26293a] rounded shadow flex justify-between items-center";

    const badge = document.createElement("span");
    badge.className = "w-4 h-4 rounded-full mr-2 flex-shrink-0";
    badge.style.background = theme[fn].color;

    const name = document.createElement("span");
    name.textContent = fn;
    name.className = "font-mono flex-1 text-sm";

    const controls = document.createElement("div");
    controls.className = "flex gap-2";

    const edit = document.createElement("button");
    edit.className =
      "edit-btn text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-600 p-1";
    edit.setAttribute("aria-label", `Edit ${fn}`);
    edit.innerHTML = '<i class="fas fa-pen-to-square"></i>';
    edit.dataset.fn = fn;
    controls.appendChild(edit);

    if (idx >= 5) {
      const remove = document.createElement("button");
      remove.className =
        "remove-btn text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-600 p-1";
      remove.setAttribute("aria-label", `Remove ${fn}`);
      remove.innerHTML = '<i class="fas fa-trash"></i>';
      remove.dataset.fn = fn;
      controls.appendChild(remove);
    }

    div.append(badge, name, controls);
    listContainer.appendChild(div);
  }

  renderList();

  const importThemeBtn = document.getElementById('import-theme-btn');
const importOverlay = document.getElementById('import-theme-overlay');
const importTextarea = document.getElementById('import-theme-textarea');
const cancelImportBtn = document.getElementById('cancel-import-btn');
const applyImportBtn = document.getElementById('apply-import-btn');
const importErrorMsg = document.getElementById('import-error-msg');

function uint32ToHex(uint32) {
  const red = (uint32 >> 16) & 0xff;
  const green = (uint32 >> 8) & 0xff;
  const blue = uint32 & 0xff;

  return `#${red.toString(16).padStart(2, '0')}${green
    .toString(16)
    .padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
}

importThemeBtn.addEventListener('click', () => {
  importErrorMsg.style.display = 'none';
  importTextarea.value = '';
  importOverlay.style.display = 'flex';
});

cancelImportBtn.addEventListener('click', () => {
  importOverlay.style.display = 'none';
});

applyImportBtn.addEventListener('click', () => {
  const text = importTextarea.value.trim();
  if (!text) {
    importErrorMsg.textContent = 'Please paste a JSON theme.';
    importErrorMsg.style.display = 'block';
    return;
  }
  let importedTheme;
  try {
    importedTheme = JSON.parse(text);
  } catch {
    importErrorMsg.textContent = 'Invalid JSON format.';
    importErrorMsg.style.display = 'block';
    return;
  }

  const baseKeyMap = {
    defaultTextHighlight: "Default Text",
    fallbackHighlight: "Fallback",
    numberHighlight: "Numbers",
    bracketHighlight: "[][]",
    semicolonHighlight: ";;;"
  };

  // Clear current theme
  Object.keys(theme).forEach(k => delete theme[k]);

  // Apply base highlights if present
  for (const [key, val] of Object.entries(importedTheme)) {
    if (key === 'functionsHighlights') continue;
    if (baseKeyMap[key] && val && typeof val.color === 'number' && typeof val.style === 'number') {
      theme[baseKeyMap[key]] = {
        color: uint32ToHex(val.color),
        style: val.style,
      };
    }
  }

// Apply functionsHighlights if present
if (
  importedTheme.functionsHighlights &&
  typeof importedTheme.functionsHighlights === "object"
) {
  for (const [fn, val] of Object.entries(
    importedTheme.functionsHighlights
  )) {
    if (
      val &&
      typeof val.color === "number" &&
      typeof val.style === "number"
    ) {
      theme[fn] = {
        color: uint32ToHex(val.color),
        style: val.style,
      };
    }
  }
}

  renderList();
  localStorage.setItem('savedTheme', JSON.stringify(theme));
  showToast('Theme imported successfully.', 'success');
  importOverlay.style.display = 'none';
});


  // Helper: update preview styles from current tempStyle and color
  function updatePreview() {
    if (!currentFn) return;
    preview.style.color = theme[currentFn].color;
    preview.style.fontWeight = (tempStyle === 1 || tempStyle === 3) ? "bold" : "normal";
    preview.style.fontStyle = (tempStyle === 2 || tempStyle === 3) ? "italic" : "normal";
  }

  // Highlight active style button based on tempStyle
  function updateStyleButtonActive() {
    styleButtons.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.style) === tempStyle);
    });
  }

  // When clicking a style button
  styleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!currentFn) return;

      tempStyle = parseInt(btn.dataset.style);

      updatePreview();
      updateStyleButtonActive();
    });
  });

  // Handle edit and remove buttons on the list
  listContainer.addEventListener("click", (e) => {
    if (e.target.closest(".edit-btn")) {
      const btn = e.target.closest(".edit-btn");
      currentFn = btn.dataset.fn;

      // Load color and style from theme to temp variables
      const currentColor = theme[currentFn]?.color || "#8b5cf6";
      const currentStyle = theme[currentFn]?.style || 0;
      tempStyle = currentStyle;

      pickr.setColor(currentColor);
      hexInput.value = currentColor;

      updateStyleButtonActive();
      updatePreview();
      modal.classList.remove("hidden");
    } else if (e.target.closest(".remove-btn")) {
      const btn = e.target.closest(".remove-btn");
      fnToDelete = btn.dataset.fn;
      deleteModal.classList.remove("hidden");
    }
  });

  document.getElementById("close-modal").onclick = () => {
    modal.classList.add("hidden");
    currentFn = null;
  };

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      currentFn = null;
    }
  });

  document.getElementById("save-settings").onclick = () => {
    if (!currentFn) return;

    theme[currentFn].style = tempStyle;

    localStorage.setItem('savedTheme', JSON.stringify(theme));

    renderList();
    modal.classList.add("hidden");
    showToast(`Function "${currentFn}" updated.`, 'success');

    currentFn = null;
    tempStyle = 0;
  };

  cancelDeleteBtn.onclick = () => {
    fnToDelete = null;
    deleteModal.classList.add("hidden");
  };

  confirmDeleteBtn.onclick = () => {
    if (fnToDelete) {
      delete theme[fnToDelete];
      renderList();
      showToast(`Function "${fnToDelete}" removed.`, 'success');
      fnToDelete = null;
    }
    deleteModal.classList.add("hidden");
  };

  function updateBadgeColor(fn, color) {
    const cards = listContainer.children;
    for (let card of cards) {
      const nameSpan = card.querySelector('span.font-mono');
      if (nameSpan && nameSpan.textContent === fn) {
        const badge = card.querySelector('span.w-4.h-4.rounded-full');
        if (badge) badge.style.background = color;
        break;
      }
    }
  }

  const deleteAllBtn = document.getElementById('delete-all');
  const deleteAllModal = document.getElementById('delete-all-modal');
 const cancelDeleteAllBtn = document.getElementById('cancel-delete-all');
 const confirmDeleteAllBtn = document.getElementById('confirm-delete-all');

 deleteAllBtn.addEventListener('click', () => {
   deleteAllModal.classList.remove('hidden');
 });

 cancelDeleteAllBtn.addEventListener('click', () => {
  deleteAllModal.classList.add('hidden');
 });

 confirmDeleteAllBtn.addEventListener('click', () => {
  localStorage.removeItem('savedTheme');

  // Reset theme to baseItems
  Object.keys(theme).forEach(key => delete theme[key]);
  baseItems.forEach(item => {
    theme[item.name] = { color: item.color, style: item.style };
  });

  renderList();
  deleteAllModal.classList.add('hidden');
  showToast('Saved theme deleted and reset.', 'success');
 });

  const addFunctionBtn = document.getElementById("add-function-btn");
  const functionSelector = document.getElementById("function-selector");
  const functionSearch = document.getElementById("function-search");
  const functionList = document.getElementById("function-list");

  addFunctionBtn.onclick = () => {
    functionSelector.classList.toggle("hidden");
    addFunctionBtn.setAttribute(
      "aria-expanded",
      functionSelector.classList.contains("hidden") ? "false" : "true"
    );
    functionSearch.value = "";
    renderFunctionSearch();
    functionSearch.focus();
  };

  document.addEventListener("click", (e) => {
    if (
      !functionSelector.contains(e.target) &&
      !addFunctionBtn.contains(e.target)
    ) {
      functionSelector.classList.add("hidden");
      addFunctionBtn.setAttribute("aria-expanded", "false");
    }
  });

  function renderFunctionSearch() {
    functionList.innerHTML = "";
    const query = functionSearch.value.toLowerCase();
    allPossibleFunctions
      .filter((fn) => fn.toLowerCase().includes(query))
      .forEach((fn) => {
        if (theme[fn]) return;
        const li = document.createElement("li");
        li.className =
          "p-2 hover:bg-indigo-100 dark:hover:bg-indigo-700 cursor-pointer";
        li.textContent = fn;
        li.setAttribute("role", "option");
        li.onclick = () => {
          theme[fn.replace(/\[\]$/, '')] = { color: "#8b5cf6", style: 0 };
          renderList();
          functionSelector.classList.add("hidden");
          addFunctionBtn.setAttribute("aria-expanded", "false");
          showToast(`Function "${fn}" added successfully.`, 'success');
        };
        functionList.appendChild(li);
      });
  }

  functionSearch.addEventListener("input", renderFunctionSearch);

  // Hex to uint32
  function hexToUInt32(hex) {
    return parseInt(hex.replace("#", "0xFF"), 16) >>> 0;
  }

  // Generate JSON
  generateCodeBtn.onclick = () => {
    const baseKeys = [
      "defaultTextHighlight",
      "fallbackHighlight",
      "numberHighlight",
      "bracketHighlight",
      "semicolonHighlight",
    ];

    const baseJson = {};
    for (let i = 0; i < 5; i++) {
      const name = baseItems[i].name;
      if (theme[name]) {
        baseJson[baseKeys[i]] = {
          color: hexToUInt32(theme[name].color),
          style: theme[name].style,
        };
      }
    }

const funcHighlights = {};
Object.keys(theme).forEach((fn) => {

  if (fn === ";;;") return;

  if (!baseItems.slice(0, 4).some((item) => item.name === fn)) {
    funcHighlights[fn] = {
      color: hexToUInt32(theme[fn].color),
      style: theme[fn].style,
    };
  }
});
    const output = {
      ...baseJson,
      functionsHighlights: funcHighlights,
    };

    const outputTextArea = document.getElementById("output-text");
    outputTextArea.value = JSON.stringify(output, null, 2);

    showToast(`JSON output generated.`, 'success');
  };

  document.getElementById("copy-output").addEventListener("click", () => {
    const outputText = document.getElementById("output-text").value;
    if (outputText == "") {
      showToast(`No Code to Copy.`, 'error');
    } else {
      navigator.clipboard.writeText(outputText)
        .then(() => {
          const btn = document.getElementById("copy-output");
          btn.innerHTML = '<i class="fas fa-check mr-1"></i> Copied!';
          setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy mr-1"></i> Copy';
          }, 2000);
        })
        .catch(() => {
          const btn = document.getElementById("copy-output");
          btn.innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i> Failed';
          setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy mr-1"></i> Copy';
          }, 2000);
        });
      showToast(`Successfully Copied Code.`, 'success');
    }
  });

  function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.innerText = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }
