# 🎵 Drone

A free, open-source browser-based sustained reference tone generator for musicians at any level. No account, no installation, no server — just a single HTML file that runs entirely in your browser.

Built with vanilla HTML, CSS, and JavaScript. Powered by the Web Audio API.

---

## ✨ Features

- **Sustained reference tone** — plays continuously until stopped, providing a stable tonal centre for practice
- **4 voicings** — Root, Root + 5th, Power (root octave below + 5th + root), and Octaves (root + octave above)
- **4 timbres** — Warm (sawtooth with LFO-modulated lowpass), Tanpura (detuned sawtooths with sub-octave and tremolo), Organ (sine + harmonics), Pad (triangle with LFO-modulated lowpass)
- **Glitch-free transitions** — all parameter changes while playing use gain crossfades with linear ramps, preventing clicks and pops
- **Root note selector** — all 12 notes with enharmonic labels (C through B, with sharps and flats)
- **Octave range** — octaves 2–5, default 3
- **Volume control** — 0–100% with smooth gain ramping
- **Large play/stop button** — centred hero element with pulsing ring animation when active
- **Live note & frequency display** — shows the current root note and its frequency in Hz
- **5 themes** — Dark Gold, Clean & Minimal, Dark Studio, Retro Piano, Bright & Playful
- **Fully persistent settings** — theme, root note, octave, voicing, timbre, and volume are saved in `localStorage`
- **Help modal** — explains use cases, voicings, and timbres
- **Responsive** — works on desktop, tablet, and mobile (min 320px)
- **Zero dependencies** — no npm, no build step, no CDN libraries

---

## 🚀 Quick Start

### Option 1 — Just open it

Download `drone.html` and open it in any modern browser. That's it.

```
drone.html  ← this is the entire app
```

### Option 2 — Clone the repo

```bash
git clone https://github.com/pushplaybang/music-tools.git
cd music-tools
open src/drone.html   # macOS
# or
start src/drone.html  # Windows
# or
xdg-open src/drone.html  # Linux
```

No build step. No `npm install`. No server required.

---

## 🎛️ How to Use

### Starting the drone

1. Open `drone.html` in any modern browser.
2. Select a **Root Note** (e.g. A) and **Octave** (e.g. 3).
3. Choose a **Voicing** and **Timbre**.
4. Press the large **▶ play button** to start the drone.
5. Press again to stop.

### Choosing a voicing

| Voicing | Description |
|---|---|
| Root | A single sustained note |
| Root + 5th | Root plus the note 7 semitones above — a stable open fifth |
| Power | Root one octave below + fifth + root — full and powerful |
| Octaves | Root plus the root one octave above — rich and doubled |

### Choosing a timbre

| Timbre | Description |
|---|---|
| Warm | Sawtooth through a lowpass filter at 800 Hz with a slow LFO (0.3 Hz, ±200 Hz) on the cutoff. Smooth and mellow. |
| Tanpura | Two sawtooths per voice detuned ±2 cents, plus a quiet sine one octave below. Slow amplitude tremolo at 0.15 Hz. Shimmering and organic. |
| Organ | Sine wave with 2nd harmonic at −6 dB and 3rd harmonic at −12 dB. Clean and stable, no modulation. |
| Pad | Triangle through a lowpass filter at 1200 Hz with a slow LFO (0.2 Hz, ±300 Hz). Soft and ambient. |

### Adjusting volume

Use the **Volume** slider to control the overall loudness. Changes are applied smoothly with no clicks.

### Changing parameters while playing

All parameters (root note, octave, voicing, timbre) can be changed while the drone is playing. The tool crossfades between the old and new sound over 150 ms, ensuring seamless transitions with no pops or clicks.

---

## 🎯 Practice Ideas

### Intonation practice
Set the drone to the root of the key you're practising in. Play your instrument and listen carefully to how each note relates to the drone — notice the beating when notes are slightly out of tune and the stillness when they lock in.

### Scale practice
Choose a root note and play scales over the drone. This helps you internalise the sound and feel of each scale degree against the tonal centre.

### Vocal pitch matching
Use the drone as a target pitch for vocal exercises. Match the pitch, then practise singing intervals above and below.

### Interval recognition
Set the drone to a reference note and sing or play intervals against it. The constant reference makes it easier to hear the quality of each interval.

---

## 🎨 Design System

Drone shares the same 5-theme CSS custom property system as the Ear Trainer, Instrument Tuner, and Pulse. All colours, fonts, radii, and component variants are controlled by theme tokens. Themes switch instantly without a page reload and persist in `localStorage`.

| Theme | Fonts | Mood |
|---|---|---|
| Dark Gold | DM Serif Display + Space Mono | Warm, professional |
| Clean & Minimal | Instrument Serif + Syne | Light, editorial |
| Dark Studio | Syne + Space Mono | Dark, electronic |
| Retro Piano | Playfair Display | Vintage, warm dark |
| Bright & Playful | Nunito | Colourful, friendly |

Settings are stored under the key `musicTool_drone_v1` in `localStorage`.

---

## 🔊 Audio Architecture

### Glitch-free transitions

All gain changes use `linearRampToValueAtTime` with a minimum 0.02 s ramp. When parameters change during playback:

1. A new oscillator graph is built with gain at 0
2. The old graph's gain ramps to 0 over 0.15 s
3. The new graph's gain ramps up over 0.15 s
4. After the crossfade, the old graph is disconnected and cleaned up

This prevents pops, clicks, and oscillator node accumulation.

### Voice scaling

Each voicing can contain 1–3 voices. The per-voice gain is automatically scaled by `1 / voiceCount` to prevent clipping when multiple voices are active.

---

## 💬 Prompting Tips for Future Development with Claude

### Starting a new session

```
I'm continuing development on my Drone web app — a single-file HTML/CSS/JS 
tool using the Web Audio API. I'm attaching the current file.

Key facts:
- Single HTML file, no build step, no dependencies
- 5-theme CSS system using custom properties on [data-theme] selectors
- localStorage persistence via savePref(key, val) / loadPrefs()
- Modal overlay system: openModal(id) / closeModal(id)
- Settings key: `musicTool_drone_v1`
- Audio engine uses crossfade pattern: build new graph → ramp old down → ramp new up → destroy old
- Voicings: Root, Root + 5th, Power, Octaves
- Timbres: Warm, Tanpura, Organ, Pad

What I want to add next: [describe the feature]
```

### Audio notes

The drone uses a crossfade-on-rebuild pattern. Whenever a parameter changes (root, octave, voicing, timbre), the entire oscillator graph is rebuilt from scratch with gain at 0, then crossfaded in while the old graph fades out. This avoids the complexity of mutating individual oscillator frequencies and ensures clean transitions.

Volume changes do NOT rebuild the graph — they use `linearRampToValueAtTime` directly on the master gain node for instant feedback.

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
