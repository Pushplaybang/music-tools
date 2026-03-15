# 🥁 Pulse

A free, open-source browser-based visual metronome for musicians at any level. No account, no installation, no server — just a single HTML file that runs entirely in your browser.

Built with vanilla HTML, CSS, and JavaScript. Powered by the Web Audio API.

![Pulse screenshot placeholder](https://via.placeholder.com/860x480/0d0f12/e8b84b?text=Pulse+%E2%80%94+Visual+Metronome)

---

## ✨ Features

- **Visual beat grid** — animated beat dots light up in sync with the click; each dot represents one beat in the bar
- **3 accent levels per beat** — click any beat dot to cycle between normal, medium accent, and strong accent; accent level affects both click volume and visual brightness
- **BPM display with tempo name** — shows the current BPM alongside the Italian tempo marking (Larghissimo through Prestissimo)
- **Transport controls** — large play/stop button, ±1 and ±10 nudge buttons, and a BPM slider from 20–300
- **Tap tempo** — tap the **Tap** button (or press **T**) rhythmically; the app detects your tempo from up to the last 8 taps
- **Canvas pendulum arm** — a mechanical pendulum swings in sync with the beat; toggleable via the **Arm** chip
- **Click rate multiplier** — **½× / 1× / 2×** chip halves or doubles the effective click speed without changing the BPM readout; useful for practising at half-time or double-time feel
- **8 time signature presets** — 2/4, 4/4, 3/4, 6/8, 5/4, 7/8, 9/8, 12/8
- **Manual time signature** — configure Beats per Bar (2–12) and Note Value (quarter ♩, eighth ♪, half 𝅗𝅥) independently
- **Subdivisions** — none (beat only), 8ths, triplets, or 16ths; subdivision dots appear below the main beat dots; **click any subdivision dot** to cycle it through three accent levels — level 1 = 0.4× volume (quiet), level 2 = 0.7× (medium), level 3 = full volume (equal to a main accented beat)
- **Swing slider** — delays every even subdivision from 0–75% for a shuffle or jazz groove feel
- **Sound shaping** — four sliders:
  - **Volume** — overall click loudness
  - **Brightness** — from a muted woody thud to a crisp sharp click
  - **Envelope** — short = punchy & percussive, long = fuller & rounder
  - **Accent Boost** — how much louder accented beats hit relative to normal beats
- **Screen flash on Beat 1** — a subtle full-screen flash on the downbeat; toggleable
- **Audible subdivisions** — toggle whether subdivision clicks are heard or only shown visually
- **Progress bar** — thin bar below the beat grid fills across the bar and resets on Beat 1
- **Speed Trainer** — progressive tempo ramp: set a start BPM, end BPM, and duration (in bars or minutes). The metronome linearly interpolates from start to end BPM with a live progress bar
- **Count-In** — one-bar count-in: plays the click without animating the beat grid so you can prepare before the first "real" bar
- **Mute-Bar Training** — alternates between audible and silent bars (configurable 1–8 bars per phase). During silent bars the beat dots still animate while the grid dims, so you can self-assess your internal timing
- **5 themes** — Dark Gold, Clean & Minimal, Dark Studio, Retro Piano, Bright & Playful
- **Fully persistent settings** — theme, BPM, time signature, subdivision, swing, sound settings, beat accent levels, subdivision accent levels, and all toggle states are saved in `localStorage`
- **Keyboard shortcuts** — Space = play/stop · Arrow keys = ±1/±5 BPM · T = tap tempo
- **Responsive** — works on desktop, tablet, and mobile
- **Zero dependencies** — no npm, no build step, no CDN libraries

---

## 🚀 Quick Start

### Option 1 — Just open it

Download `pulse.html` and open it in any modern browser. That's it.

```
pulse.html  ← this is the entire app
```

### Option 2 — Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/ear-trainer.git
cd ear-trainer
open pulse.html   # macOS
# or
start pulse.html  # Windows
# or
xdg-open pulse.html  # Linux
```

No build step. No `npm install`. No server required.

---

## 🎛️ How to Use

### Starting the metronome

1. Open `pulse.html` in any modern browser.
2. Press the large **▶ play button** or hit **Space** to start the click.
3. Adjust the BPM using the ±1/±10 nudge buttons, the slider, or the arrow keys on your keyboard.
4. Press **Space** or the button again to stop.

### Setting the tempo by ear

Click the **Tap** button (or press **T**) in rhythm with the music you want to practise. After 2 taps the app will calculate an average BPM from your last 8 taps. The BPM display updates live as you tap.

### Choosing a time signature

Click one of the **Quick Preset** buttons (2/4, 4/4, 3/4, 6/8, 5/4, 7/8, 9/8, 12/8) to switch instantly. For unusual meters, use the **Beats per Bar** and **Note Value** dropdowns to configure any combination from 2/2 to 12/8.

### Customising accents

Each beat dot in the grid is clickable. Click once to add a medium accent (ring glows), click again for a strong accent (dot fills), click a third time to return to normal. Accented beats play louder and flash brighter. This is useful for polyrhythm practice, clave patterns, or any groove that needs a custom accent map.

### Adding subdivisions

Use the **Subdivision** selector to add 8th notes, triplets, or 16th notes between the main beats. Smaller dots appear below the beat dots. Toggle **Audible Subdivisions** off if you want the subdivision dots for visual reference only.

Each subdivision dot is also clickable. Click once to raise its accent to level 2 (medium — 0.7× volume), click again to raise it to level 3 (full volume, equal to a main accented beat), and a third click returns it to the default quiet level (0.4×). Subdivision accent levels are saved and restored with your other settings.

### Swing feel

Drag the **Swing** slider above 0% to delay every even subdivision. At 33% you get a gentle shuffle; at 66% you approach a hard swing feel. Swing only applies when a subdivision is active.

### Shaping the click sound

The **Sound Shaping** card gives you four controls:

| Control | Effect |
|---|---|
| Volume | Overall loudness of every click |
| Brightness | Low = woody, punchy; High = crisp, sharp |
| Envelope | Low = short attack/decay; High = longer, rounder click |
| Accent Boost | Gain increase applied to accented beats only |

### Pendulum arm

Click the **Arm** chip below the beat grid to show or hide the animated pendulum. The arm swings left-right in sync with every beat at the current BPM.

### Speed Trainer (progressive tempo)

1. Open the **Speed Trainer** card and click the **Enable** chip.
2. Set a **Start BPM** and **End BPM**.
3. Choose **Bars** (how many bars the ramp lasts) or **Minutes** (how many real-time minutes).
4. Set the **Duration** value.
5. Press **▶ Start** — the metronome begins at Start BPM and linearly ramps to End BPM over the chosen duration. A progress bar shows how far through the ramp you are.
6. When the ramp completes, the metronome stays at End BPM. Press **■ Stop** at any time to freeze at the current interpolated BPM.

Settings are persisted automatically; the active run state is not.

### Count-In

Toggle the **Count-in** chip in the main panel. When you press Play the metronome plays one full bar of clicks before normal operation begins. During the count-in the beat grid stays still and *Count-in…* appears in the tempo display, so you can prepare without visual distraction.

### Mute-Bar Training

Toggle the **Mute bars** chip in the main panel. A small number stepper appears — set how many bars play before the same number are muted (1–8, default 2). During the muted phase the click is silenced but the beat dots still animate, and the beat grid dims slightly as a visual cue. This lets you practise keeping time internally and self-assess whether you drift.

---

## 🌐 Hosting on GitHub Pages

GitHub Pages lets you host the metronome for free at a public URL like `https://YOUR_USERNAME.github.io/ear-trainer/pulse.html`.

1. Push the file to a public GitHub repository
2. Go to **Settings → Pages** and set the source to `main` branch, `/ (root)`
3. After about 60 seconds, your metronome will be live

Your metronome URL:

```
https://YOUR_USERNAME.github.io/ear-trainer/pulse.html
```

---

## 🎨 Design System

Pulse shares the same 5-theme CSS custom property system as the Ear Trainer and Instrument Tuner. All colours, fonts, radii, and component variants are controlled by theme tokens. Themes switch instantly without a page reload and persist in `localStorage`.

| Theme | Fonts | Mood |
|---|---|---|
| Dark Gold | DM Serif Display + Space Mono | Warm, professional |
| Clean & Minimal | Instrument Serif + Syne | Light, editorial |
| Dark Studio | Syne + Space Mono | Dark, electronic |
| Retro Piano | Playfair Display | Vintage, warm dark |
| Bright & Playful | Nunito | Colourful, friendly |

Settings are stored under the key `musicTool_pulse_v1` in `localStorage`.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Stop |
| `←` / `→` | −1 / +1 BPM |
| `↑` / `↓` | +5 / −5 BPM |
| `T` | Tap tempo |

---

## 💬 Prompting Tips for Future Development with Claude

### Starting a new session

```
I'm continuing development on my Pulse Visual Metronome web app — a single-file 
HTML/CSS/JS tool using the Web Audio API. I'm attaching the current file.

Key facts:
- Single HTML file, no build step, no dependencies
- 5-theme CSS system using custom properties on [data-theme] selectors
- localStorage persistence via savePref(key, val) / loadPrefs()
- Modal overlay system: openModal(id) / closeModal(id)
- Settings key: `musicTool_pulse_v1`
- Audio scheduling uses Web Audio clock (audioCtx.currentTime) with a look-ahead scheduler
- Beat grid is rebuilt in renderGrid() whenever time signature changes
- Beat accent state: accentLevels[beat] (values 1|2|3); sub-beat accent state: subAccentLevels[beat][subIdx] (values 1|2|3)
- cycleSubAccent(beat, subIdx) cycles sub-dot accent level and persists via saveAllPrefs()

What I want to add next: [describe the feature]

Please [rewrite the full file / make surgical edits / explain the approach 
before coding].
```

### Audio scheduling notes

The click engine uses a look-ahead scheduler pattern: a `setInterval` loop runs every ~25 ms and schedules any beats whose `scheduledTime` falls within the next 100 ms lookahead window. This decouples the visual tick (driven by `setTimeout`) from the audio clock, so the click stays rock-solid even if the browser's UI thread is busy.

When modifying the scheduler, preserve the `scheduleNote → playClick + visualTick` separation. `playClick` writes to the Web Audio graph at a precise future time; `visualTick` fires via `setTimeout` offset from `audioCtx.currentTime` to stay in sync with what the user hears.

### Swing implementation

Swing is applied by delaying every odd-indexed subdivision within a beat (indices 1, 3, 5… counting from 0) — i.e. the "and" of each beat in 8th-note feel. The delay amount is `sps * swingAmount` where `sps` is the seconds-per-subdivision slot. The downbeat of each beat (index 0) is never delayed.

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
