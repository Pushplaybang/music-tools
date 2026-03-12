# 🎵 Ear Trainer

A free, open-source browser-based ear training tool for musicians at any level. No account, no installation, no server — just a single HTML file that runs entirely in your browser.

Built with vanilla HTML, CSS, and JavaScript. Powered by the Web Audio API.

![Ear Trainer screenshot placeholder](https://via.placeholder.com/860x480/0d0f12/e8b84b?text=Ear+Trainer)

---

## ✨ Features

- **15 scales & modes** — Major, Natural/Harmonic/Melodic Minor, all 7 diatonic modes, Pentatonic Major/Minor, Blues, Whole Tone, Diminished, and Chromatic
- **5 visualisers** — Piano keyboard, Treble staff with key signatures, Guitar fretboard, Bass fretboard, Ukulele fretboard
- **Alternative tunings** — 8 guitar tunings (Standard, Drop D, Open G/D/E/A, DADGAD, Eb), 4 bass tunings (Standard EADG, Drop D, Half Step Down, 5-String BEADG), and 5 ukulele tunings (Soprano re-entrant GCEA, Low G, Baritone, D Tuning, Open C)
- **3 ear training quiz modes**:
  - **Note Names** — hear a single note and identify it from the scale
  - **Intervals** — hear two notes and name the interval between them; options are limited to intervals present in the chosen scale
  - **Chords** — hear a diatonic chord and identify its quality (major, minor, dominant 7th, etc.); all chord tones are highlighted on the visualiser after answering
- **Weighted difficulty** — notes/intervals/chords you get wrong appear more frequently; correct answers reduce the weight
- **No-repeat logic** — the same question is never asked twice in a row
- **10-second countdown timer** with animated SVG ring
- **Root-first mode** — plays the tonic before the mystery note as a tonal anchor (Note Names and Intervals modes)
- **Score tracking** — correct, wrong, timeouts, and accuracy %, with an encouraging summary on reset
- **5 themes** — Dark Gold, Clean & Minimal, Dark Studio, Retro Piano, Bright & Playful
- **Fully persistent settings** — theme, scale, root, octave, tuning, visualiser, and toggle states are all saved in `localStorage`
- **Progression plan** — an 11-step beginner guide accessible from the toolbar
- **Help docs** — in-app feature reference accessible from the toolbar
- **Responsive** — works on desktop, tablet, and mobile
- **Zero dependencies** — no npm, no build step, no CDN libraries

---

## 🚀 Quick Start

### Option 1 — Just open it

Download `ear-trainer.html` and open it in any modern browser. That's it.

```
ear-trainer.html  ← this is the entire app
```

### Option 2 — Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/ear-trainer.git
cd ear-trainer
open ear-trainer.html   # macOS
# or
start ear-trainer.html  # Windows
# or
xdg-open ear-trainer.html  # Linux
```

No build step. No `npm install`. No server required.

---

## 🌐 Hosting on GitHub Pages

GitHub Pages lets you host the app for free at a public URL like `https://YOUR_USERNAME.github.io/ear-trainer/`. Here's how:

### Step 1 — Create a GitHub repository

1. Go to [github.com](https://github.com) and sign in (or create an account)
2. Click **New repository**
3. Name it something like `ear-trainer`
4. Set it to **Public** (required for free GitHub Pages)
5. Click **Create repository**

### Step 2 — Push your files

If you're comfortable with Git:

```bash
git init
git add ear-trainer.html README.md
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ear-trainer.git
git push -u origin main
```

Or use the GitHub web interface — drag and drop `ear-trainer.html` and `README.md` directly into the repository page.

### Step 3 — Enable GitHub Pages

1. In your repository, click **Settings**
2. Scroll down to **Pages** in the left sidebar
3. Under **Source**, select **Deploy from a branch**
4. Set the branch to `main` and the folder to `/ (root)`
5. Click **Save**

### Step 4 — Visit your live URL

After about 60 seconds, your app will be live at:

```
https://YOUR_USERNAME.github.io/ear-trainer/ear-trainer.html
```

> **Tip:** Rename `ear-trainer.html` to `index.html` before pushing and your URL will be the cleaner `https://YOUR_USERNAME.github.io/ear-trainer/` — GitHub Pages serves `index.html` automatically.

### Updating the app

Every time you push a new commit to `main`, GitHub Pages will automatically redeploy within a minute or two.

```bash
git add ear-trainer.html
git commit -m "Update: add chord quiz"
git push
```

---

## 🎨 Design System

The app uses a 5-theme CSS custom property system. All colours, fonts, radii, and component variants are controlled by theme tokens defined on `[data-theme]` selectors. Themes switch instantly without a page reload.

| Theme | Fonts | Mood |
|---|---|---|
| Dark Gold | DM Serif Display + Space Mono | Warm, professional |
| Clean & Minimal | Instrument Serif + Syne | Light, editorial |
| Dark Studio | Syne + Space Mono | Dark, electronic |
| Retro Piano | Playfair Display | Vintage, warm dark |
| Bright & Playful | Nunito | Colourful, friendly |

The companion file `music-tools-boilerplate.html` contains the full design system — all theme tokens, CSS components, the theme switcher, modal system, localStorage helpers, audio engine, and shared music data — ready to copy for building new tools in the same family.

---

## 🔮 Planned Features & Future Roadmap

The following features are planned for future iterations. Contributions and ideas are welcome.

### 🎸 Additional String Instruments

- **Mandolin** — GDAE tuning, 8 strings in 4 courses, unique fretboard pattern
- **Banjo** — 5-string open G tuning, with the characteristic re-entrant high G drone string
- **12-string guitar** — doubled string courses with octave/unison pairings shown
- **Lap steel / Dobro** — open tunings common in blues and country (Open E, Open G)

### 🎼 Arpeggio Quiz Mode

An extension of the chord quiz that presents chords broken into individual notes:

- Play chord tones one at a time (root → 3rd → 5th → 7th) ascending or descending
- Multiple arpeggio patterns — ascending, descending, alternating, random-order
- Configurable speed (BPM slider)
- Optional "identify the chord from its arpeggio" quiz variant
- Works with inversions so the lowest note isn't always the root

### 🧠 Additional Feature Ideas

**Melodic dictation** — play a short 3–5 note phrase from the current scale and ask the user to reconstruct it by clicking notes in order on the visualiser. A significant step up in difficulty that bridges passive listening and active musical memory.

**Relative pitch reference tones** — an optional reference pitch button that plays concert A (440Hz) or the tonic of the current key before any quiz, to help users develop a consistent internal pitch anchor.

**Tempo & rhythm integration** — play scale notes with a metronome click track at adjustable BPM. Useful for guitarists and pianists practising scale runs in time.

**Session history & progress chart** — a simple local chart showing accuracy per session over time, stored in `localStorage`. No server needed — just a visual record of improvement.

**MIDI output** — send notes to connected MIDI devices or DAWs via the Web MIDI API, turning the app into a practice partner for hardware synths and sound modules.

**Custom scale builder** — allow the user to define arbitrary interval patterns to create custom modes, microtonality experiments, or non-Western scales.

**Solfège mode** — display note names as Do/Re/Mi/Fa/Sol/La/Ti in either fixed-Do (C=Do always) or moveable-Do (tonic=Do always) systems, for users trained in solfège systems.

**Dark/light mode auto-detect** — use `prefers-color-scheme` to default to Dark Gold in dark mode and Clean & Minimal in light mode on first visit.

**Share configuration URL** — encode the current root, scale, and settings into the URL hash so a specific configuration can be bookmarked or shared (e.g. `#root=A&scale=Pentatonic+Minor&octave=4`).

---

## 💬 Prompting Tips for Future Development with Claude

This app was built and iterated on entirely through conversation with Claude. If you want to continue developing it — or build companion tools using the boilerplate — here are the patterns that work well.

### General approach

**Attach the current file to every new session.** Claude has no memory between conversations. Always paste or attach `ear-trainer.html` at the start of a new session, along with a brief description of what was last built. The summary at the top of the boilerplate is a good template for this context.

**Be specific about what to keep.** If you don't want something changed, say so explicitly: *"Don't change the audio engine or the quiz state logic — only modify the CSS for the card components."* Claude will otherwise optimise freely.

**Ask for one feature at a time when they're complex.** The chord quiz, interval trainer, and MIDI output are each significant features. Asking for all three at once will produce rushed, buggy code. Ask for one, test it, then move to the next.

### Starting a new session

Use this prompt structure to re-orient Claude quickly:

```
I'm continuing development on my Ear Trainer web app — a single-file HTML/CSS/JS 
tool using the Web Audio API. I'm attaching the current file.

Key facts:
- Single HTML file, no build step, no dependencies
- 5-theme CSS system using custom properties on [data-theme] selectors
- localStorage persistence via savePref(key, val) / loadPrefs()
- Modal overlay system: openModal(id) / closeModal(id)
- Settings key: `earTrainer_v6`

What I want to add next: [describe the feature]

Please [rewrite the full file / make surgical edits / explain the approach 
before coding].
```

### For surgical edits vs. full rewrites

- **Use surgical edits** (`str_replace` style) when changing less than ~100 lines and the rest of the file is stable. Ask Claude to show you the before/after diff first.
- **Use a full rewrite** when adding a large new system (like the chord quiz), because weaving new state management through existing code with small edits tends to introduce subtle bugs.

### Describing UI clearly

Claude responds well to layout described in spatial terms:

> *"The tuning dropdown should appear in the config grid as a 4th column, to the right of the octave selector. It should only be visible when the Guitar or Ukulele visualiser tab is active."*

Avoid vague requests like *"make it look nicer"* — instead describe the specific element, what's wrong with it, and what outcome you want.

### Preventing theme regressions

Theme styling is the most common thing to accidentally break. After any significant CSS change, test all 5 themes. If a theme looks wrong, tell Claude:

> *"The Retro Piano theme has lost its italic card titles and the top decorative stripe. The studio theme card title should be uppercase. Please restore these — here is what the [data-theme] overrides should look like: [paste the relevant CSS]."*

### Testing the audio engine

The Web Audio API behaves differently across browsers and can produce silent output if the `AudioContext` is created before a user gesture. If notes stop playing after a change, ask Claude:

> *"Check that all playTone calls go through getCtx() and that getCtx() resumes a suspended context. The audio broke after the last change — please diagnose without changing any other functionality."*

### Keeping localStorage clean

Each tool should use a unique localStorage key (e.g. `earTrainer_v5`, `chordQuiz_v1`) to avoid key collisions. If you increment the version number (e.g. from `v4` to `v5`), old saved preferences are ignored and the app starts fresh — useful after major structural changes.

---

## 🤝 Contributing

This is a personal project, but issues and pull requests are welcome. If you build something cool with the boilerplate, feel free to share it.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/chord-quiz`
3. Make your changes to `ear-trainer.html`
4. Test in at least two browsers (Chrome and Firefox recommended)
5. Test all 5 themes after any CSS changes
6. Open a pull request with a clear description of what changed and why

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
