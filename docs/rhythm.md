# 🎸 Rhythm

A free, open-source browser-based rhythm pattern trainer for learning strumming, tapping, and clapping patterns across genres. No account, no installation, no server — just a single HTML file that runs entirely in your browser.

Built with vanilla HTML, CSS, and JavaScript. Powered by the Web Audio API.

---

## ✨ Features

- **30 curated rhythm patterns** — across 9 genres (Folk, Rock, Pop, Blues, Jazz, Latin, Reggae, Country, Funk) at 3 difficulty levels
- **SVG rhythm grid** — visual pattern display with down arrows (▼), up arrows (▲), mutes (×), taps (◆), and rests (·); accented strokes shown larger and bolder
- **Beat and subdivision labels** — beat numbers below the grid, with "+" for ands and "e"/"a" for 16th-note subdivisions
- **Playback animation** — current subdivision highlighted with accent colour during playback, scrolling through like a sequencer
- **Play Along mode** — pattern loops continuously with click track; match your strumming to the grid
- **Call & Response mode** — the tool plays the pattern for N bars, then goes silent for one bar while the grid shows faded ghost positions; play the pattern from memory during the silent bar
- **Configurable response bars** — in Call & Response mode, set 1, 2, or 4 bars of the pattern before each silent bar
- **Click track** — metronome click on each main beat using the same synthesis as Pulse (noise + sine + bandpass); accent on beat 1
- **Pattern audio** — distinct sounds for downstrokes (~300 Hz), upstrokes (~500 Hz), mutes (~800 Hz), and taps; accented strokes are +40% louder
- **Separate volume controls** — independent sliders for click track and pattern audio so you can fade the pattern out as you learn it
- **Genre filter** — dropdown to filter patterns by genre (All, Folk, Rock, Pop, Blues, Jazz, Latin, Reggae, Country, Funk)
- **Difficulty filter** — segmented buttons (All, ⭐, ⭐⭐, ⭐⭐⭐) to filter by beginner, intermediate, or advanced
- **Pattern selector** — dropdown filtered by genre and difficulty, showing pattern name
- **BPM control** — slider (20–300 BPM) with tap tempo; defaults to the pattern's suggested BPM when a new pattern is selected
- **Tempo name display** — shows the Italian tempo marking alongside the BPM value
- **Multiple time signatures** — supports 4/4, 3/4, 6/8, 7/8, 12/8 and more
- **Multiple subdivision densities** — 3, 4, 6, 7, 8, 12, and 16 subdivisions per bar
- **5 themes** — Dark Gold, Clean & Minimal, Dark Studio, Retro Piano, Bright & Playful
- **Fully persistent settings** — theme, selected pattern, BPM, mode, volume levels, genre/difficulty filters, and response bar count are saved in `localStorage`
- **Help modal** — explains the grid notation, practice modes, and offers tips for internalising rhythm
- **Keyboard shortcuts** — Space = play/stop
- **Responsive** — works on desktop, tablet, and mobile; horizontal scroll for 16th-note patterns on narrow screens
- **Zero dependencies** — no npm, no build step, no CDN libraries

---

## 🚀 Quick Start

### Option 1 — Just open it

Download `rhythm.html` and open it in any modern browser. That's it.

```
rhythm.html  ← this is the entire app
```

### Option 2 — Clone the repo

```bash
git clone https://github.com/pushplaybang/music-tools.git
cd music-tools
node server.js
# Open http://localhost:3000/src/rhythm.html
```

---

## 🎓 How to Use

### Selecting a Pattern

1. Use the **Genre** dropdown to filter by style (Folk, Rock, Pop, Blues, Jazz, Latin, Reggae, Country, Funk)
2. Use the **Difficulty** buttons to filter by level (⭐ beginner, ⭐⭐ intermediate, ⭐⭐⭐ advanced)
3. Choose a pattern from the **Pattern** dropdown — the BPM will update to the pattern's suggested tempo

### Reading the Grid

The SVG rhythm grid displays one bar of the pattern:

| Symbol | Meaning |
|--------|---------|
| **▼** (filled triangle down) | Downstroke — strum towards the floor |
| **▲** (filled triangle up) | Upstroke — strum towards the ceiling |
| **×** | Mute — damp strings with palm, percussive dead strum |
| **◆** | Tap — a lighter percussive hit (fingerpicking patterns) |
| **·** (dot) | Rest — skip this slot |
| Larger / bolder symbols | Accented — play louder |

Numbers below show beat positions (1, 2, 3, 4…). The **+** symbol marks the "and" of each beat. In 16th-note patterns, **e** and **a** mark the additional subdivisions.

### Practice Modes

**Play Along** — The pattern loops continuously with a click track. The current subdivision is highlighted in the grid as it plays. Match your strumming to the highlighted position.

**Call & Response** — The tool plays the pattern for a set number of bars (the "call"), then goes silent for one bar (the "response"). During the silent bar, the grid still animates with faded/ghost positions so you can see what you should be playing. Use the **Bars before response** control to set 1, 2, or 4 bars of the pattern before each silent bar.

### Adjusting Tempo

- Use the **BPM slider** to set any tempo from 20 to 300 BPM
- Use the **Tap** button to detect tempo from your tapping (stores up to 8 taps, resets after 3 seconds of inactivity)
- When selecting a new pattern, the BPM automatically updates to the pattern's suggested starting tempo

### Volume Controls

- **Click Vol** — controls the volume of the metronome click track
- **Pattern Vol** — controls the volume of the pattern sounds (down, up, mute strokes)
- Gradually reduce the pattern volume as you learn the pattern to test your internalisation

---

## 🎵 Pattern Library

### Beginner (⭐)

| Pattern | Genre | Time | Description |
|---------|-------|------|-------------|
| All Downstrokes 4/4 | Rock | 4/4 | One downstroke per beat — great for punk rock and power chords |
| Basic Waltz 3/4 | Folk | 3/4 | Three downstrokes per bar in waltz time |
| Basic Folk Strum | Folk | 4/4 | D DU UDU — the foundation strum for acoustic guitar |
| Simple Pop Strum | Pop | 4/4 | D DU DU — bright, clean pop pattern |
| Boom-Chick Country | Country | 4/4 | Classic alternating bass note feel |
| Continuous Eighth Notes | Pop | 4/4 | Non-stop down-up alternation for stamina |

### Intermediate (⭐⭐)

| Pattern | Genre | Time | Description |
|---------|-------|------|-------------|
| Travis Picking Rhythm | Folk | 4/4 | Alternating bass with syncopated melody hits |
| Reggae Offbeat Skank | Reggae | 4/4 | Play on the offbeats only |
| Blues Shuffle | Blues | 4/4 | Triplet-based shuffle feel |
| Bossa Nova Basic | Latin | 4/4 | Gentle syncopated bossa nova pulse |
| Rock Power Strum | Rock | 4/4 | Driving pattern with muted upstrokes |
| Swing Jazz Comping | Jazz | 4/4 | Swing-feel comping with long-short phrasing |
| Basic Funk 16th | Funk | 4/4 | Entry-level funk with ghost mutes |
| Country Train Beat | Country | 4/4 | Driving 16th-note country groove |
| Calypso Strum | Latin | 4/4 | Sunny Caribbean syncopated feel |
| Motown Groove | Funk | 4/4 | Smooth, driving Motown rhythm |
| 6/8 Time Basic | Folk | 6/8 | Two groups of three — ballads and Irish music |
| Waltz Bass Alternation | Folk | 3/4 | Waltz with bass note on 1, chords on 2 and 3 |

### Advanced (⭐⭐⭐)

| Pattern | Genre | Time | Description |
|---------|-------|------|-------------|
| Full Funk 16th | Funk | 4/4 | All-out 16th-note funk with ghost mutes |
| Flamenco Rasgueado | Latin | 4/4 | Rapid multi-finger strum pattern |
| Bossa Nova Syncopated | Latin | 4/4 | Advanced bossa nova with full syncopation |
| Jazz Swing Anticipations | Jazz | 4/4 | Push anticipations for forward motion |
| Afrobeat Pattern | Funk | 4/4 | Fela Kuti-inspired interlocking rhythm |
| Reggae One Drop | Reggae | 4/4 | Beat 1 is empty — the soul of roots reggae |
| Progressive 7/8 | Rock | 7/8 | Odd-meter prog rock groove |
| Samba Pattern | Latin | 4/4 | Brazilian surdo + tamborim syncopation |
| New Orleans Second Line | Funk | 4/4 | Bouncing parade rhythm |
| 12/8 Blues | Blues | 12/8 | Slow, deep triplet subdivisions |
| Shuffle Triplet Feel | Blues | 4/4 | Full triplet shuffle with accented offbeats |
| Latin Montuno | Latin | 4/4 | Piano montuno adapted for guitar — engine of salsa |

---

## 🎨 Design System

Five themes, matching the rest of the Music Tools suite:

| Theme | Heading Font | Body Font | Accent |
|-------|-------------|-----------|--------|
| Dark Gold | DM Serif Display | Space Mono | #e8b84b |
| Clean & Minimal | Instrument Serif | Syne | #1a1a1a |
| Dark Studio | Syne (uppercase) | Space Mono | #c678f0 |
| Retro Piano | Playfair Display (italic) | Playfair Display | #d4a843 |
| Bright & Playful | Nunito (800 weight) | Nunito | #ff5fa0 |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play / Stop |

---

## 💡 Practice Tips

1. **Start slow** — begin at 60–80 BPM and increase gradually as the pattern feels natural
2. **Tap your foot** — keep a steady foot tap on each beat to lock in the pulse
3. **Count aloud** — say "1 and 2 and 3 and 4 and" (or "1 e and a" for 16th notes) while playing
4. **Keep your hand moving** — maintain constant down-up strumming motion even during rests
5. **Fade the pattern** — gradually reduce the Pattern Volume to test your internalisation
6. **Use Call & Response** — the silent bar forces you to play from memory, building muscle memory faster
7. **Focus on one genre** — use the genre filter to master one style before moving on

---

## 🔧 Technical Details

- **Audio engine** — Web Audio API with lookahead scheduler (`SCHED_AHEAD = 0.1s`, polling every 25ms)
- **Click synthesis** — noise burst + sine oscillator through bandpass filter (same as Pulse)
- **Pattern synthesis** — distinct bandpass frequencies for down (~300 Hz), up (~500 Hz), and mute (~800 Hz) strokes
- **Persistence** — all settings stored in `localStorage` under key `musicTool_rhythm_v1`
- **SVG rendering** — pattern grid rendered as inline SVG with dynamic generation based on pattern data

---

## 📜 License

[CC BY-NC 4.0](../LICENSE.md) — free to use and modify for non-commercial purposes.

---

## 👤 Author

Paul van Zyl — [GitHub](https://github.com/pushplaybang)
