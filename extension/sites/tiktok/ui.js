(() => {
  const root = globalThis.gwdTikTok;
  if (!root) {
    return;
  }

  const { config, utils } = root;
  let uiUpdateScheduled = false;

  const ensureStyle = () => {
    if (document.getElementById(config.styleId)) {
      return;
    }
    const style = document.createElement("style");
    style.id = config.styleId;
    style.textContent = config.styleText;
    const target = document.head || document.documentElement;
    if (target) {
      target.appendChild(style);
    }
  };

  const hideBySelector = () => {
    const nodes = document.querySelectorAll(config.navHeadingSelector);
    for (const node of nodes) {
      const container = node.closest("li,div,button,a");
      const target = container || node;
      target.style.setProperty("display", "none", "important");
    }
  };

  const hideByDataE2E = () => {
    const anchors = document.querySelectorAll("a[data-e2e]");
    for (const anchor of anchors) {
      const key = anchor.getAttribute("data-e2e");
      if (!key || !config.blockedE2E.has(key)) {
        continue;
      }
      const container =
        anchor.closest(config.tooltipSelector) ||
        anchor.closest(config.tooltipClassSelector) ||
        anchor.closest("div");
      const target = container || anchor;
      target.style.setProperty("display", "none", "important");
    }
  };

  const hideByLabel = () => {
    const containers = document.querySelectorAll("nav,[role='navigation']");
    for (const container of containers) {
      const candidates = container.querySelectorAll(
        "[aria-label],.TUXButton-label,h2,span"
      );
      for (const candidate of candidates) {
        const label =
          candidate.getAttribute("aria-label") || candidate.textContent || "";
        if (!utils.matchesBlockedText(label)) {
          continue;
        }
        const target = candidate.closest("li,div,button,a,h2") || candidate;
        target.style.setProperty("display", "none", "important");
      }
    }
  };

  const applyUiHides = () => {
    ensureStyle();
    hideBySelector();
    hideByDataE2E();
    hideByLabel();
  };

  const scheduleUiUpdate = () => {
    if (uiUpdateScheduled) {
      return;
    }
    uiUpdateScheduled = true;
    window.requestAnimationFrame(() => {
      uiUpdateScheduled = false;
      applyUiHides();
    });
  };

  const startObserver = () => {
    if (!document.documentElement) {
      return;
    }
    const observer = new MutationObserver(() => {
      scheduleUiUpdate();
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true
    });
  };

  root.ui = {
    ensureStyle,
    applyUiHides,
    scheduleUiUpdate,
    startObserver
  };

  // Run immediately to catch the first paint.
  ensureStyle();
  applyUiHides();
  startObserver();
})();
