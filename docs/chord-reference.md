# 🎶 Chord & Scale Reference

A free, open-source browser-based chord voicing and scale reference tool for musicians at any level. No account, no installation, no server — just a single HTML file that runs entirely in your browser.

Built with vanilla HTML, CSS, and JavaScript. Powered by the Web Audio API.

---

## ✨ Features

- **17 chord types** — Major, Minor, Dim, Aug, Sus2, Sus4, Maj7, Dom7, Min7, Half-Dim7, Dim7, MinMaj7, Add9, Maj9, Min9, 6, Min6
- **15 scales & modes** — Major, Natural/Harmonic/Melodic Minor, all 7 diatonic modes, Pentatonic Major/Minor, Blues, Whole Tone, Diminished, and Chromatic
- **Dual visualisers** — Interactive piano keyboard and guitar fretboard (standard tuning) shown side by side
- **Interval labels** — Every chord and scale tone is labelled with its interval (R, ♭3, 5, ♭7, etc.) or scale degree (1–7)
- **Guitar voicings** — Algorithmically generated chord voicings within 4-fret spans, scored for playability, with the top 3 shown as chord diagrams
- **Diatonic harmony** — For Major and Natural Minor scales, displays all triads and 7th chords built on each scale degree with Roman numeral analysis (I, ii, iii, IV, V, vi, vii°)
- **Clickable diatonic pills** — Each diatonic chord switches to Chords view with that root and type pre-selected
- **Audio playback** — Play chords as block voicings or arpeggiated, and scales ascending or descending
- **5 themes** — Dark Gold, Clean & Minimal, Dark Studio, Retro Piano, Bright & Playful
- **Fully persistent settings** — theme, root note, chord type, scale, and active mode are all saved in `localStorage`
- **Help modal** — in-app feature reference accessible from the toolbar
- **Responsive** — works on desktop, tablet, and mobile
- **Zero dependencies** — no npm, no build step, no CDN libraries

---

## 🚀 Quick Start

### Option 1 — Just open it

Download `chord-reference.html` and open it in any modern browser.

```
src/chord-reference.html  ← this is the entire tool
```

### Option 2 — Use the dev server

```bash
git clone https://github.com/pushplaybang/music-tools.git
cd music-tools
npm start
# Open http://localhost:3000/src/chord-reference.html
```

---

## 🎹 Chords View

### Configuration

- **Root Note** — Select from all 12 chromatic notes (C through B, with enharmonic labels like C#/Db)
- **Chord Type** — Choose from 17 chord qualities: triads (Major, Minor, Dim, Aug, Sus2, Sus4), 7th chords (Maj7, Dom7, Min7, Half-Dim7, Dim7, MinMaj7), and extended chords (Add9, Maj9, Min9, 6, Min6)

### Visualisers

Two visualiser panels are displayed side by side on desktop (stacked on mobile):

1. **Piano keyboard** — Two-octave keyboard with chord tones highlighted and labelled with their interval name (R, 3, 5, 7, etc.)
2. **Guitar fretboard** — Standard tuning (EADGBE), showing up to 3 algorithmically generated voicings as chord diagrams with interval labels, ✕ for muted strings, and ○ for open strings

### Note & Interval Display

Below the configuration, a summary shows the chord's notes (e.g. "C · E · G · B♭") with intervals below (e.g. "R · 3 · 5 · ♭7").

### Audio

- **▶ Play Chord** — Plays all chord tones simultaneously as a block chord
- **▶ Arpeggiate** — Plays chord tones one at a time, 150ms apart

---

## 🎵 Scales View

### Configuration

- **Root Note** — Same 12-note selector as Chords view
- **Scale / Mode** — 15 scales organised in optgroups:
  - **Major Modes** — Major, Dorian, Phrygian, Lydian, Mixolydian, Locrian
  - **Minor Scales** — Natural Minor, Harmonic Minor, Melodic Minor
  - **Pentatonic & Blues** — Pentatonic Major, Pentatonic Minor, Blues
  - **Symmetric & Other** — Chromatic, Whole Tone, Diminished

### Visualisers

Piano and guitar fretboard both show scale tones labelled with scale degrees (1, 2, 3, 4, 5, 6, 7).

### Diatonic Chords

For **Major** and **Natural Minor** scales, a Diatonic Chords section displays:

- **Triads** — All 7 diatonic triads with Roman numeral labels (e.g. I, ii, iii, IV, V, vi, vii°)
- **7th Chords** — All 7 diatonic 7th chords with Roman numeral labels

Each chord is a clickable pill that switches to Chords view with the correct root note and chord type pre-selected.

For other scales, a message indicates that diatonic chord analysis is available for Major and Natural Minor scales.

### Audio

- **▶ Play Scale Ascending** — Plays the scale ascending from root to octave
- **▼ Play Scale Descending** — Plays the scale descending from octave to root

---

## 🎸 Guitar Voicing Algorithm

The tool generates guitar chord voicings algorithmically:

1. For each starting fret position (0–12), evaluates all possible 6-string configurations where each string is either muted or plays a chord tone
2. All fretted notes must fall within a 4-fret span
3. Voicings are scored based on:
   - Root note in the bass voice (+10 points)
   - Number of strings sounding (+2 per string)
   - Lower fret positions preferred (+1 per fret below 5)
   - Open strings preferred (+1 per open string)
4. The top 3 highest-scoring distinct voicings are displayed

Standard tuning is used: E2–A2–D3–G3–B3–E4 (MIDI 40–45–50–55–59–64).

---

## 🎨 Design System

The tool uses the shared 5-theme CSS custom property system. All colours, fonts, radii, and component variants are controlled by theme tokens defined on `[data-theme]` selectors.

| Theme | Fonts | Mood |
|---|---|---|
| Dark Gold | DM Serif Display + Space Mono | Warm, professional |
| Clean & Minimal | Instrument Serif + Syne | Light, editorial |
| Dark Studio | Syne + Space Mono | Dark, electronic |
| Retro Piano | Playfair Display | Vintage, warm dark |
| Bright & Playful | Nunito | Colourful, friendly |

---

## 💾 Persistence

All settings are saved to `localStorage` under the key `musicTool_chordRef_v1`:

- Active mode (Chords / Scales)
- Root note selection (for both modes)
- Chord type
- Scale type
- Active theme

Settings are restored automatically on page load.

---

## 📄 Licence

Licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)**.

Full licence text: [LICENSE.md](../LICENSE.md) · [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/legalcode)

---

## 👤 Author

Made with ♥ by **Paul van Zyl**

---

*Built with Claude by Anthropic.*
