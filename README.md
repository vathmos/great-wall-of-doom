# Great Wall of Doom

Cross-browser extension scaffold for blocking "doom scrolling" sections across social media.

<p align="center">
  <img src="extension/icons/GWOD.png" alt="Randus logo" style="width:288px"/>
</p>

## Load the extension

### Chrome / Edge
1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable "Developer mode".
3. Click "Load unpacked" and select `extension`.

### Firefox
1. Open `about:debugging#/runtime/this-firefox`.
2. Click "Load Temporary Add-on".
3. Select `extension/manifest.json`.

## What it does
- Loads per-site rules that hide or redirect doom-scrolling sections.
- Uses CSS + DOM hooks at `document_start` to catch the first paint.

Current implementation:
- TikTok: redirects `/`, `/foryou`, `/explore` to `/following` and hides FYP/Explore nav items.

## Key files
- `extension/sites/`: per-site implementations (add new social media here).
- `extension/sites/tiktok/`: TikTok-specific logic and styles.
  - `config.js`: shared constants and URL/text helpers.
  - `ui.js`: style injection + nav item hiding + DOM observer.
  - `navigation.js`: redirects and click interception.
  - `style.css`: the base CSS rule.
