(() => {
  const root = globalThis.gwdTikTok;
  if (!root) {
    return;
  }

  const { config, utils, ui } = root;
  let hasLoaded = false;
  let guardTimer = null;

  const shouldRedirect = () => {
    const path = utils.normalizePath(window.location.pathname);
    return utils.isBlockedPath(path);
  };

  const redirectIfNeeded = () => {
    if (!shouldRedirect()) {
      return;
    }
    if (window.location.href.startsWith(config.followingUrl)) {
      return;
    }
    window.location.replace(config.followingUrl);
  };

  const startGuard = () => {
    if (guardTimer) {
      return;
    }
    // Keep steering SPA route changes back to /following.
    guardTimer = window.setInterval(() => {
      redirectIfNeeded();
    }, config.guardIntervalMs);
  };

  const wrapHistory = (method) => {
    const original = history[method];
    history[method] = function (...args) {
      const result = original.apply(this, args);
      if (hasLoaded) {
        redirectIfNeeded();
        startGuard();
        if (ui) {
          ui.scheduleUiUpdate();
        }
      }
      return result;
    };
  };

  const redirectAfterLoad = () => {
    if (document.readyState === "complete") {
      hasLoaded = true;
      redirectIfNeeded();
      startGuard();
      if (ui) {
        ui.applyUiHides();
      }
      return;
    }
    window.addEventListener(
      "load",
      () => {
        hasLoaded = true;
        window.setTimeout(redirectIfNeeded, 200);
        startGuard();
        if (ui) {
          ui.applyUiHides();
        }
      },
      { once: true }
    );
  };

  const handleNavClick = (event) => {
    // Intercept nav clicks before TikTok's handlers run.
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const anchor = target.closest("a[href]");
    const button = target.closest("button");
    const path = anchor ? utils.getAnchorPath(anchor) : null;
    const label =
      (anchor && anchor.textContent) ||
      (button && (button.getAttribute("aria-label") || button.textContent)) ||
      "";
    const e2e = anchor ? anchor.getAttribute("data-e2e") : null;
    if (e2e && config.blockedE2E.has(e2e)) {
      event.preventDefault();
      event.stopPropagation();
      window.location.replace(config.followingUrl);
      return;
    }
    if (path && !utils.isBlockedPath(path)) {
      return;
    }
    if (!path && !utils.matchesBlockedText(label)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    window.location.replace(config.followingUrl);
  };

  redirectAfterLoad();
  wrapHistory("pushState");
  wrapHistory("replaceState");
  window.addEventListener("popstate", () => {
    if (hasLoaded) {
      redirectIfNeeded();
      if (ui) {
        ui.scheduleUiUpdate();
      }
    }
  });
  document.addEventListener("click", handleNavClick, true);
})();
