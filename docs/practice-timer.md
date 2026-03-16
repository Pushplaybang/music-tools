# ⏱️ Practice Timer

A free, open-source browser-based practice session planner and countdown timer for musicians at any level. No account, no installation, no server — just a single HTML file that runs entirely in your browser.

Built with vanilla HTML, CSS, and JavaScript. Powered by the Web Audio API.

---

## ✨ Features

- **Session builder** — create structured practice sessions from an ordered list of timed blocks, each with a label, duration, and colour
- **3 template presets** — Quick 30 (30 min), Full Hour (60 min), and Focused 20 (20 min) for instant session plans
- **Large countdown timer** — hero-sized MM:SS display with current block label and dual progress bars (block + overall session)
- **Transport controls** — play/pause, restart current block, skip to next block
- **Block chime** — a gentle two-note sine wave chime (C5→E5) plays between blocks via the Web Audio API
- **Session complete summary** — modal shows total time and per-block breakdown when a session finishes
- **Practice log** — completed sessions are automatically saved (up to 90 days of history)
- **This Week summary** — total minutes, session count, and consecutive-day streak displayed below the timer
- **14-day history chart** — SVG bar chart of daily practice minutes, accessible via the 📊 icon in the theme bar
- **Colour-coded blocks** — 6 theme-aware colour swatches per block for visual organisation
- **Reorder & delete** — move blocks up/down with arrow buttons, remove with ✕
- **5 themes** — Dark Gold, Clean & Minimal, Dark Studio, Retro Piano, Bright & Playful
- **Fully persistent** — theme, block list, and practice log saved in `localStorage`
- **Responsive** — works on desktop, tablet, and mobile (timer is usable one-handed)
- **Zero dependencies** — no npm, no build step, no CDN libraries

---

## 🚀 Quick Start

### Option 1 — Just open it

Download `practice-timer.html` and open it in any modern browser. That's it.

```
practice-timer.html  ← this is the entire app
```

### Option 2 — Clone the repo

```bash
git clone https://github.com/pushplaybang/music-tools.git
cd music-tools
open src/practice-timer.html   # macOS
# or
start src/practice-timer.html  # Windows
# or
xdg-open src/practice-timer.html  # Linux
```

No build step. No `npm install`. No server required.

---

## 🎛️ How to Use

### Building a session

1. Open `practice-timer.html` in any modern browser.
2. Click **+ Add Block** to create a new practice block.
3. Type a label (e.g. "Scales"), choose a duration from the dropdown, and optionally pick a colour swatch.
4. Add more blocks as needed. Use the ▲/▼ arrows to reorder, or ✕ to delete.

### Using templates

Click one of the template pills — **Quick 30**, **Full Hour**, or **Focused 20** — to instantly populate the session plan. If blocks already exist, you'll be asked to confirm before replacing them.

| Template | Total | Blocks |
|---|---|---|
| Quick 30 | 30 min | Warmup (5), Repertoire (15), Technique (10) |
| Full Hour | 60 min | Warmup (10), Scales (10), Repertoire (20), Sight Reading (10), Ear Training (10) |
| Focused 20 | 20 min | Warmup (5), Deep Practice (15) |

### Running the timer

1. Press the large **▶** play button to start the countdown.
2. The timer displays the current block label and counts down MM:SS.
3. A thin progress bar shows block progress; a second bar shows overall session progress.
4. Between blocks, a gentle two-note chime plays automatically.
5. Use **|◀** to restart the current block, or **▶|** to skip ahead.
6. Press **⏸** to pause at any time.

### Session completion

When all blocks finish, a summary modal appears showing total practice time and a per-block breakdown. The session is automatically logged.

### Viewing your practice history

- The **This Week** card below the timer shows your weekly total minutes, session count, and consecutive-day streak.
- Click the **📊** icon in the theme bar to open a 14-day history chart showing daily practice minutes as an SVG bar chart.

---

## 🎨 Design System

Practice Timer shares the same 5-theme CSS custom property system as all Music Tools. All colours, fonts, radii, and component variants are controlled by theme tokens. Themes switch instantly without a page reload and persist in `localStorage`.

| Theme | Fonts | Mood |
|---|---|---|
| Dark Gold | DM Serif Display + Space Mono | Warm, professional |
| Clean & Minimal | Instrument Serif + Syne | Light, editorial |
| Dark Studio | Syne + Space Mono | Dark, electronic |
| Retro Piano | Playfair Display | Vintage, warm dark |
| Bright & Playful | Nunito | Colourful, friendly |

### localStorage keys

| Key | Purpose |
|---|---|
| `musicTool_practiceTimer_v1` | Theme preference & session block list |
| `musicTool_practiceLog` | Practice history log (max 90 days) |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause |

---

## 💬 Prompting Tips for Future Development with Claude

### Starting a new session

```
I'm continuing development on my Practice Timer web app — a single-file
HTML/CSS/JS tool using the Web Audio API. I'm attaching the current file.

Key facts:
- Single HTML file, no build step, no dependencies
- 5-theme CSS system using custom properties on [data-theme] selectors
- localStorage persistence via savePref(key, val) / loadPrefs()
- Separate practice log LS key: musicTool_practiceLog
- Modal overlay system: openModal(id) / closeModal(id)
- Settings key: musicTool_practiceTimer_v1
- Blocks stored as array: [{label, duration, colorIdx}]
- Timer uses setInterval with 100ms ticks
- Chime between blocks: C5→E5 sine wave via Web Audio API

What I want to add next: [describe the feature]

Please [rewrite the full file / make surgical edits / explain the approach
before coding].
```

### Practice log data format

Each entry in the practice log follows this structure:

```json
{
  "date": "2026-03-15",
  "minutes": 30,
  "blocks": [
    { "label": "Warmup", "minutes": 5 },
    { "label": "Repertoire", "minutes": 15 },
    { "label": "Technique", "minutes": 10 }
  ]
}
```

The log is stored as a JSON array under `musicTool_practiceLog`, capped at 90 days.

---

## 🤝 Contributing

Issues and pull requests are welcome.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Test in at least two browsers (Chrome and Firefox recommended)
4. Test all 5 themes after any CSS changes
5. Open a pull request with a clear description of what changed and why

---

## 📄 Licence

Licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)**. Any commercial use — including incorporation into commercial products, revenue-generating activities, or distribution for a fee — is strictly prohibited without the express prior written permission of the copyright holder.

You are free to share and adapt this work for non-commercial purposes, provided you give appropriate credit and indicate any changes made.

Full licence text: [LICENSE.md](../LICENSE.md) · [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/legalcode)

---

## 👤 Author

Made with ♥ by **Paul van Zyl**

---

*Built with Claude by Anthropic.*
