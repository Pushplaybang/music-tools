# 🎸 Instrument Tuner

A free, open-source browser-based chromatic tuner for guitar, bass, ukulele, and any other instrument. No account, no installation, no server — just a single HTML file that runs entirely in your browser.

Built with vanilla HTML, CSS, and JavaScript. Powered by the Web Audio API and the microphone input from your device.

---

## ✨ Features

- **Pitch history trace** — scrolling graph of pitch deviation over the last ~4 seconds; the in-tune zone is highlighted and the trace colour shifts green when you're within ±5 ¢
- **Needle cent meter** — shows your tuning offset in cents (100 cents = 1 semitone); the green zone indicates you're within ±2 cents (professional accuracy). The needle is EMA-smoothed to eliminate jitter; the text readout uses the raw detected value.
- **Input level bar** — thin bar below the trace shows microphone input volume (grey → amber → red); keep it in the amber range for accurate readings
- **Reference tone** — press 🔊 Play in the Target box to hear the target note through your speakers
- **In-tune indicator** — glowing dot in the top-left of the display lights up when you're within ±2 cents of your target note
- **Autodetect nearest note** — automatically identifies the closest note to the incoming pitch and measures offset from it; can be disabled to lock onto a specific target
- **3 instruments** — Guitar, Bass, Ukulele, plus a free-form Manual mode
- **Guitar tuning presets** (8 presets):
  - Standard (EADGBE)
  - Drop D (DADGBE)
  - Open G (DGDGBD)
  - Open D (DADF#AD)
  - Open E (EBEG#BE)
  - Open A (EAEAC#E)
  - DADGAD
  - Half Step Down (Eb)
- **Bass tuning presets** (4 presets):
  - Standard (EADG)
  - Drop D (DADG)
  - 5-String (BEADG)
  - Half Step Down
- **Ukulele tuning presets** (4 presets):
  - Soprano GCEA
  - Low G GCEA
  - Baritone (DGBE)
  - D Tuning (ADF#B)
- **Manual mode** — select any root note and octave to target any chromatic pitch
- **String buttons** — lock onto a specific string's target pitch with a single tap
- **Live frequency readout** — displays the detected frequency in Hz alongside the identified note
- **5 themes** — Dark Gold, Clean & Minimal, Dark Studio, Retro Piano, Bright & Playful
- **Fully persistent settings** — theme, instrument, tuning preset, selected string, and all toggle states are saved in `localStorage`
- **Responsive** — works on desktop, tablet, and mobile
- **Zero dependencies** — no npm, no build step, no CDN libraries

---

## 🚀 Quick Start

### Option 1 — Just open it

Download `tuner.html` and open it in any modern browser. When prompted, grant microphone access. That's it.

```
tuner.html  ← this is the entire app
```

### Option 2 — Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/ear-trainer.git
cd ear-trainer
open tuner.html   # macOS
# or
start tuner.html  # Windows
# or
xdg-open tuner.html  # Linux
```

No build step. No `npm install`. No server required.

> **Browser note:** Microphone access via `getUserMedia` requires a secure context (HTTPS or `localhost`). Opening the file directly from disk (`file://`) works in most browsers, but if you hit issues, serve it locally with any simple HTTP server.

---

## 🎛️ How to Use

### Tuning a string

1. Click the **🎤 microphone button** to activate the tuner. Grant microphone permission when prompted.
2. Select your **instrument** (Guitar, Bass, Ukulele, or Manual) from the dropdown.
3. Select a **tuning preset** if applicable.
4. Play a note on your instrument and watch the display:
   - The large **note name** shows the closest detected pitch.
   - The **pitch history trace** scrolls left, showing your deviation over time — aim to keep the line in the green band.
   - The **cent meter needle** points left for flat, right for sharp, and centres when in tune.
5. Tune your string until the trace sits in the green band and the glowing dot lights up (±2 cents).

### Locking onto a specific string

Click a **string button** (e.g. `E`, `A`, `D`) to lock the target to that string's pitch. The target note and frequency are shown in the reference box. The autodetect label below the string buttons confirms what the tuner is measuring.

### Hearing the target note

Press **🔊 Play** in the Target box to hear the target pitch through your speakers. Useful for double-checking by ear.

### Autodetect mode

With **Autodetect nearest note** enabled (default), the tuner identifies the closest chromatic note to whatever it hears — useful for chromatic tuning without selecting a string. Disable it to fix the target to your selected string only, ignoring other pitches.

### Manual mode

Select **Manual** from the instrument dropdown to enter free-form mode. Use the **Root Note** and **Octave** selectors to target any chromatic pitch — useful for instruments not covered by the presets (violin, cello, mandolin, etc.) or for checking specific harmonics.

---

## 🔬 How the Pitch Trace Works

The scrolling pitch history graph shows your deviation from the target (or nearest chromatic note) over the last ~4 seconds:

- **Y axis** — −50 to +50 cents (flat at bottom, sharp at top)
- **Centre dashed line** — perfect pitch (0 ¢)
- **Faint green band** — ±2 ¢ in-tune zone
- **Trace colour** — green when within ±5 ¢, accent colour when further out
- **Fade** — the oldest 20 % of the trace fades to transparent for a clean visual trail
- **Gaps** — appear when no pitch is detected (silence or noise below threshold)

The needle uses an exponential moving average (α = 0.15) to smooth out jitter. The text readout (+3¢ sharp) uses the raw detected value for precision.

---

## 🌐 Hosting on GitHub Pages

GitHub Pages lets you host the tuner for free at a public URL like `https://YOUR_USERNAME.github.io/ear-trainer/tuner.html`.

1. Push the file to a public GitHub repository
2. Go to **Settings → Pages** and set the source to `main` branch, `/ (root)`
3. After about 60 seconds, your tuner will be live

Your tuner URL:

```
https://YOUR_USERNAME.github.io/ear-trainer/tuner.html
```

> **Note:** GitHub Pages serves over HTTPS, which satisfies the secure context requirement for microphone access (`getUserMedia` requires HTTPS or `localhost`).

---

## 🎨 Design System

The tuner shares the same 5-theme CSS custom property system as the Ear Trainer. All colours, fonts, radii, and component variants are controlled by theme tokens. Themes switch instantly without a page reload and persist in `localStorage`.

| Theme | Fonts | Mood |
|---|---|---|
| Dark Gold | DM Serif Display + Space Mono | Warm, professional |
| Clean & Minimal | Instrument Serif + Syne | Light, editorial |
| Dark Studio | Syne + Space Mono | Dark, electronic |
| Retro Piano | Playfair Display | Vintage, warm dark |
| Bright & Playful | Nunito | Colourful, friendly |

Settings are stored under the key `musicTool_StrobeTuner_v1` in `localStorage`.

---

## 💬 Prompting Tips for Future Development with Claude

### Starting a new session

```
I'm continuing development on my Instrument Tuner web app — a single-file HTML/CSS/JS
tool using the Web Audio API and getUserMedia for microphone input. I'm attaching the
current file.

Key facts:
- Single HTML file, no build step, no dependencies
- 5-theme CSS system using custom properties on [data-theme] selectors
- localStorage persistence via savePref(key, val) / loadPrefs()
- Modal overlay system: openModal(id) / closeModal(id)
- Settings key: `musicTool_StrobeTuner_v1`
- Pitch detection via autocorrelation (autoCorrelate function)
- Pitch history trace via requestAnimationFrame (drawPitchTrace function)
- Ring buffer: traceBuffer[TRACE_SIZE=240], traceHead index
- Needle smoothing: smoothedCents EMA (α=0.15)

What I want to add next: [describe the feature]

Please [rewrite the full file / make surgical edits / explain the approach
before coding].
```

### Microphone and audio context notes

The Web Audio API requires a user gesture before creating or resuming an `AudioContext`. The mic toggle button satisfies this. If audio stops working after a change, verify that:

1. `AudioContext` is created inside the `toggleMic()` handler (not at module load time)
2. `getUserMedia` is called only after the context is created
3. The pitch detection loop (`detectLoop`) is started after mic stream is connected

### Pitch trace performance

The trace uses `requestAnimationFrame` and self-terminates when `micActive` is false. When making changes to `drawPitchTrace`, preserve this self-terminating loop pattern to avoid background CPU usage when the mic is off. The ring buffer holds 240 samples; each frame draws up to 239 line segments with per-segment globalAlpha.

---

## 🤝 Contributing

Issues and pull requests are welcome.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Test in at least two browsers (Chrome and Firefox recommended)
4. Test all 5 themes after any CSS changes
5. Test microphone access in both HTTP (`file://`) and HTTPS contexts
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
