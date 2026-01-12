(() => {
  // Shared constants and helpers for TikTok content scripts.
  const config = {
    followingUrl: "https://www.tiktok.com/following",
    guardIntervalMs: 600,
    blockedPaths: new Set(["/", "/foryou"]),
    blockedPrefixes: ["/explore"],
    blockedE2E: new Set(["nav-foryou", "nav-explore"]),
    blockedLabels: new Set(["foryou", "explore"]),
    styleId: "gwd-tiktok-style",
    styleText:
      ".css-bf8n6f-7937d88b--DivMainNavContainer.exb7d124 h2:nth-child(-n + 2) { display: none !important; }",
    navHeadingSelector:
      ".css-bf8n6f-7937d88b--DivMainNavContainer.exb7d124 h2:nth-child(-n + 2)",
    tooltipSelector: ".TUXTooltip-reference",
    tooltipClassSelector: "[class*='StyledTUXTooltip']"
  };

  const normalizePath = (path) => {
    if (!path) {
      return "/";
    }
    if (path.length > 1 && path.endsWith("/")) {
      return path.slice(0, -1);
    }
    return path;
  };

  const isBlockedPath = (path) => {
    if (!path) {
      return false;
    }
    if (config.blockedPaths.has(path)) {
      return true;
    }
    return config.blockedPrefixes.some((prefix) => path.startsWith(prefix));
  };

  const getAnchorPath = (anchor) => {
    const rawHref = anchor.getAttribute("href");
    if (!rawHref) {
      return null;
    }
    try {
      const url = new URL(rawHref, window.location.origin);
      if (url.origin !== window.location.origin) {
        return null;
      }
      return normalizePath(url.pathname);
    } catch (error) {
      return null;
    }
  };

  const normalizeText = (value) =>
    value.replace(/\s+/g, " ").trim().toLowerCase();

  const matchesBlockedText = (value) => {
    if (!value) {
      return false;
    }
    const normalized = normalizeText(value);
    if (!normalized) {
      return false;
    }
    const compact = normalized.replace(/\s+/g, "");
    return config.blockedLabels.has(compact);
  };

  globalThis.gwdTikTok = {
    config,
    utils: {
      normalizePath,
      isBlockedPath,
      getAnchorPath,
      normalizeText,
      matchesBlockedText
    }
  };
})();
