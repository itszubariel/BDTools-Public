// Section configuration for this page (set by page before including this script)
// These will be read from window.PAGE_SECTIONS when needed

interface PageSection {
  id: string;
  label: string;
}

interface PageLink {
  url: string;
  label: string;
}

let SECTIONS: PageSection[] = [];
let PREV_PAGE: PageLink | null = null;
let NEXT_PAGE: PageLink | null = null;

/* ── Copy URL helper ── */
function copyUrl(path: string): void {
  const base = "https://api.bdtools.xyz";
  navigator.clipboard
    .writeText(base + path)
    .then(() => showToast("URL copied!"));
}

/* ── Navigate between sections ── */
function navigateSection(direction: "prev" | "next"): void {
  const currentSection = document.querySelector(
    ".endpoint-section:not(.hidden)",
  );
  if (!currentSection) return;

  const currentId = currentSection.id;
  const currentIndex = SECTIONS.findIndex((s) => s.id === currentId);

  if (direction === "prev") {
    if (currentIndex > 0) {
      showSection(SECTIONS[currentIndex - 1].id);
    } else if (PREV_PAGE) {
      window.location.href = PREV_PAGE.url;
    }
  } else if (direction === "next") {
    if (currentIndex < SECTIONS.length - 1) {
      showSection(SECTIONS[currentIndex + 1].id);
    } else if (NEXT_PAGE) {
      window.location.href = NEXT_PAGE.url;
    }
  }
}

/* ── Update prev/next buttons ── */
function updateNavButtons(): void {
  const currentSection = document.querySelector(
    ".endpoint-section:not(.hidden)",
  );
  if (!currentSection) return;

  const currentId = currentSection.id;
  const currentIndex = SECTIONS.findIndex((s) => s.id === currentId);

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const prevText = document.getElementById("prevText");
  const nextText = document.getElementById("nextText");

  // Update prev button
  if (prevBtn && prevText) {
    if (currentIndex > 0) {
      prevText.textContent = SECTIONS[currentIndex - 1].label;
      prevBtn.style.display = "inline-flex";
    } else if (PREV_PAGE) {
      prevText.textContent = PREV_PAGE.label;
      prevBtn.style.display = "inline-flex";
    } else {
      prevBtn.style.display = "none";
    }
  }

  // Update next button
  if (nextBtn && nextText) {
    if (currentIndex < SECTIONS.length - 1) {
      nextText.textContent = SECTIONS[currentIndex + 1].label;
      nextBtn.style.display = "inline-flex";
    } else if (NEXT_PAGE) {
      nextText.textContent = NEXT_PAGE.label;
      nextBtn.style.display = "inline-flex";
    } else {
      nextBtn.style.display = "none";
    }
  }
}

// Override showSection to also update nav buttons
const originalShowSection = (window as any).showSection as
  | ((sectionId: string) => void)
  | undefined;
(window as any).showSection = function (sectionId: string): void {
  // Call the original showSection (which handles scroll, hiding/showing, etc.)
  if (typeof originalShowSection === "function") {
    originalShowSection(sectionId);
  }

  // Update nav buttons after section changes
  updateNavButtons();
};

// Initialize on DOMContentLoaded to ensure PAGE_SECTIONS is defined
document.addEventListener("DOMContentLoaded", function (): void {
  // Read the configuration from window (set by page-specific script)
  SECTIONS = (window as any).PAGE_SECTIONS || [];
  PREV_PAGE = (window as any).PREV_PAGE || null;
  NEXT_PAGE = (window as any).NEXT_PAGE || null;

  // Only initialize if we have sections configured
  if (SECTIONS.length > 0) {
    // Show first section
    if (typeof (window as any).showSection === "function") {
      (window as any).showSection(SECTIONS[0].id);
    }

    // Update nav buttons after showing first section
    // Use setTimeout to ensure DOM updates have completed
    setTimeout(() => {
      updateNavButtons();
    }, 0);
  }
});
